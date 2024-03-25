import { Injectable, Logger, HttpException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, BadRequestException, BpmResponse, ClientMerchant, ClientMerchantUser, Currency, InternalErrorException, NoContentException, ResponseStauses, Role, Transaction, User, UserTypes, UsersRoleNames } from '..';
import { TransactionDto } from './transaction.dto';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as dateFns from 'date-fns'
import { DriverMerchant, DriverMerchantUser, TransactionTypes } from '@app/shared-modules';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

@Injectable()
export class TransactionService {

  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Currency) private readonly currenciesRepository: Repository<Currency>,
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    private rmqService: RabbitMQSenderService
  ) { }


  async createTransaction(transactionDto: TransactionDto, userId: number): Promise<BpmResponse> {
    try {
      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId } })
      const transaction: Transaction = new Transaction();
      const currency = await this.currenciesRepository.findOneOrFail({ where: { id: transactionDto.currencyId } });
      
      if(user.userType == UserTypes.ClientMerchantUser || user.userType == UserTypes.DriverMerchantUser) {
        if(!transactionDto.merchantId || isNaN(transactionDto.merchantId)) {
          throw new BadRequestException(ResponseStauses.MerchantIdIsRequired);
        }
        transaction.isMerchant = true;
        transaction.merchantId = transactionDto.merchantId;
      } else if(transactionDto.transactionType == TransactionTypes.TopUpAgentAccount && user.userType == UserTypes.Staff) {
        if(!transactionDto.agentId || isNaN(transactionDto.agentId)) {
          throw new BadRequestException(ResponseStauses.AgentIdIsRequired);
        }
        transaction.isAgent = true;
        const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: transactionDto.agentId } });
        transaction.agent = agent;
      }
      transaction.createdBy = user;
      transaction.currency = currency;
      transaction.userType = user.userType;
      transaction.amount = transactionDto.amount;
      transaction.transactionType = transactionDto.transactionType;
      transaction.comment = transactionDto.comment;

      const savedTransaction = await this.transactionsRepository.save(transaction);
      if (savedTransaction) {
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed)
      }
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.messgae)
      }
    }
  }

  async getMerchantTransactionById(sortBy: string, sortType: string, pageSize: string, pageIndex: string, userId: number, transactionType: string, fromDate: string, toDate: string): Promise<BpmResponse> {
    const size = +pageSize || 10; // Number of items per page
    const index = +pageIndex || 1
    if (!userId && isNaN(userId)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
     try {
      const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
      .select([
          't.id as id',
          't.amount as amount',
          't.rejected as rejected',
          't.verified as verified',
          't.transaction_type AS "transctionType"',
          'u.user_type AS "userType"',
          't.comment as comment',
          't.created_at AS "createdAt"',
          'cmu.username AS "createdBy"',
          'c.name AS "currencyName"'
      ])
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Currency, 'c', 'c.id = t.currency_id')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(ClientMerchantUser, 'cmu', 'cmu.user_id = u.id')
      .leftJoin(ClientMerchant, 'cm', 'cm.id = cmu.merchant_id')
      .where(`t.is_merchant = true AND cmu.user_id = ${userId}`)
      // Add condition for transactionType if provided
      if (transactionType) {
        queryBuilder.andWhere('t.transaction_type = :transactionType', { transactionType });
        console.log(transactionType)
      }
        if (fromDate && toDate) {
          queryBuilder.andWhere('t.created_at BETWEEN :fromDate AND :toDate', {
            fromDate: fromDate,
            toDate: toDate
          });
        } else if (fromDate) {
          queryBuilder.andWhere('t.created_at >= :fromDate', { fromDate: fromDate });
        } else if (toDate) {
          queryBuilder.andWhere('t.created_at <= :toDate', { toDate: toDate });
        }

      if (sortBy && sortType) { // Replace orderByCondition with your condition

        queryBuilder.orderBy(`${sortBy}`, `${sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC'}`);
      } else {
        queryBuilder.orderBy(`id`, 'DESC');
      }
      queryBuilder.andWhere(`(r.name = :superAdminName AND t.merchant_id = cm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
      queryBuilder.offset((index - 1) * size) // Skip the number of items based on the page number
      queryBuilder.limit(size); // Limit the number of items per page
     
      const transactions = await queryBuilder.getRawMany();

      const totalRecordsQuery = this.transactionsRepository.createQueryBuilder('t')
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(ClientMerchantUser, 'cmu', 'cmu.user_id = u.id')
      .leftJoin(ClientMerchant, 'cm', 'cm.id = cmu.merchant_id')
      .where(`t.is_merchant = true AND cmu.user_id = ${userId}`)
      .andWhere(`(r.name = :superAdminName AND t.merchant_id = cm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
      .getCount();

      const totalRecords = await totalRecordsQuery;
      const totalPages = Math.ceil(totalRecords / size);
      if (transactions) {
        return new BpmResponse(true, { content: transactions, totalPAgesCount: totalPages, pageIndex: index, pageSize: size }, []);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err.name instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getDriverMerchantTransactionById(sortBy: string, sortType: string, pageSize: string, pageIndex: string, userId: number, transactionType: string, fromDate: string, toDate: string): Promise<BpmResponse> {
    const size = +pageSize || 10; // Number of items per page
    const index = +pageIndex || 1
    if (!userId && isNaN(userId)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
     try {
      const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
      .select([
          't.id as id',
          't.amount as amount',
          't.rejected as rejected',
          't.verified as verified',
          't.transaction_type AS "transctionType"',
          'u.user_type AS "userType"',
          't.comment as comment',
          't.created_at AS "createdAt"',
          'dmu.username AS "createdBy"',
          'c.name AS "currencyName"'
      ])
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Currency, 'c', 'c.id = t.currency_id')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`t.is_merchant = true AND dmu.user_id = ${userId}`)
      // Add condition for transactionType if provided
      if (transactionType) {
        queryBuilder.andWhere('t.transaction_type = :transactionType', { transactionType });
        console.log(transactionType)
      }
        if (fromDate && toDate) {
          queryBuilder.andWhere('t.created_at BETWEEN :fromDate AND :toDate', {
            fromDate: fromDate,
            toDate: toDate
          });
        } else if (fromDate) {
          queryBuilder.andWhere('t.created_at >= :fromDate', { fromDate: fromDate });
        } else if (toDate) {
          queryBuilder.andWhere('t.created_at <= :toDate', { toDate: toDate });
        }

      if (sortBy && sortType) { // Replace orderByCondition with your condition

        queryBuilder.orderBy(`${sortBy}`, `${sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC'}`);
      } else {
        queryBuilder.orderBy(`id`, 'DESC');
      }
      queryBuilder.andWhere(`(r.name = :superAdminName AND t.merchant_id = dm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
      queryBuilder.offset((index - 1) * size) // Skip the number of items based on the page number
      queryBuilder.limit(size); // Limit the number of items per page
     
      const transactions = await queryBuilder.getRawMany();

      const totalRecordsQuery = this.transactionsRepository.createQueryBuilder('t')
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`t.is_merchant = true AND dmu.user_id = ${userId}`)
      .andWhere(`(r.name = :superAdminName AND t.merchant_id = dm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
      .getCount();

      const totalRecords = await totalRecordsQuery;
      const totalPages = Math.ceil(totalRecords / size);
      if (transactions) {
        return new BpmResponse(true, { content: transactions, totalPAgesCount: totalPages, pageIndex: index, pageSize: size }, []);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err.name instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getAdminMerchantTransactionById(sortBy: string, sortType: string, pageSize: string, pageIndex: string, userId: number, transactionType: string, fromDate: string, toDate: string): Promise<BpmResponse> {
    if (!userId && isNaN(userId)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }

    const size = +pageSize || 10; // Number of items per page
    const index = +pageIndex || 1
    try {
      const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
      .select([
          't.id as id',
          't.amount as amount',
          't.rejected as rejected',
          't.verified as verified',
          't.transaction_type AS "transctionType"',
          'u.user_type AS "userType"',
          't.comment as comment',
          't.created_at AS "createdAt"',
          'cmu.username AS "createdBy"',
          'c.name AS "currencyName"'
      ])
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Currency, 'c', 'c.id = t.currency_id')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(ClientMerchantUser, 'cmu', 'cmu.user_id = u.id')
      .leftJoin(ClientMerchant, 'cm', 'cm.id = cmu.merchant_id')
      .where(`t.is_merchant = true AND t.merchant_id = ${userId}`)
      .andWhere(`(r.name = :superAdminName AND t.merchant_id = cm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
      .skip((index - 1) * size) // Skip the number of items based on the page number
      .take(size); // 
  
      if (sortBy && sortType) { // Replace orderByCondition with your condition
        queryBuilder.orderBy(`${sortBy}`, `${sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC'}`);
      } else {
        queryBuilder.orderBy(`id`, 'DESC');
      }

      const transactions = await queryBuilder.getRawMany();
  
      if (transactions) {

        const totalRecordsQuery = this.transactionsRepository.createQueryBuilder('t')
        .leftJoin(User, 'u', 'u.id = t.created_by')
        .leftJoin(Role, 'r', 'r.id = u.role_id')
        .leftJoin(ClientMerchantUser, 'cmu', 'cmu.user_id = u.id')
        .leftJoin(ClientMerchant, 'cm', 'cm.id = cmu.merchant_id')
        .where(`t.is_merchant = true AND t.merchant_id = ${userId}`)
        .andWhere(`(r.name = :superAdminName AND t.merchant_id = cm.id) OR (r.name != :superAdminName AND t.created_by = ${userId})`, { superAdminName: 'Super admin' })
        .getCount();


        return new BpmResponse(true, { content: transactions, totalPAgesCount: totalRecordsQuery, pageIndex: index, pageSize: size }, []);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err.name instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getAgentTransactionsById(sortBy: string, sortType: string, pageSize: string, pageIndex: string, userId: number, transactionType: string, fromDate: string, toDate: string): Promise<BpmResponse> {
    if (!userId && isNaN(userId)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
      .select([
          't.id as id',
          't.amount as amount',
          't.rejected as rejected',
          't.verified as verified',
          't.transaction_type AS "transctionType"',
          'u.user_type AS "userType"',
          't.comment as comment',
          't.created_at AS "createdAt"',
          'a.username AS "createdBy"',
          'c.name AS "currencyName"'
      ])
      .leftJoin(User, 'u', 'u.id = t.created_by')
      .leftJoin(Currency, 'c', 'c.id = t.currency_id')
      .leftJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(Agent, 'a', 'a.id = t.agent_id')
      .where(`t.agent_id = ${userId}`)
      .skip((index - 1) * size) // Skip the number of items based on the page number
      .take(size); //
      
        
      if (sortBy && sortType) { // Replace orderByCondition with your condition
        queryBuilder.orderBy(`'${sortBy}'`, `${sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC'}`);
      } else {
        queryBuilder.orderBy(`id`, 'DESC');
      }
  
      const transactions = await queryBuilder.getRawMany();
  
      if (transactions.length) {

        const transactionsCount = await queryBuilder.getCount();

        return new BpmResponse(true, { content: transactions, totalPAgesCount: transactionsCount, pageIndex: index, pageSize: size }, []);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getTransactions(userId: number, transactionType: string, fromDate: string, toDate: string): Promise<BpmResponse> {
    try {
      if (!userId || isNaN(userId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }

      const filters: any = { deleted: false };
      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId }, relations: ['role'] })
      if(user.userType == UserTypes.ClientMerchantUser && user.role.name == UsersRoleNames.SuperAdmin) {
        filters.merchantId = user.userType == UserTypes.ClientMerchantUser ? user?.clientMerchant?.id : user?.driverMerchant?.id;
      } else {
        filters.createdBy = { id: userId }
      }

      if (transactionType) {
        filters.transactionType = transactionType;
      }

      if (fromDate && toDate) {
        filters.createdAt = Between(
          dateFns.parseISO(fromDate),
          dateFns.parseISO(toDate)
        );
      } else if (fromDate) {
        filters.createdAt = MoreThanOrEqual(dateFns.parseISO(fromDate));
      } else if (toDate) {
        filters.createdAt = LessThanOrEqual(dateFns.parseISO(toDate));
      }
      const data = await this.transactionsRepository.find({
        where: filters,
      });
      return new BpmResponse(true, data, null);
    } catch (error: any) {
      this.logger.error(`Error while fetching transactions: ${error.message}`, error.stack);
    }
  }

  async getMerchantBalance(id: number): Promise<BpmResponse> {
    if(!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    try {
    const topupTransactions: Transaction[] = await this.transactionsRepository.query(`
        SELECT
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' AND verified = true THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' AND verified = true THEN t.amount ELSE 0 END) as "activeTransactionBalance",
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS "activeSecureBalance",
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS "frozenBalance",
        c.name as currencyName
        FROM
            transaction t
        LEFT JOIN currency c on c.id = t.currency_id 
        WHERE
            t.merchant_id = ${id}
        GROUP BY
            c.name;
      `);

    return new BpmResponse(true, topupTransactions )
} catch(err: any) {
  console.log(err) 
  if (err instanceof HttpException) {
    throw err
  } else {
    throw new InternalErrorException(ResponseStauses.InternalServerError, err.messgae)
  } 
}
}

async getAgentBalance(id: number): Promise<BpmResponse> {
  if(!id || isNaN(id)) {
    throw new BadRequestException(ResponseStauses.IdIsRequired);
  }
  try {
  const topupTransactions: Transaction[] = await this.transactionsRepository.query(`
      SELECT
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUpAgentAccount}' THEN t.amount ELSE 0 END) -
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.DriverSubscriptionPayment}' THEN t.amount ELSE 0 END) AS activeBalance,
      c.name as currencyName
      FROM
          transaction t
      LEFT JOIN currency c on c.id = t.currency_id 
      WHERE
          t.agent_id = ${id}
      GROUP BY
          c.name;
    `);

  return new BpmResponse(true, topupTransactions )
} catch(err: any) {
console.log(err) 
if (err instanceof HttpException) {
  throw err
} else {
  throw new InternalErrorException(ResponseStauses.InternalServerError, err.messgae)
} 
}
}

  async cancelTransaction(id: number, user: User): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(user.userType !== UserTypes.Staff) {
        throw new UnauthorizedException('No access')
      }
      const isCanceled = await this.transactionsRepository.createQueryBuilder()
        .update(Transaction)
        .set({ canceled: true })
        .where("id = :id", { id })
        .execute();
      if (isCanceled.affected) {
        return new BpmResponse(true, 'Successfully canceled', null);
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
    catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async verifyTransaction(id: number, user: User): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(user.userType !== UserTypes.Staff) {
        throw new UnauthorizedException('No access')
      }
      const transaction: Transaction = await this.transactionsRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['createdBy', 'currency'] })

      const account = await this.getMerchantBalanceByCurrency(transaction.id, transaction.currency?.id);
      if(+account.activeBalance < +transaction.amount) {
        throw new BadRequestException(ResponseStauses.NotEnoughBalance)
      }
      if(transaction.verified) {
        throw new BadRequestException(ResponseStauses.AlreadyVerified)
      }
      if(transaction.rejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejecteed)
      }
      transaction.verified = true;
      await this.transactionsRepository.save(transaction);
        await this.rmqService.sendTransactionVerifiedMessage({ userId: transaction.createdBy?.id, transactionId: transaction.id })
        return new BpmResponse(true, 'Successfully verified', null);
    }
    catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async rejectTransaction(id: number, user: User): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(user.userType !== UserTypes.Staff) {
        throw new UnauthorizedException('No access')
      }
      const transaction: Transaction = await this.transactionsRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['createdBy'] })
      if(transaction.verified) {
        throw new BadRequestException(ResponseStauses.AlreadyVerified)
      }
      if(transaction.rejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejecteed)
      }
      transaction.rejected = true;
      await this.transactionsRepository.save(transaction);
      await this.rmqService.sendTransactionRejectedMessage({ userId: transaction.createdBy?.id, transactionId: transaction.id })
      return new BpmResponse(true, 'Successfully canceled', null);
    }
    catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }


  async getMerchantBalanceByCurrency(id: number, currencyId: string) {
    const transactions = await this.transactionsRepository.query(`
    SELECT
    SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' AND verified = true THEN t.amount ELSE 0 END) -
    SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' AND verified = true THEN t.amount ELSE 0 END) -
    SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance,
    SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance
    FROM
        transaction t
    WHERE
        t.merchant_id = ${id} AND t.currency_id = '${currencyId}'
  `);
    return transactions[0]
  }

}