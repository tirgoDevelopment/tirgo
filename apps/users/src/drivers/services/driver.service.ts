import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Agent, AppendDriversToTmsDto, AwsService, BadRequestException, BpmResponse, CargoStatusCodes, Currency, CustomJwtService, Driver, DriverDto, DriverMerchant, DriverMerchantUser, DriverPhoneNumber, DriverTransport, InternalErrorException, NoContentException, NotFoundException, OrderOffer, ResponseStauses, SundryService, Transaction, TransactionTypes, UpdateDriverDto, User, UserStates, UserTypes } from '../..';
import { DriversRepository } from '../repositories/drivers.repository';
import { UpdateDriverBirthDayDto, UpdateDriverPhoneDto } from '@app/shared-modules/entites/driver/dtos/driver.dto';

@Injectable()
export class DriversService {

  constructor(
    @InjectRepository(OrderOffer) private readonly orderOffersRepository: Repository<OrderOffer>,
    @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(DriverPhoneNumber) private readonly driverPhoneNumbersRepository: Repository<DriverPhoneNumber>,
    private readonly driverRepository: DriversRepository,
    private sundriesService: SundryService,
    private customJwtService: CustomJwtService,
    private awsService: AwsService
  ) { }

  async registerDriver(createDriverDto: DriverDto, user: User, files: { profile?: any[] }): Promise<BpmResponse> {
    
    const queryRunner = this.driverRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const driver: Driver = new Driver();
      if(user) {
        switch (user.userType) {
          case UserTypes.DriverMerchantUser: 
          const driverMerchant: DriverMerchant = await queryRunner.manager.findOneOrFail(DriverMerchant, { where: { id: user.driverMerchantUser.driverMerchant?.id } }) 
          driver.driverMerchant = driverMerchant;
               break;
        }
      }
      const newUser = await queryRunner.manager.save(User, { userType: 'driver' });
      driver.user = newUser;
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.email = createDriverDto.email;
      driver.birthdayDate = createDriverDto.birthdayDate;
      driver.citizenship = createDriverDto.citizenship;
      driver.createdBy = user;
      
      if(files) {
        const uploads: any = [];
        if(files.profile) {
          driver.profileFilePath = files.profile[0].originalname.split(' ').join('').trim();
          uploads.push(files.profile[0]);
        }

        // Upload files to AWS
      const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
      if(res.includes(false)) {
        // await queryRunner.rollbackTransaction();
        throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
      }

      }
      if(typeof createDriverDto.phoneNumbers == 'string') {
        createDriverDto.phoneNumbers = JSON.parse(createDriverDto.phoneNumbers)
      }
      if(!(createDriverDto.phoneNumbers instanceof Array)) {
        throw new BadRequestException(ResponseStauses.PhoneNumbeersMustBeArray)
      }
      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replaceAll('+', '').trim();
        driverPhoneNumber.driver = driver; 
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;

      // Save driver and associated entities
      const newDriver = await queryRunner.manager.save(Driver, driver);

      
      // Commit the transaction
      await queryRunner.commitTransaction();

      const payload: any = { sub: newDriver.id, userId: newUser.id, userType: 'driver' };
      const token: string = await this.customJwtService.generateToken(payload);

      return new BpmResponse(true, { token }, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      // this.awsService.deleteFile('driver', passportFile.split(' ').join('').trim());
      // this.awsService.deleteFile('driver', driverLicenseFile.split(' ').join('').trim());

      console.error(err);

      if (err instanceof HttpException) {
        throw err;
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async createDriver(createDriverDto: DriverDto, user: User, files: { passport?: any[], driverLicense?: any[], profile?: any[] }): Promise<BpmResponse> {
    
    const queryRunner = this.driverRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (!(/[a-zA-Z]/.test(createDriverDto.password) && /\d/.test(createDriverDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }
      const passwordHash = await this.sundriesService.generateHashPassword(createDriverDto.password);
      const driver: Driver = new Driver();
      if(user) {
        switch (user.userType) {
          case UserTypes.DriverMerchantUser: 
          const driverMerchant: DriverMerchant = await queryRunner.manager.findOneOrFail(DriverMerchant, { where: { id: user.driverMerchantUser.driverMerchant?.id } }) 
          driver.driverMerchant = driverMerchant;
               break;
        }
      }
      const newUser = await queryRunner.manager.save(User, { userType: 'driver', password: passwordHash });
      driver.user = newUser;
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.email = createDriverDto.email;
      driver.birthdayDate = createDriverDto.birthdayDate;
      driver.citizenship = createDriverDto.citizenship;
      driver.createdBy = user;
      
      // password

      if(files) {
        const uploads: any = [];
        if(files.passport) {
          driver.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          uploads.push(files.passport[0]);
        }
        if(files.profile) {
          driver.profileFilePath = files.profile[0].originalname.split(' ').join('').trim();
          uploads.push(files.profile[0]);
        }
        if(files.driverLicense) {
          driver.driverLicenseFilePath = files.driverLicense[0].originalname.split(' ').join('').trim();
          uploads.push(files.driverLicense[0]);
        }

        // Upload files to AWS
      const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
      if(res.includes(false)) {
        // await queryRunner.rollbackTransaction();
        throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
      }

      }
      if(typeof createDriverDto.phoneNumbers == 'string') {
        createDriverDto.phoneNumbers = JSON.parse(createDriverDto.phoneNumbers)
      }
      if(!(createDriverDto.phoneNumbers instanceof Array)) {
        throw new BadRequestException(ResponseStauses.PhoneNumbeersMustBeArray)
      }
      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replaceAll('+', '').trim();
        driverPhoneNumber.driver = driver; 
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;

      // Save driver and associated entities
      const newDriver = await queryRunner.manager.save(Driver, driver);

      
      // Commit the transaction
      await queryRunner.commitTransaction();

      return new BpmResponse(true, { id: newDriver.id }, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      // this.awsService.deleteFile('driver', passportFile.split(' ').join('').trim());
      // this.awsService.deleteFile('driver', driverLicenseFile.split(' ').join('').trim());

      console.error(err);

      if (err instanceof HttpException) {
        throw err;
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async updateDriver(updateDriverDto: UpdateDriverDto, files: any): Promise<BpmResponse> {
    try {
      const driver = await this.driverRepository.findOneOrFail({ where: { id: updateDriverDto.id } });
      driver.firstName = updateDriverDto.firstName || driver.firstName;
      driver.lastName = updateDriverDto.lastName || driver.lastName;
      driver.email = updateDriverDto.email || driver.email;
      driver.birthdayDate = updateDriverDto.birthdayDate || driver.birthdayDate;
      driver.citizenship = updateDriverDto.citizenship || driver.citizenship;

      const driverPhoneNumbers = updateDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replaceAll('+', '').trim();
        driverPhoneNumber.driver = driver;
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;
            
      if(files) {
        const uploads: any = [];
        if(files.profile) {
          driver.profileFilePath = files.profile[0].originalname.split(' ').join('').trim();
          uploads.push(files.profile[0]);
        } 
        if(files.driverLicense) {
          driver.driverLicenseFilePath = files.driverLicense[0].originalname.split(' ').join('').trim();
          uploads.push(files.driverLicense[0])
        }
        if(files.passport) {
          driver.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          uploads.push(files.passport[0]);
        }

        // Upload files to AWS
        const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
        if(res.includes(false)) {
          // await queryRunner.rollbackTransaction();
          throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
        }
      }

      await this.driverRepository.save(driver);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
    } catch (err: any) {
      console.log(err)
      throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
    }
  }

  async updateDriverPhoneNumber(updateDriverPhoneDto: UpdateDriverPhoneDto, phoneNumberId: number, user: any): Promise<BpmResponse> {
    try {
      const result = await this.driverPhoneNumbersRepository.update({ id: phoneNumberId, driver: { id: user.id } }, { phoneNumber: updateDriverPhoneDto.phoneNumber })
      console.log(result)
      if(result.affected) {
        return new BpmResponse(true, null, null);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async addPhoneNumber(createDriverPhoneDto: UpdateDriverPhoneDto, user: any): Promise<BpmResponse> {
    try {

      const driver = await this.driverRepository.findOneOrFail({where: { id: user.id }});

      const newPhoneNumber = new DriverPhoneNumber();
      newPhoneNumber.phoneNumber = createDriverPhoneDto.phoneNumber;
      newPhoneNumber.driver = driver;

      const result = await this.driverPhoneNumbersRepository.save(newPhoneNumber)
      console.log(result)
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async updateDriverBirthday(updateDriverBirthDayDto: UpdateDriverBirthDayDto, user: any): Promise<BpmResponse> {
    try {
      const result = await this.driverRepository.update({id: user.id}, { birthdayDate: updateDriverBirthDayDto.birthdayDate });
      if(result.affected) {
        return new BpmResponse(true, null, null);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        // Client not found
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getDriverById(id: number, userId: number): Promise<BpmResponse> {
    if (!id) {
      return new BpmResponse(false, null, ['Id id required']);
    }

    if (!userId) {
      return new BpmResponse(false, null, ['UserId id required']);
    }
    try {
      const driver = await this.driverRepository
        .createQueryBuilder('driver')
        .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
        .leftJoinAndSelect('driver.driverMerchant', 'driverMerchant')
        .leftJoinAndSelect('driver.driverTransports', 'transports')
        .leftJoinAndSelect('transports.transportTypes', 'transportTypes')
        .leftJoinAndSelect('transports.transportKinds', 'transportKinds')
        .leftJoinAndSelect('transports.cargoLoadMethods', 'cargoLoadMethods')
        .leftJoinAndSelect('driver.agent', 'agent')
        .leftJoinAndSelect('driver.subscription', 'subscription')
        .leftJoin('driver.orderOffers', 'orderOffers')
        .leftJoinAndSelect('orderOffers.order', 'order')
        .leftJoin('driver.user', 'user')
        .addSelect('user.id')
        .addSelect('user.userType')
        .addSelect('user.lastLogin')
        .where(`driver.deleted = false AND driver.id = ${id}`)
        .getOneOrFail();

        const canceledOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { cargoStatus: { code: CargoStatusCodes.Canceled } } } });
        const closdOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { isSafeTransaction: true,  cargoStatus: { code: CargoStatusCodes.Closed } } } });
        const completedOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { isSafeTransaction: false,  cargoStatus: { code: CargoStatusCodes.Completed } } } });

      const balances: Transaction[] = await this.transactionsRepository.query(`
      SELECT
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.TopUp}' AND verified = true AND created_by = ${userId} THEN t.amount ELSE 0 END) -
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' AND verified = true AND created_by = ${userId} THEN t.amount ELSE 0 END) -
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = true AND driver_id = ${id} THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS activeBalance,
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.Withdraw}' AND verified = false AND rejected = false AND created_by = ${userId} THEN t.amount ELSE 0 END) AS onRequestBalance,
      SUM(CASE WHEN t.transaction_type = '${TransactionTypes.SecureTransaction}' AND t.verified = false AND driver_id = ${id} AND  t.rejected = false THEN t.amount + t.tax_amount + t.additional_amount ELSE 0 END) AS frozenBalance,
      c.name as currencyName
      FROM
          transaction t
      LEFT JOIN currency c on c.id = t.currency_id 
      GROUP BY
          c.name;
    `);
      driver['balances'] = balances;
      driver['canceledOrdersCount'] = canceledOrdersCount;
      driver['completedOrdersCount'] = closdOrdersCount + completedOrdersCount;


      // const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
      //   .select([
      //     't.id as id',
      //     't.amount as amount',
      //     't.rejected as rejected',
      //     't.verified as verified',
      //     't.transaction_type AS "transctionType"',
      //     't.user_type AS "userType"',
      //     't.comment as comment',
      //     't.created_at AS "createdAt"',
      //     'c.name AS "currencyName"'
      //   ])
      //   .leftJoin(Currency, 'c', 'c.id = t.currency_id')
      //   .where(`t.created_by = ${userId}`);
      // driver['transactions'] = await queryBuilder.getRawMany();
      const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
      driver['isBusy'] = isDriverBusy;
      return new BpmResponse(true, driver, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        // Client not found
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getDriverByPhone(phone: number): Promise<BpmResponse> {
    // Parameter validation
    if (!phone) {
        return new BpmResponse(false, null, ['Phone number is required']);
    }

    try {
        // Query to retrieve driver by phone number
        const driver = await this.driverRepository
            .createQueryBuilder('driver')
            .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
            .leftJoinAndSelect('driver.driverMerchant', 'driverMerchant')
            .leftJoinAndSelect('driver.driverTransports', 'transports')
            .leftJoinAndSelect('transports.transportTypes', 'transportTypes')
            .leftJoinAndSelect('driver.agent', 'agent')
            .leftJoinAndSelect('driver.subscription', 'subscription')
            .leftJoin('driver.orderOffers', 'orderOffers')
            .leftJoinAndSelect('orderOffers.order', 'order')
            .leftJoin('driver.user', 'user')
            .addSelect('user.id')
            .addSelect('user.userType')
            .addSelect('user.lastLogin')
            .where('phoneNumber.phoneNumber = :phone', { phone: phone.toString().replaceAll('+', '').trim() })
            .getOneOrFail();

        return new BpmResponse(true, driver, null);
    } catch (err: any) {
        console.error(err);

        if (err.name === 'EntityNotFoundError') {
            // Driver not found
            throw new NoContentException();
        } else if (err instanceof HttpException) {
            throw err;
        } else {
            // Other errors (handle accordingly)
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

  async getAllDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, driverId: number, firstName: string, phoneNumber: string, transportKindId: string,
    transportTypeId: string, isSubscribed: boolean, status: string, state: string, isVerified: string,
     createdAtFrom: string, createdAtTo: string, lastLoginFrom: string, lastLoginTo: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 0;
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
    const filter: any = { 
      deleted: false,
      driverId, 
      firstName, 
      phoneNumber, 
      transportKindId,
      transportTypeId, 
      isSubscribed, 
      status, 
      isVerified,
      createdAtFrom, 
      createdAtTo, 
      lastLoginFrom, 
      lastLoginTo,
      state
     };
    
      const drivers = await this.driverRepository.findAllDrivers(filter, sort, index, size)
      if (!drivers.data.length) {
        throw new NoContentException();
      }

      const totalPagesCount = Math.ceil(drivers.count / size);
      return new BpmResponse(true, { content: drivers.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }
  
  async getMerchantDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, merchantId: number, state: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 0;
      if(!merchantId || isNaN(merchantId)) {
        throw new BadRequestException(ResponseStauses.MerchantIdIsRequired)
      }

      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const filter = {
        merchantId,
        state
      }
      const drivers = await this.driverRepository.findAllMerchantDrivers(filter, sort, index, size);
 
      const totalPagesCount = Math.ceil(drivers.count / size);

      if (!drivers.data.length) {
        throw new NoContentException();
      }

      return new BpmResponse(true, { content: drivers.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async deleteDriver(id: number, user: User): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driverRepository.findOneOrFail({ where: { id }, relations: ['phoneNumbers'] });

      if (driver.deleted) {
        // Driver is already deleted
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      driver.deleted = true;
      driver.deletedAt = new Date();
      driver.deletedBy = user;

      // Update phoneNumbers by adding underscores
      if (driver.phoneNumbers) {
        driver.phoneNumbers.forEach(phone => {
              phone.phoneNumber = '_' + phone.phoneNumber;
          });
      }
      await this.driverRepository.save(driver);

      return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Driver not found
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async blockDriver(id: number, blockReason: string, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driverRepository.findOneOrFail({ where: { id } });

      if (driver.blocked) {
        // Driver is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      driver.blocked = true;
      driver.blockedAt = new Date();
      driver.blockReason = blockReason;
      driver.blockedBy = user;

      await this.driverRepository.save(driver);

        return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Driver not found
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async activateDriver(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driverRepository.findOneOrFail({ where: { id } });

      if (!driver.blocked) {
        // Driver is already active
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      driver.blockReason = null;
      driver.blockedAt = null;
      driver.blockedBy = null;
      driver.blocked = false;

      await this.driverRepository.save(driver);

        return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Driver not found
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async appendDriverToMerchant(dto: AppendDriversToTmsDto, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
          throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      const drivers: Driver[] = await this.driverRepository.find({ where: { id: In(dto.driverIds) }, relations: ['driverMerchant'] });
      const isAppandedExists = drivers.some((el: any) => el.driverMerchant);
      if(isAppandedExists) {
        throw new BadRequestException(ResponseStauses.AlreadyAppended);
      }
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: dto.driverMerchantId }, relations: ['drivers'] });
      if(merchant.drivers?.length) {
        merchant.drivers = [ ...merchant.drivers, ...drivers];
      } else {
        merchant.drivers = drivers;
      }
      await this.driverMerchantsRepository.save(merchant);
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

  async appendDriverToAgent(driverId: number, agentId: number, userId: number): Promise<BpmResponse> {
    try {

      if (!driverId || isNaN(driverId)) {
        throw new BadRequestException(ResponseStauses.DriverIdIsRequired);
      } else if (!agentId || isNaN(agentId)) {
        throw new BadRequestException(ResponseStauses.AgentIdIsRequired);
      }

      const isExists: boolean = await this.driverRepository.exists({ where: { id: driverId, agent: { id: agentId }, blocked: false, deleted: false } });
      if(isExists) {
        throw new BadRequestException(ResponseStauses.DriverAlreadyAppended)
      }
      const driver: Driver = await this.driverRepository.findOneOrFail({ where: { id: driverId, blocked: false, deleted: false } });
      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: agentId, blocked: false, deleted: false } });

      driver.agent = agent;
      await this.driverRepository.save(driver);

      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

  async getDriverByAgentId(pageSize: string, pageIndex: string, sortBy: string, sortType: string, state: string, agentId: number, driverId: number, firstName: string, createdAtFrom: string, createdAtTo: string): Promise<BpmResponse> {
    try {

      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 0;
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }

      if (!agentId || isNaN(agentId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      let filter: any = { 
        state,
        agentId,
        driverId,
        firstName,
        createdAtFrom,
        createdAtTo
      };

      const drivers = await this.driverRepository.findAllAgentDrivers(filter, sort, index, size);
      if (!drivers.data.length) {
        throw new NoContentException();
      } else {
        const totalPagesCount = Math.ceil(drivers.count / size);
        return new BpmResponse(true, { content: drivers.data, totalPagesCount, pageIndex: index, pageSize: size }, null)
      }
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }

}