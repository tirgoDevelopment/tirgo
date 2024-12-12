import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual,  } from 'typeorm';
import { AwsService, BpmResponse, DriverMerchant, InternalErrorException, ResponseStauses, Transaction, SundryService, User, CreateDriverMerchantDto, NotFoundException, UserTypes, CreateInStepDriverMerchantDto, CompleteDriverMerchantDto, DriverBankAccount, CreateDriverMerchantUserDto, DriverMerchantUser, Role, BadRequestException, Driver, NoContentException, TransactionTypes } from '../..';
import { AppendDriverMerchantDto, DriverBalanceManagementDto, DriverMerchantDto, DriverPaidWayKzDto } from '@app/shared-modules/entites/driver-merchant/dtos/driver-merchant.dto';
import * as dateFns from 'date-fns'

@Injectable()
export class DriverMerchantsService {

  constructor(
    @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
    @InjectRepository(DriverMerchantUser) private readonly driverMerchantUsersRepository: Repository<DriverMerchantUser>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(DriverBankAccount) private readonly bankAccountRepository: Repository<DriverBankAccount>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    private sundriesService: SundryService,
    private awsService: AwsService,
    private dataSource: DataSource
  ) { }

  async createDriverMerchant(createDriverMerchantDto: CreateDriverMerchantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      if (!(/[a-zA-Z]/.test(createDriverMerchantDto.password) && /\d/.test(createDriverMerchantDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      const passwordHash = await this.sundriesService.generateHashPassword(createDriverMerchantDto.password);
      const driverMerchant: DriverMerchant = new DriverMerchant();
      driverMerchant.user = await queryRunner.manager.save(User, { userType: UserTypes.DriverMerchant, password: passwordHash });
      driverMerchant.email = createDriverMerchantDto.email;
      driverMerchant.phoneNumber = createDriverMerchantDto.phoneNumber.toString().replaceAll('+', '').trim();
      driverMerchant.companyName = createDriverMerchantDto.companyName;
      driverMerchant.companyType = createDriverMerchantDto.companyType;

      const newDriverMerchant = await queryRunner.manager.save(DriverMerchant, driverMerchant);
      newDriverMerchant.user = {
       id: newDriverMerchant.user?.id,
       userType: newDriverMerchant.user?.userType  
      } as any;
      await queryRunner.commitTransaction();
        return new BpmResponse(true, newDriverMerchant, null)
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
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

  async createInStepMerchant(files: any, createMerchantDto: CreateInStepDriverMerchantDto) {
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: Number(createMerchantDto.merchantId) } });

      merchant.supervisorFirstName = createMerchantDto.supervisorFirstName;
      merchant.supervisorLastName = createMerchantDto.supervisorLastName;
      merchant.responsiblePersonFistName = createMerchantDto.responsiblePersonFistName;
      merchant.responsiblePersonLastName = createMerchantDto.responsiblePersonLastName;
      merchant.responsbilePersonPhoneNumber = createMerchantDto.responsbilePersonPhoneNumber;
      merchant.factAddress = createMerchantDto.factAddress;
      merchant.legalAddress = createMerchantDto.legalAddress;
      merchant.postalCode = createMerchantDto.postalCode;
      merchant.garageAddress = createMerchantDto.garageAddress;
      merchant.registrationCertificateFilePath = files.registrationCertificate[0].originalname.split(' ').join('').trim();
      merchant.transportationCertificateFilePath = files.transportationCertificate[0].originalname.split(' ').join('').trim();
      merchant.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
      merchant.logoFilePath = files.logo[0].originalname.split(' ').join('').trim();

      // Upload files to AWS
      await Promise.all([files.passport[0], files.logo[0], files.registrationCertificate[0], files.transportationCertificate[0]].map((file: any) => this.awsService.uploadFile(UserTypes.DriverMerchant, file)));

      const newMerchant = await this.driverMerchantsRepository.save(merchant);
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

  async completeMerchant(completeMerchantDto: CompleteDriverMerchantDto) {
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: completeMerchantDto.merchantId } });

      merchant.bankName = completeMerchantDto.bankName || merchant.bankName;
      merchant.bankBranchName = completeMerchantDto.bankBranchName || merchant.bankBranchName;
      merchant.inn = completeMerchantDto.inn || merchant.inn;
      merchant.taxPayerCode = completeMerchantDto.taxPayerCode || merchant.taxPayerCode;
      merchant.oked = completeMerchantDto.oked || merchant.oked;
      merchant.mfo = completeMerchantDto.mfo || merchant.mfo;
      merchant.dunsNumber = completeMerchantDto.dunsNumber || merchant.dunsNumber;
      merchant.ibanNumber = completeMerchantDto.ibanNumber || merchant.ibanNumber;
      merchant.notes = completeMerchantDto.notes || merchant.notes;
      merchant.completed = true;

