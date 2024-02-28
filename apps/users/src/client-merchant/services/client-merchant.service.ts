import { Injectable, HttpException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AwsService, BpmResponse, ClientMerchant, InternalErrorException, ResponseStauses, SundryService, User, CreateClientMerchantDto, NotFoundException, UserTypes, CreateInStepClientMerchantDto, CompleteClientMerchantDto, ClientBankAccount, CreateClientMerchantUserDto, ClientMerchantUser, Role, ClientMerchantDto, BadRequestException, NoContentException, Transaction, TransactionTypes, Currency } from '../..';
import * as bcrypt from 'bcrypt';
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
        await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.ClientMerchant, file)));
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

  async verifyMerchant(id: number): Promise<BpmResponse> {
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
        }

        merchant.verified = true;
        merchant.verifiedAt = new Date()
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
      }  else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async rejectMerchant(id: number): Promise<BpmResponse> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneByOrFail({ id });
      merchant.rejected = true;
      merchant.rejectedAt = new Date();
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
    const isDeleted = await this.clientMerchantsRepository.createQueryBuilder()
      .update(ClientMerchant)
      .set({ deleted: true })
      .where("id = :id", { id })
      .execute();
    if (isDeleted.affected) {
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
    } else {
      return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
    }
  }

  async blockMerchant(id: number): Promise<BpmResponse> {
    const isBlocked = await this.clientMerchantsRepository.createQueryBuilder()
      .update(ClientMerchant)
      .set({ active: false })
      .where("id = :id", { id })
      .execute();
    if (isBlocked.affected) {
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } else {
      return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
    }
  }

  
  async activateMerchant(id: number): Promise<BpmResponse> {
    const isActivate = await this.clientMerchantsRepository.createQueryBuilder()
      .update(ClientMerchant)
      .set({ active: true })
      .where("id = :id", { id })
      .execute();
    if (isActivate.affected) {
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } else {
      return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
    }
  }

  async findMerchantById(id: number) {
    try {
      const data = await this.clientMerchantsRepository.findOneOrFail({ where: { id, active: true }, relations: ['bankAccounts', 'bankAccounts.currency', 'user'] });

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

  async getUnverifiedMerchants(): Promise<BpmResponse> {
    try {
      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({ where: { completed: true, verified: false, rejected: false }, relations: ['bankAccounts', 'bankAccounts.currency'] });
      if (merchants.length) {
        return new BpmResponse(true, merchants, null);
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

  async getVerifiedMerchants(id: number, companyName: string, createdFrom: string, createdAtTo: string): Promise<BpmResponse> {
    try {

      const filter: any = { completed: true, verified: true, rejected: false, deleted: false };

      if(id) {
        filter.id = +id;
      } 
      if(companyName) {
        filter.companyName = companyName;
      }
      if (createdFrom && createdAtTo) {
        filter.createdAt = Between(
          dateFns.parseISO(createdFrom),
          dateFns.parseISO(createdAtTo)
        );
      } else if (createdFrom) {
        filter.createdAt = MoreThanOrEqual(dateFns.parseISO(createdFrom));
      } else if (createdAtTo) {
        filter.createdAt = LessThanOrEqual(dateFns.parseISO(createdAtTo));
      }


      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({ where: filter, relations: ['bankAccounts', 'bankAccounts.currency'] });

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


      //  const merchants = await this.clientMerchantsRepository.createQueryBuilder('cm')
      //     .leftJoinAndSelect('cm.bankAccounts', 'bankAccounts')
      //     .leftJoinAndSelect('bankAccounts.currency', 'currency')
      //     .addSelect(`(
      //         SELECT
      //             SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' THEN t.amount ELSE 0 END) -
      //             SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' THEN t.amount ELSE 0 END) -
      //             SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance
      //         FROM
      //             transaction t
      //         WHERE
      //             t.merchant_id = cm.id
      //     )`, 'activeBalance')
      //     .addSelect(`(
      //         SELECT
      //             SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance
      //         FROM
      //             transaction t
      //         WHERE
      //             t.merchant_id = cm.id
      //     )`, 'frozenBalance')
      //     .where(`completed = true AND verified = true AND rejected = false`)
      //     .getMany();


      if (merchants.length) {
        return new BpmResponse(true, merchants, null);
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

  async getRejectedMerchants(): Promise<BpmResponse> {
    try {
      const merchants: ClientMerchant[] = await this.clientMerchantsRepository.find({ where: { completed: true, verified: false, rejected: true }, relations: ['bankAccounts', 'bankAccounts.currency'] });
      if (merchants.length) {
        return new BpmResponse(true, merchants, null);
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