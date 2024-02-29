import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Agent, AwsService, BadRequestException, BpmResponse, Currency, Driver, DriverDto, DriverPhoneNumber, InternalErrorException, NoContentException, ResponseStauses, SundryService, Transaction, TransactionTypes, User, UserTypes } from '../..';
import * as dateFns from 'date-fns'

@Injectable()
export class DriversService {

  constructor(
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    private sundriesService: SundryService
  ) { }

  async createDriver(createDriverDto: DriverDto): Promise<BpmResponse> {
    // passportFile: any, driverLicenseFile: any, 
    const queryRunner = this.driversRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      if (!(/[a-zA-Z]/.test(createDriverDto.password) && /\d/.test(createDriverDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      const passwordHash = await this.sundriesService.generateHashPassword(createDriverDto.password);
      const driver: Driver = new Driver();
      driver.user = await this.usersRepository.save({ userType: 'driver', password: passwordHash });
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.email = createDriverDto.email;
      driver.citizenship = createDriverDto.citizenship;
      // driver.passportFilePath = passportFile.originalname.split(' ').join('').trim();
      // driver.driverLicenseFilePath = driverLicenseFile.originalname.split(' ').join('').trim();

      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber;
        driverPhoneNumber.driver = driver;
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;

      // Save driver and associated entities
      await this.driversRepository.save(driver);

      // Upload files to AWS
      // await Promise.all([passportFile, driverLicenseFile].map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));

      // Commit the transaction
      await queryRunner.commitTransaction();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
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
        driverPhoneNumber.phoneNumber = phoneNumber;
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
        .leftJoinAndSelect('driver.agent', 'agent')
        .leftJoinAndSelect('driver.subscription', 'subscription')
        .leftJoin('driver.user', 'user')
        .addSelect('user.id')
        .addSelect('user.userType')
        .addSelect('user.lastLogin')
        .where(`driver.deleted = false AND driver.id = ${id}`)
        .getOneOrFail();

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

  async getAllDrivers(pageSize: string, pageIndex: string, sortBy: string, sortType: string, driverId: number, firstName: string, phoneNumber: string, transportKindId: number,
     isSubscribed: boolean, status: string, isVerified: boolean,
     createdFrom: string, createdAtTo: string, lastLoginFrom: string, lastLoginTo: string): Promise<BpmResponse> {
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
    // if(transportKindId) {
    //   filter.transportKind = { id: transportKindId }
    // }
    if(isVerified == true || isVerified == false) {
      filter.verified = isVerified;
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
      return new BpmResponse(true, drivers, null);
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
        where: { active: true, deleted: false }, 
        relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }
      return new BpmResponse(true, drivers, null);
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
        where: { active: false, deleted: false }, 
        relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }
      return new BpmResponse(true, drivers, null);
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
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
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
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
      });
      if (!drivers.length) {
        throw new NoContentException();
      }
      return new BpmResponse(true, drivers, null);
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

  async deleteDriver(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driversRepository.findOneOrFail({ where: { id } });

      if (driver.deleted) {
        // Driver is already deleted
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      const updateResult = await this.driversRepository.update({ id: driver.id }, { deleted: true });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified)
      }
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

  async blockDriver(id: number, blockReason: string): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driversRepository.findOneOrFail({ where: { id } });

      if (!driver.active) {
        // Driver is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      const updateResult = await this.driversRepository.update({ id: driver.id }, { active: false, blockReason });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified)
      }
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

  async activateDriver(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const driver = await this.driversRepository.findOneOrFail({ where: { id } });

      if (driver.active) {
        // Driver is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      const updateResult = await this.driversRepository.update({ id: driver.id }, { active: true });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified)
      }
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

      const isExists: boolean = await this.driversRepository.exists({ where: { id: driverId, agent: { id: agentId }, active: true, deleted: false } });
      if(isExists) {
        throw new BadRequestException(ResponseStauses.DriverAlreadyAppended)
      }
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId, active: true, deleted: false } });
      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: agentId, active: true, deleted: false } });

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
      const drivers: Driver[] = await this.driversRepository.find({ where: { agent: { id }, active: true, deleted: false }, relations: ['phoneNumbers', 'driverTransports', 'agent', 'subscription'] });
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