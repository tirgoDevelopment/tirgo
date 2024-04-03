import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AwsService, BpmResponse, ClientMerchant, InternalErrorException, ResponseStauses, SundryService, User, CreateClientMerchantDto, NotFoundException, UserTypes, CreateInStepClientMerchantDto, CompleteClientMerchantDto, ClientBankAccount, CreateClientMerchantUserDto, ClientMerchantUser, Role, ClientMerchantDto, BadRequestException, NoContentException, Transaction, TransactionTypes, Currency } from '../..';
import * as dateFns from 'date-fns'

@Injectable()
export class ClientMerchantsService {

  constructor(
    @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
    @InjectRepository(ClientMerchantUser) private readonly clientMerchantUsersRepository: Repository<ClientMerchantUser>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(ClientBankAccount) private readonly bankAccountRepository: Repository<ClientBankAccount>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Currency) private readonly currrenciesRepository: Repository<Currency>,
    private sundriesService: SundryService,
    private awsService: AwsService,
    private dataSource: DataSource
  ) { }

  async createClientMerchant(createClientMerchantDto: CreateClientMerchantDto) {
    try {

      if (!(/[a-zA-Z]/.test(createClientMerchantDto.password) && /\d/.test(createClientMerchantDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      const passwordHash = await this.sundriesService.generateHashPassword(createClientMerchantDto.password);
      const clientMerchant: ClientMerchant = await this.clientMerchantsRepository.create();
      clientMerchant.user = await this.usersRepository.save({ userType: UserTypes.ClientMerchant, password: passwordHash });
      clientMerchant.email = createClientMerchantDto.email;
      clientMerchant.phoneNumber = createClientMerchantDto.phoneNumber;
      clientMerchant.companyName = createClientMerchantDto.companyName;
      clientMerchant.companyType = createClientMerchantDto.companyType;

      const newClientMerchant = await this.clientMerchantsRepository.save(clientMerchant);
      if (newClientMerchant) {
        return new BpmResponse(true, newClientMerchant, null)
      }
    } catch (err: any) {
      console.log(err)
      if (err.code == '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async createInStepMerchant(files: any, createMerchantDto: CreateInStepClientMerchantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: +createMerchantDto.merchantId } });

      merchant.supervisorFirstName = createMerchantDto.supervisorFirstName;
      merchant.supervisorLastName = createMerchantDto.supervisorLastName;
      merchant.responsiblePersonFistName = createMerchantDto.responsiblePersonFistName;
      merchant.responsiblePersonLastName = createMerchantDto.responsiblePersonLastName;
      merchant.responsbilePersonPhoneNumber = createMerchantDto.responsbilePersonPhoneNumber;
      merchant.factAddress = createMerchantDto.factAddress;
      merchant.legalAddress = createMerchantDto.legalAddress;

      if (files) {
        const fileUploads = []
        if (files.registrationCertificateFilePath && files.registrationCertificateFilePath[0]) {
          merchant.registrationCertificateFilePath = files.registrationCertificateFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.registrationCertificateFilePath[0])
        }
        if (files.transportationCertificateFilePath && files.transportationCertificateFilePath[0]) {
          merchant.transportationCertificateFilePath = files.transportationCertificateFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.transportationCertificateFilePath[0])
        }
        if (files.passportFilePath && files.passportFilePath[0]) {
          merchant.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.passportFilePath[0])
        }
        if (files.logoFilePath && files.logoFilePath[0]) {
          merchant.logoFilePath = files.logoFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.logoFilePath[0])
        }
        // Upload files to AWS
        const res = await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.ClientMerchant, file)));
        if (!res) {
          throw new Error('Create file failed')
        }
      }

      const newMerchant = await queryRunner.manager.save(ClientMerchant, merchant);
      await queryRunner.commitTransaction();
      if (newMerchant) {
        return new BpmResponse(true, newMerchant, null)
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async completeMerchant(completeMerchantDto: CompleteClientMerchantDto) {
    try {
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: completeMerchantDto.merchantId } });

      merchant.bankName = completeMerchantDto.bankName || merchant.bankName;
      merchant.inn = completeMerchantDto.inn || merchant.inn;
      merchant.taxPayerCode = completeMerchantDto.taxPayerCode || merchant.taxPayerCode;
      merchant.oked = completeMerchantDto.oked || merchant.oked;
      merchant.mfo = completeMerchantDto.mfo || merchant.mfo;
      merchant.dunsNumber = completeMerchantDto.dunsNumber || merchant.dunsNumber;
      merchant.ibanNumber = completeMerchantDto.ibanNumber || merchant.ibanNumber;
      merchant.notes = completeMerchantDto.notes || merchant.notes;
      merchant.completed = true;
      if (!completeMerchantDto.bankAccounts || !completeMerchantDto.bankAccounts.length) {
        throw new BadRequestException(ResponseStauses.BankAccountIsRequired);
      }

      for (let account of completeMerchantDto.bankAccounts) {
        if (!account.currencyId || !account.account) {
          throw new BadRequestException(ResponseStauses.InvalidBankAccount)
        }
      }

      const newMerchant = await this.clientMerchantsRepository.save(merchant);
      const currencies = await this.currrenciesRepository.find({ where: { active: true } })
      const bankAccounts: any[] = completeMerchantDto.bankAccounts.map((el: any) => {
        return {
          clientMerchant: newMerchant,
          currency: currencies.find((cur: any) => cur.id == el.currencyId),
          account: el.account
        }
      });
      await this.bankAccountRepository.createQueryBuilder()
        .insert()
        .into(ClientBankAccount)
        .values(bankAccounts)
        .execute();
      if (newMerchant) {
        return new BpmResponse(true, newMerchant, null)
      }
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async updateClientMerchant(files: any, updateMerchantDto: ClientMerchantDto): Promise<BpmResponse> {
    try {

      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: updateMerchantDto.id } });

      // merchant.registrationCertificateFilePath = updateMerchantDto.registrationCertificateFilePath || merchant.registrationCertificateFilePath;
      // merchant.transportationCertificateFilePath = updateMerchantDto.transportationCertificateFilePath || merchant.transportationCertificateFilePath;
      // merchant.passportFilePath = updateMerchantDto.passportFilePath || merchant.passportFilePath;
      // merchant.logoFilePath = updateMerchantDto.logoFilePath || merchant.logoFilePath;

      merchant.phoneNumber = updateMerchantDto.phoneNumber || merchant.phoneNumber;
      merchant.companyName = updateMerchantDto.companyName || merchant.companyName;
      merchant.responsiblePersonLastName = updateMerchantDto.responsiblePersonLastName || merchant.responsiblePersonLastName;
      merchant.responsiblePersonFistName = updateMerchantDto.responsiblePersonFistName || merchant.responsiblePersonFistName;
      merchant.notes = updateMerchantDto.notes || merchant.notes;
      merchant.mfo = updateMerchantDto.mfo || merchant.mfo;
      merchant.inn = updateMerchantDto.inn || merchant.inn;
      merchant.oked = updateMerchantDto.oked || merchant.oked;
      merchant.dunsNumber = updateMerchantDto.dunsNumber || merchant.dunsNumber;
      merchant.ibanNumber = updateMerchantDto.ibanNumber || merchant.ibanNumber;
      merchant.supervisorFirstName = updateMerchantDto.supervisorFirstName || merchant.supervisorFirstName;
      merchant.supervisorLastName = updateMerchantDto.supervisorLastName || merchant.supervisorLastName;
      merchant.legalAddress = updateMerchantDto.legalAddress || merchant.legalAddress;
      merchant.factAddress = updateMerchantDto.factAddress || merchant.factAddress;
      merchant.bankName = updateMerchantDto.bankName || merchant.bankName;
      merchant.taxPayerCode = updateMerchantDto.taxPayerCode || merchant.taxPayerCode;
      merchant.responsbilePersonPhoneNumber = updateMerchantDto.responsbilePersonPhoneNumber || merchant.responsbilePersonPhoneNumber;

      if (updateMerchantDto.bankAccounts) {
        const currencies = await this.currrenciesRepository.find({ where: { active: true } })
        const bankAccounts: any[] = updateMerchantDto.bankAccounts.map((el: any) => {
          return {
            clientMerchant: merchant,
            currency: currencies.find((cur: any) => cur.id == el.currencyId),
            account: el.account
          }
        });
        await this.bankAccountRepository.createQueryBuilder()
          .insert()
          .into(ClientBankAccount)
          .values(bankAccounts)
          .execute();
      }

      const updatedMerchant = await this.clientMerchantsRepository.update({ id: merchant.id }, merchant);
      if (updatedMerchant) {
        return new BpmResponse(true, updatedMerchant, null);
      }

    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async verifyMerchant(id: number, user: User): Promise<BpmResponse> {
    if(user.userType !== UserTypes.Staff) {
      throw new BadRequestException(ResponseStauses.AccessDenied);
    }
    if (!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id }, relations: ['user'] });
      if (merchant) {
        if (merchant.verified) {
          throw new BadRequestException(ResponseStauses.MerchantAlreadyVerified)
        } else if(merchant.rejected) {
          throw new BadRequestException(ResponseStauses.AlreadyRejecteed);
        }

        merchant.verified = true;
        merchant.verifiedAt = new Date()
        merchant.verifiedBy = user;
        const verified = await this.clientMerchantsRepository.save(merchant);

        if (verified) {
          const role = (await this.rolesRepository.findOne({ where: { name: 'Super admin' } }));
          const user: User = await this.usersRepository.save({ userType: UserTypes.ClientMerchantUser, password: merchant.user.password, role: role });

          const clientMerchantUser: ClientMerchantUser = new ClientMerchantUser();
          clientMerchantUser.user = user;
          clientMerchantUser.clientMerchant = merchant;
          clientMerchantUser.fullName = merchant.supervisorFirstName + ' ' + merchant.supervisorLastName;
          clientMerchantUser.username = merchant.email;
          clientMerchantUser.phoneNumber = merchant.phoneNumber;

          const newMerchantUser = await this.clientMerchantUsersRepository.save(clientMerchantUser);
          await queryRunner.commitTransaction();
          return new BpmResponse(true, newMerchantUser, [ResponseStauses.SuccessfullyVerified]);
        }
      } else {
        throw new NotFoundException(ResponseStauses.MerchantNotFound);
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async rejectMerchant(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneByOrFail({ id });
      if(merchant.verified) {
        throw new BadRequestException(ResponseStauses.AlreadyVerified);
      } else if(merchant.rejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejecteed);
      }

      merchant.rejected = true;
      merchant.rejectedAt = new Date();
      merchant.rejectedBy = user;

      await this.clientMerchantsRepository.save(merchant);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyRejected]);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async blockMerchant(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneByOrFail({ id });
      if(merchant.blocked) {
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      merchant.blocked = true;
      merchant.blockedAt = new Date();
      merchant.blockedBy = user;

      await this.clientMerchantsRepository.save(merchant);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyRejected]);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async unblockMerchant(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneByOrFail({ id });
      if(!merchant.blocked) {
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      merchant.blocked = false;
      merchant.blockedAt = null;
      merchant.blockedBy = null;

      await this.clientMerchantsRepository.save(merchant);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyRejected]);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async deleteMerchant(id: number): Promise<BpmResponse> {
    try {
      const clientMerchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id } });
      if(clientMerchant.deleted) {
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }
  
      clientMerchant.deleted = true;
      clientMerchant.phoneNumber = '_'+clientMerchant.phoneNumber;
  
      await this.clientMerchantsRepository.save(clientMerchant);
  
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
    } catch(err: any) {
      throw new InternalErrorException(ResponseStauses.InternalServerError);
    }
  } 

  async findMerchantById(id: number) {
    try {
      const data = await this.clientMerchantsRepository.findOneOrFail({ where: { id, blocked: false }, relations: ['bankAccounts', 'bankAccounts.currency', 'user'] });

      const balances: Transaction[] = await this.transactionsRepository.query(`
        SELECT
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance,
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance,
        c.name as currencyName
        FROM
            transaction t
        LEFT JOIN currency c on c.id = t.currency_id
        WHERE
            t.merchant_id = ${id}
        GROUP BY
            c.name;
      `);
      return new BpmResponse(true, Object.assign(data, { balances }), null);
    }
    catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getMerchants() {
    return await this.clientMerchantsRepository.find()
  }

  async getUnverifiedMerchants(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }
      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({
        where: { completed: true, verified: false, rejected: false },
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {

        const merchantsCount = await this.clientMerchantsRepository.count({ where: { completed: true, verified: false, rejected: false } });
        const totalPagesCount = Math.ceil(merchantsCount / size);
        return new BpmResponse(true, { content: merchants, totalPagesCount, pageIndex: index, pageSize: size }, null);
      } else {
        throw new NoContentException();
      }
    }
    catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getVerifiedMerchants(id: number, pageSize: string, pageIndex: string, sortBy: string, sortType: string, companyName: string, createdAtFrom: string, createdAtTo: string): Promise<BpmResponse> {
    try {

      const filter: any = { completed: true, verified: true, rejected: false, deleted: false };
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }
      if (id) {
        filter.id = +id;
      }
      if (companyName) {
        filter.companyName = companyName;
      }
      if (createdAtFrom && createdAtTo) {
        filter.createdAt = Between(
          dateFns.parseISO(createdAtFrom),
          dateFns.parseISO(createdAtTo)
        );
      } else if (createdAtFrom) {
        filter.createdAt = MoreThanOrEqual(dateFns.parseISO(createdAtFrom));
      } else if (createdAtTo) {
        filter.createdAt = LessThanOrEqual(dateFns.parseISO(createdAtTo));
      }


      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({
        where: filter, relations: ['bankAccounts', 'bankAccounts.currency'], order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });

      for (let merchant of merchants) {
        const topupTransactions: Transaction[] = await this.transactionsRepository.query(`
        SELECT
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance,
        SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance,
        c.name as currencyName
        FROM
            transaction t
        LEFT JOIN currency c on c.id = t.currency_id
        WHERE
            t.merchant_id = ${merchant.id}
        GROUP BY
            c.name;
      `);
        merchant['balances'] = topupTransactions;
      }

      const merchantsCount = await this.clientMerchantsRepository.count({ where: filter });
      const totalPagesCount = Math.ceil(merchantsCount / size);
      if (merchants.length) {
        return new BpmResponse(true, { content: merchants, totalPagesCount, pageIndex: index, pageSize: size }, null);
      } else {
        throw new NoContentException();
      }
    }
    catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getRejectedMerchants(pageSize: string, pageIndex: string, sortBy: string, sortType: string,): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }
      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({
        where: { completed: true, verified: false, rejected: true },
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {

        const merchantsCount = await this.clientMerchantsRepository.count({ where: { completed: true, verified: false, rejected: true } });
        const totalPagesCount = Math.ceil(merchantsCount / size);

        return new BpmResponse(true, { content: merchants, totalPagesCount, pageIndex: index, pageSize: size }, null);
      } else {
        throw new NoContentException();
      }
    }
    catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getBlockedMerchants(pageSize: string, pageIndex: string, sortBy: string, sortType: string,): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }
      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({
        where: { completed: true, verified: false, blocked: true },
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {
        const merchantsCount = await this.clientMerchantsRepository.count({ where: { completed: true, verified: false, blocked: true } });
        const totalPagesCount = Math.ceil(merchantsCount / size);
        return new BpmResponse(true, { content: merchants, totalPagesCount, pageIndex: index, pageSize: size }, null);
      } else {
        throw new NoContentException();
      }
    }
    catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

}