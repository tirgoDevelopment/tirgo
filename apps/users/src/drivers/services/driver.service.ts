import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Agent, AwsService, BadRequestException, BpmResponse, CargoStatusCodes, Currency, Driver, DriverDto, DriverMerchant, DriverMerchantUser, DriverPhoneNumber, DriverTransport, InternalErrorException, NoContentException, OrderOffer, ResponseStauses, SundryService, Transaction, TransactionTypes, User, UserTypes } from '../..';
import * as dateFns from 'date-fns'

@Injectable()
export class DriversService {

  constructor(
    @InjectRepository(OrderOffer) private readonly orderOffersRepository: Repository<OrderOffer>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    private sundriesService: SundryService,
    private awsService: AwsService
  ) { }

  async createDriver(createDriverDto: DriverDto, user: User, files: { passport?: any[], driverLicense?: any[] }): Promise<BpmResponse> {
    
    const queryRunner = this.driversRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      if (!(/[a-zA-Z]/.test(createDriverDto.password) && /\d/.test(createDriverDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      const passwordHash = await this.sundriesService.generateHashPassword(createDriverDto.password);
      const driver: Driver = new Driver();
      if(user && user.userType == UserTypes.DriverMerchantUser) {
        const driverMerchant: DriverMerchant = await queryRunner.manager.findOneOrFail(DriverMerchant, { where: { id: user.driverMerchantUser.driverMerchant?.id } }) 
        driver.driverMerchant = driverMerchant;
      }

      driver.user = await queryRunner.manager.save(User, { userType: 'driver', password: passwordHash });
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.email = createDriverDto.email;
      driver.citizenship = createDriverDto.citizenship;
      driver.createdBy = user;
      
      if(files) {
        const uploads: any = [];
        if(files.passport) {
          driver.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          uploads.push(files.passport[0]);
        } 
        if(files.driverLicense) {
          driver.driverLicenseFilePath = files.driverLicense[0].originalname.split(' ').join('').trim();
          uploads.push(files.driverLicense[0])
        }

        // Upload files to AWS
      const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
      if(res.includes(false)) {
        await queryRunner.rollbackTransaction();
        throw new InternalErrorException(ResponseStauses.InternalServerError);
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
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replace('+', '');
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

  async updateDriver(updateDriverDto: DriverDto): Promise<BpmResponse> {
    try {
      const driver = await this.driversRepository.findOneOrFail({ where: { id: updateDriverDto.id } });
      driver.firstName = updateDriverDto.firstName || driver.firstName;
      driver.lastName = updateDriverDto.lastName || driver.lastName;
      driver.email = updateDriverDto.email || driver.email;
      driver.citizenship = updateDriverDto.citizenship || driver.citizenship;

      const driverPhoneNumbers = updateDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replace('+', '');
        driverPhoneNumber.driver = driver;
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;

      await this.driversRepository.update({ id: driver.id }, driver);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
    } catch (err: any) {
      console.log(err)
      throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
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
      const driver = await this.driversRepository
        .createQueryBuilder('driver')
        .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
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


      const queryBuilder = this.transactionsRepository.createQueryBuilder('t')
        .select([
          't.id as id',
          't.amount as amount',
          't.rejected as rejected',
          't.verified as verified',
          't.transaction_type AS "transctionType"',
          't.user_type AS "userType"',
          't.comment as comment',
          't.created_at AS "createdAt"',
          'c.name AS "currencyName"'
        ])
        .leftJoin(Currency, 'c', 'c.id = t.currency_id')
        .where(`t.created_by = ${userId}`);
      driver['transactions'] = await queryBuilder.getRawMany();
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
        const driver = await this.driversRepository
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
            .where('phoneNumber.phoneNumber = :phone', { phone })
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

  async getAllDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, driverId: number, firstName: string, phoneNumber: string, transportKindId: number,
     isSubscribed: boolean, status: string, isVerified: boolean,
     createdAtFrom: string, createdAtTo: string, lastLoginFrom: string, lastLoginTo: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
    const filter: any = { deleted: false };

    if(driverId) {
      filter.id = +driverId;
    } 
    if(phoneNumber) {
      filter.phoneNumbers = { name: phoneNumber }
    }
    if(firstName) {
      filter.firstName = { id: firstName }
    }
    if(transportKindId) {
      filter.driverTransports = { transportKinds: { id: transportKindId } }
    }
    if(isVerified == true || isVerified == false) {
      filter.verified = isVerified;
    }
    if((isSubscribed)) {
      console.log(isSubscribed)
      filter.subscription = Not(IsNull());
      filter.subscribedAt = LessThanOrEqual(new Date());
      filter.subscribedTill = MoreThanOrEqual(new Date());
    }
    if(isSubscribed == false) {
      filter.subscription = IsNull();
    }
    console.log(filter)
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

    if (lastLoginFrom && lastLoginTo) {
      filter.user = {lastLogin: Between(
        dateFns.parseISO(lastLoginFrom),
        dateFns.parseISO(lastLoginTo)
      )};
    } else if (lastLoginFrom) {
      filter.user = { lastLogin: MoreThanOrEqual(dateFns.parseISO(lastLoginFrom))};
    } else if (lastLoginTo) {
      filter.user = { lastLogin: LessThanOrEqual(dateFns.parseISO(lastLoginTo)) };
    }
      const drivers = await this.driversRepository.find({ 
        where: filter, 
        relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription', 'driverTransports.transportTypes'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
      });
      if (!drivers.length) {
        throw new NoContentException();
      }

      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }


      const driversCount = await this.driversRepository.count({ where: filter })
      const totalPagesCount = Math.ceil(driversCount / size);
      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
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

  async getAllActiveDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const drivers = await this.driversRepository.find({ 
        where: { blocked: false, deleted: false }, 
        relations: ['phoneNumbers', 'driverTransports', 'driverTransports.transportTypes', 'driverTransports.transportKinds', 'driverTransports.cargoLoadMethods', 'agent', 'subscription'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }

      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }


      const driversCount = await this.driversRepository.count({ where: { blocked: false, deleted: false } })
      const totalPagesCount = Math.ceil(driversCount / size);
      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
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

  async getAllNonActiveDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const drivers = await this.driversRepository.find({ 
        where: { blocked: true, deleted: false }, 
        relations: ['phoneNumbers', 'driverTransports', 'driverTransports.transportTypes', 'driverTransports.transportKinds', 'driverTransports.cargoLoadMethods' ,'agent', 'subscription'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }
      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }

      const driversCount = await this.driversRepository.count({ where: { blocked: true, deleted: false } })
      const totalPagesCount = Math.ceil(driversCount / size);
      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
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

  async getAllDeletedDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10;
      const index = +pageIndex || 1;
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const drivers = await this.driversRepository.find({ 
        where: { deleted: true }, 
        relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'],
        order: sort,
        skip: (index - 1) * size,
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }
      
      const driversCount = await this.driversRepository.count({ 
        where: { deleted: true }, 
      });
      const totalPagesCount = Math.ceil(driversCount / size);
      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }

      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
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

  async getMerchantDeletedDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, merchantId: number): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if(!merchantId || isNaN(merchantId)) {
        throw new BadRequestException(ResponseStauses.MerchantIdIsRequired)
      }

      if(!sortBy) {
        sortBy = 'd.id';
      } 
      if(!sortType) {
        sortType = 'DESC'
      }

      const drivers = await this.driversRepository.createQueryBuilder('d')
      .leftJoinAndSelect('d.subscription', 'subscription')
      .leftJoinAndSelect('d.driverTransports', 'driverTransports')
      .leftJoinAndSelect('driverTransports.transportKinds', 'transportKinds')
      .leftJoinAndSelect('d.agent', 'agent')
      .leftJoin('d.phoneNumbers', 'phoneNumber')
      .addSelect('phoneNumber.phoneNumber')
      .addSelect('phoneNumber.id')
      .leftJoin('d.user', 'user')
      .addSelect('user.lastLogin')
      .addSelect('user.id')
      .addSelect('user.userType')
      .leftJoin(User, 'u', 'u.id = d.created_by')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`u.user_type = '${UserTypes.DriverMerchantUser}'  AND  dm.id = ${merchantId} AND d.deleted = true`)
      .skip((index - 1) * size) // Skip the number of items based on the page number
      .take(size)
      .orderBy(sortBy, sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC')
      .getMany();
      const driversCount = await this.driversRepository.createQueryBuilder('d')
      .leftJoin(User, 'u', 'u.id = d.created_by')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`u.user_type = '${UserTypes.DriverMerchantUser}'  AND  dm.id = ${merchantId} AND d.deleted = true`)
      .getCount();
 
      const totalPagesCount = Math.ceil(driversCount / size);

      if (!drivers.length) {
        throw new NoContentException();
      }
      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }

      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
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

  async getMerchantActiveDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, merchantId: number): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if(!merchantId || isNaN(merchantId)) {
        throw new BadRequestException(ResponseStauses.MerchantIdIsRequired)
      }

      if(!sortBy) {
        sortBy = 'd.id';
      } 
      if(!sortType) {
        sortType = 'DESC'
      }
      const drivers = await this.driversRepository.createQueryBuilder('d')
      .leftJoinAndSelect('d.subscription', 'subscription')
      .leftJoinAndSelect('d.driverTransports', 'driverTransports')
      .leftJoinAndSelect('driverTransports.transportKinds', 'transportKinds')
      .leftJoinAndSelect('driverTransports.transportTypes', 'transportTypes')
      .leftJoinAndSelect('driverTransports.cargoLoadMethods', 'cargoLoadMethods')
      .leftJoinAndSelect('d.agent', 'agent')
      .leftJoin('d.phoneNumbers', 'phoneNumber')
      .addSelect('phoneNumber.phoneNumber')
      .addSelect('phoneNumber.id')
      .leftJoin(User, 'u', 'u.id = d.created_by')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`u.user_type = '${UserTypes.DriverMerchantUser}'  AND  dm.id = ${merchantId} AND d.deleted = false AND d.blocked = false`)
      .skip((index - 1) * size) // Skip the number of items based on the page number
      .take(size)
      .orderBy(sortBy, sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC')
      .getMany();

      const driversCount = await this.driversRepository.createQueryBuilder('d')
      .leftJoin(User, 'u', 'u.id = d.created_by')
      .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
      .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
      .where(`u.user_type = '${UserTypes.DriverMerchantUser}'  AND  dm.id = ${merchantId} AND d.deleted = false AND d.blocked = false`)
      .getCount();
 
      const totalPagesCount = Math.ceil(driversCount / size);
      if (!drivers.length) {
        throw new NoContentException();
      }

      for(let driver of drivers) {
        const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
        driver['isBusy'] = isDriverBusy;
      }


      return new BpmResponse(true, { content: drivers, totalPagesCount, pageIndex: index, pageSize: size }, null);
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

  async deleteDriver(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driversRepository.findOneOrFail({ where: { id }, relations: ['phoneNumbers'] });

      if (driver.deleted) {
        // Driver is already deleted
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      driver.deleted = true;

      // Update phoneNumbers by adding underscores
      if (driver.phoneNumbers) {
        driver.phoneNumbers.forEach(phone => {
              phone.phoneNumber = '_' + phone.phoneNumber;
          });
      }
      await this.driversRepository.save(driver);

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
      const driver = await this.driversRepository.findOneOrFail({ where: { id } });

      if (driver.blocked) {
        // Driver is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      driver.blocked = true;
      driver.blockedAt = new Date();
      driver.blockReason = blockReason;
      driver.blockedBy = user;

      await this.driversRepository.save(driver);

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
      const driver = await this.driversRepository.findOneOrFail({ where: { id } });

      if (!driver.blocked) {
        // Driver is already active
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      driver.blockReason = null;
      driver.blockedAt = null;
      driver.blockedBy = null;
      driver.blocked = false;

      await this.driversRepository.save(driver);

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

  async getDriver() {
    const data = await this.driversRepository.find();
    return data

  }

  async appendDriverToAgent(driverId: number, agentId: number, userId: number): Promise<BpmResponse> {
    try {

      if (!driverId || isNaN(driverId)) {
        throw new BadRequestException(ResponseStauses.DriverIdIsRequired);
      } else if (!agentId || isNaN(agentId)) {
        throw new BadRequestException(ResponseStauses.AgentIdIsRequired);
      }

      const isExists: boolean = await this.driversRepository.exists({ where: { id: driverId, agent: { id: agentId }, blocked: false, deleted: false } });
      if(isExists) {
        throw new BadRequestException(ResponseStauses.DriverAlreadyAppended)
      }
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, blocked: false, deleted: false } });
      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: agentId, blocked: false, deleted: false } });

      driver.agent = agent;
      await this.driversRepository.save(driver);

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

  async getDriverByAgentId(id: number): Promise<BpmResponse> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const drivers: Driver[] = await this.driversRepository.find({ where: { agent: { id }, blocked: false, deleted: false }, relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'] });
      if (!drivers.length) {
        throw new NoContentException();
      } else {
        return new BpmResponse(true, drivers, null)
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

  async getDriverByMerchantId(id: number): Promise<BpmResponse> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const drivers: Driver[] = await this.driversRepository.find({ where: { driverMerchant: { id }, blocked: false, deleted: false }, relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'] });
      if (!drivers.length) {
        throw new NoContentException();
      } else {
        return new BpmResponse(true, drivers, null)
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