      if (completeMerchantDto.bankAccounts) {
        await this.bankAccountRepository.delete({ driverMerchant: { id: merchant.id } });
        const query = `
        INSERT INTO driver_bank_account (account, currency_id) 
        VALUES
          ${completeMerchantDto.bankAccounts.map((account: any) => `('${account.account}', '${account.currencyId}')`).join(', ')}
        RETURNING *;`;
        merchant.bankAccounts = await this.bankAccountRepository.query(query);
      }

      const newMerchant = await this.driverMerchantsRepository.save(merchant);
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

  async updateDriverMerchant(updateDriverMerchantDto: DriverMerchantDto, files: any) {
    try {
      const driverMerchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: updateDriverMerchantDto.id } });
      driverMerchant.email = updateDriverMerchantDto.email || driverMerchant.email;
      driverMerchant.phoneNumber = updateDriverMerchantDto.phoneNumber.toString().replaceAll('+', '').trim() || driverMerchant.phoneNumber;
      driverMerchant.companyName = updateDriverMerchantDto.companyName || driverMerchant.companyName;
      driverMerchant.companyType = updateDriverMerchantDto.companyType || driverMerchant.companyType;

      driverMerchant.bankName = updateDriverMerchantDto.bankName || driverMerchant.bankName;
      driverMerchant.bankBranchName = updateDriverMerchantDto.bankBranchName || driverMerchant.bankBranchName;
      driverMerchant.inn = updateDriverMerchantDto.inn || driverMerchant.inn;
      driverMerchant.taxPayerCode = updateDriverMerchantDto.taxPayerCode || driverMerchant.taxPayerCode;
      driverMerchant.oked = updateDriverMerchantDto.oked || driverMerchant.oked;
      driverMerchant.mfo = updateDriverMerchantDto.mfo || driverMerchant.mfo;
      driverMerchant.dunsNumber = updateDriverMerchantDto.dunsNumber || driverMerchant.dunsNumber;
      driverMerchant.ibanNumber = updateDriverMerchantDto.ibanNumber || driverMerchant.ibanNumber;
      driverMerchant.notes = updateDriverMerchantDto.notes || driverMerchant.notes;
      
      driverMerchant.supervisorFirstName = updateDriverMerchantDto.supervisorFirstName || driverMerchant.supervisorFirstName;
      driverMerchant.supervisorLastName = updateDriverMerchantDto.supervisorLastName || driverMerchant.supervisorLastName;
      driverMerchant.responsiblePersonFistName = updateDriverMerchantDto.responsiblePersonFistName || driverMerchant.responsiblePersonFistName;
      driverMerchant.responsiblePersonLastName = updateDriverMerchantDto.responsiblePersonLastName || driverMerchant.responsiblePersonLastName;
      driverMerchant.responsbilePersonPhoneNumber = updateDriverMerchantDto.responsbilePersonPhoneNumber || driverMerchant.responsbilePersonPhoneNumber;
      driverMerchant.factAddress = updateDriverMerchantDto.factAddress || driverMerchant.factAddress;
      driverMerchant.legalAddress = updateDriverMerchantDto.legalAddress || driverMerchant.legalAddress;
      driverMerchant.postalCode = updateDriverMerchantDto.postalCode || driverMerchant.postalCode;
      driverMerchant.garageAddress = updateDriverMerchantDto.garageAddress || driverMerchant.garageAddress;

      if(files) {
        const uploads = [];
        if(files.registrationCertificate) {
          driverMerchant.registrationCertificateFilePath = files.registrationCertificate[0].originalname.split(' ').join('').trim();
          uploads.push(files.registrationCertificate[0]);
        }
        if(files.transportationCertificate) {
          driverMerchant.transportationCertificateFilePath = files.transportationCertificate[0].originalname.split(' ').join('').trim();
          uploads.push(files.transportationCertificate[0]);
        }
        if(files.passport) {
          driverMerchant.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          uploads.push(files.originalname[0]);
        }
        if(files.logo) {
          driverMerchant.logoFilePath = files.logo[0].originalname.split(' ').join('').trim();
          uploads.push(files.originalname[0]);
        }
        await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.DriverMerchant, file)));
      }

        return new BpmResponse(true, null, null)
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

  async createUser(createUserDto: CreateDriverMerchantUserDto): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const passwordHash = await this.sundriesService.generateHashPassword(createUserDto.password);
      const role: Role = await this.rolesRepository.findOneOrFail({ where: { id: createUserDto.roleId } });
      const user: User = await this.usersRepository.save({ userType: UserTypes.DriverMerchantUser, password: passwordHash, role: role });
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: createUserDto.merchantId } });
      const driverMerchantUser: DriverMerchantUser = new DriverMerchantUser();
      driverMerchantUser.user = user;
      driverMerchantUser.driverMerchant = merchant;
      driverMerchantUser.fullName = createUserDto.fullName;
      driverMerchantUser.username = createUserDto.username;
      driverMerchantUser.phoneNumber = createUserDto.phoneNumber.toString().replaceAll('+', '').trim();

      const newMerchantUser = await this.driverMerchantUsersRepository.save(driverMerchantUser);
      await queryRunner.commitTransaction();
      return new BpmResponse(true, newMerchantUser, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      await queryRunner.rollbackTransaction();
      if (err.code == '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('rolesRepository')) {
          throw new NotFoundException(ResponseStauses.RoleNotFound)
        } else if (err.message.includes('driverMerchantsRepository')) {
          throw new NotFoundException(ResponseStauses.MerchantNotFound)
        }
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async verifyMerchant(id: number, user: User): Promise<BpmResponse> {
    if (!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    if(user.userType !== UserTypes.Staff) {
      throw new BadRequestException(ResponseStauses.AccessDenied);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id }, relations: ['user'] });
      if (merchant) {

        if (merchant.verified) {
          throw new BadRequestException(ResponseStauses.MerchantAlreadyVerified);
        }
        else if(merchant.rejected) {
          throw new BadRequestException(ResponseStauses.AlreadyRejected);
        }

        merchant.verified = true;
        merchant.verifiedAt = new Date();
        merchant.verifiedBy = user;
        const verified = await queryRunner.manager.save(DriverMerchant, merchant);
        if (verified) {
          const role = (await this.rolesRepository.findOneOrFail({ where: { name: 'Super admin' } }));
          const merchantBaseUser: User = await this.usersRepository.findOneOrFail({ where: { id: merchant.user?.id } });
          const user: User = await queryRunner.manager.save(User, { userType: UserTypes.DriverMerchantUser, password: merchantBaseUser.password, role: role });

          const driverMerchantUser: DriverMerchantUser = new DriverMerchantUser();
          driverMerchantUser.user = user;
          driverMerchantUser.driverMerchant = merchant;
          driverMerchantUser.fullName = merchant.supervisorFirstName + ' ' + merchant.supervisorLastName;
          driverMerchantUser.username = merchant.email;
          driverMerchantUser.phoneNumber = merchant.phoneNumber;

          await queryRunner.manager.save(DriverMerchantUser, driverMerchantUser);
          await queryRunner.commitTransaction();
          return new BpmResponse(true, null, [ResponseStauses.SuccessfullyVerified]);
        }
      } else {
        throw new NotFoundException(ResponseStauses.MerchantNotFound);
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
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
    if (!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    if(user.userType !== UserTypes.Staff) {
      throw new BadRequestException(ResponseStauses.AccessDenied);
    }
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id }, relations: ['user'] });
      if (merchant) {

        if (merchant.verified) {
          throw new BadRequestException(ResponseStauses.MerchantAlreadyVerified);
        }
        else if(merchant.rejected) {
          throw new BadRequestException(ResponseStauses.AlreadyRejected);
        }

        merchant.rejected = true;
        merchant.rejectedAt = new Date();
        merchant.rejectedBy = user;
        await this.driverMerchantsRepository.save(merchant);
          return new BpmResponse(true, null, [ResponseStauses.SuccessfullyVerified]);
      } else {
        throw new NotFoundException(ResponseStauses.MerchantNotFound);
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

  async blockMerchant(id: number, user: User): Promise<BpmResponse> {
    if (!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    if(user.userType !== UserTypes.Staff) {
      throw new BadRequestException(ResponseStauses.AccessDenied);
    }
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id }, relations: ['user'] });
      if (merchant) {
        if (merchant.blocked) {
          throw new BadRequestException(ResponseStauses.AlreadyBlocked);
        }

        merchant.blocked = true;
        merchant.blockedAt = new Date();
        merchant.blockedBy = user;
        await this.driverMerchantsRepository.save(merchant);
          return new BpmResponse(true, null, [ResponseStauses.SuccessfullyBlocked]);
      } else {
        throw new NotFoundException(ResponseStauses.MerchantNotFound);
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

  async unblockMerchant(id: number, user: User): Promise<BpmResponse> {
    if (!id || isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    if(user.userType !== UserTypes.Staff) {
      throw new BadRequestException(ResponseStauses.AccessDenied);
    }
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id }, relations: ['user'] });
      if (merchant) {

        if (!merchant.blocked) {
          throw new BadRequestException(ResponseStauses.AlreadyActive);
        }

        merchant.blocked = false;
        merchant.blockedAt = null;
        merchant.blockedBy = null;
        await this.driverMerchantsRepository.save(merchant);
          return new BpmResponse(true, null, [ResponseStauses.SuccessfullyActivated]);
      } else {
        throw new NotFoundException(ResponseStauses.MerchantNotFound);
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

  async deleteMerchant(id: number): Promise<BpmResponse> {
    try {
      const driverMerchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id } });
      if(driverMerchant.deleted) {
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }
  
      driverMerchant.deleted = true;
      driverMerchant.phoneNumber = '_'+driverMerchant.phoneNumber;
  
      await this.driverMerchantsRepository.save(driverMerchant);
  
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
    } catch(err: any) {
      throw new InternalErrorException(ResponseStauses.InternalServerError);
    }
  } 

  async appendDriverToMerchant(dto: AppendDriverMerchantDto, user: User): Promise<BpmResponse> {
    try {
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { phoneNumbers: { number: dto.phoneNumber.toString().replaceAll('+', '').trim() } } });
      if (driver.driverMerchant) {
        throw new BadRequestException(ResponseStauses.AlreadyAssigned);
      }
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: user.driverMerchantUser?.driverMerchant?.id } });
      driver.driverMerchant = merchant;
      await this.driversRepository.save(driver);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async changeDriverBalanceManagement(dto: DriverBalanceManagementDto, driverId: number, user: User): Promise<BpmResponse> {
    try {

      if(user.userType !== UserTypes.DriverMerchant) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, isDeleted: false, driverMerchant: { id: user.driverMerchant?.id } } });

      driver.isOwnBalance = dto.isByDriver;

      await this.driversRepository.save(driver);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async changeDriverServiceManagement(dto: DriverBalanceManagementDto, driverId: number, user: User): Promise<BpmResponse> {
    try {

      if(user.userType !== UserTypes.DriverMerchant) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, isDeleted: false, driverMerchant: { id: user.driverMerchant?.id } } });

      driver.isOwnService = dto.isByDriver;
      
      await this.driversRepository.save(driver);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async changeDriverOrderManagement(dto: DriverBalanceManagementDto, driverId: number, user: User): Promise<BpmResponse> {
    try {

      if(user.userType !== UserTypes.DriverMerchant) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, isDeleted: false, driverMerchant: { id: user.driverMerchant?.id } } });

      driver.isOwnOrder = dto.isByDriver;
      
      await this.driversRepository.save(driver);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async changeIsKzPaidWay(dto: DriverPaidWayKzDto, driverId: number, user: User): Promise<BpmResponse> {
    try {

      if(user.userType !== UserTypes.DriverMerchant) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, isDeleted: false, driverMerchant: { id: user.driverMerchant?.id } } });

      driver.isKzPaidWay = dto.isKzPaidWay;
      
      await this.driversRepository.save(driver);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async getMerchants() {
    return await this.driverMerchantsRepository.find()
  }

  async findMerchantById(id: number) {
    try {
      const data = await this.driverMerchantsRepository.findOneOrFail({ where: { id, blocked: false }, relations: ['bankAccounts', 'bankAccounts.currency', 'user'] });

      // const balances: Transaction[] = await this.transactionsRepository.query(`
      //   SELECT
      //   SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' THEN t.amount ELSE 0 END) -
      //   SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' THEN t.amount ELSE 0 END) -
      //   SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance,
      //   SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance,
      //   c.name as currencyName
      //   FROM
      //       transaction t
      //   LEFT JOIN currency c on c.id = t.currency_id 
      //   WHERE
      //       t.merchant_id = ${id}
      //   GROUP BY
      //       c.name;
      // `);
      return new BpmResponse(true, data, null);
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
      const merchants: DriverMerchant[] = await this.driverMerchantsRepository.find({
        where: { completed: true, verified: false, rejected: false },
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {
        const merchantsCount = await this.driverMerchantsRepository.count({ where: { completed: true, verified: false, rejected: false } })
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


      const merchants: DriverMerchant[] = await this.driverMerchantsRepository.find({
        where: filter, relations: ['bankAccounts', 'bankAccounts.currency', 'drivers'], order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });

      for (let merchant of merchants) {
        const transactions: Transaction[] = await this.transactionsRepository.query(`
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
        merchant['balances'] = transactions;
      }

      if (merchants.length) {
        const merchantsCount = await this.driverMerchantsRepository.count({ where: filter })
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
      const merchants: DriverMerchant[] = await this.driverMerchantsRepository.find({ 
        where: { completed: true, verified: false, rejected: true }, 
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {
        const merchantsCount = await this.driverMerchantsRepository.count({ where: { completed: true, verified: false, rejected: true } })
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
      const merchants: DriverMerchant[] = await this.driverMerchantsRepository.find({ 
        where: { completed: true, verified: false, blocked: true }, 
        relations: ['bankAccounts', 'bankAccounts.currency'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (merchants.length) {
        const merchantsCount = await this.driverMerchantsRepository.count({ where: { completed: true, verified: false, blocked: true } })
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