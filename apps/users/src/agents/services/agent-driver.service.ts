import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Agent, AwsService, BadRequestException, BpmResponse, Currency, Driver, DriverDto, DriverPhoneNumber, InternalErrorException, NotFoundException, ResponseStauses, Subscription, SundryService, Transaction, TransactionTypes, User, UserTypes } from '../..';
import * as dateFns from 'date-fns'

@Injectable()
export class AgentDriversService {

  constructor(
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(DriverPhoneNumber) private readonly driverPhonenumbersRepository: Repository<DriverPhoneNumber>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Currency) private readonly currenciesRepository: Repository<Currency>,
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    private awsService: AwsService,
    private sundriesService: SundryService,
    private dataSource: DataSource
  ) { }

  async createDriver(files: any, createDriverDto: any, user: User): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      if (!(/[a-zA-Z]/.test(createDriverDto.password) && /\d/.test(createDriverDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      if (!createDriverDto.agentId || isNaN(createDriverDto.agentId)) {
        throw new BadRequestException(ResponseStauses.AgentIdIsRequired);
      }

      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: createDriverDto.agentId } });

      const passwordHash = await this.sundriesService.generateHashPassword(createDriverDto.password);
      const driver: Driver = new Driver();
      driver.user = await queryRunner.manager.save(User, { userType: 'driver', password: passwordHash });
      driver.agent = agent;
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.email = createDriverDto.email;
      driver.citizenship = createDriverDto.citizenship;
      driver.createdBy = user;

      if (files) {
        const fileUploads = []
        if (files.passport && files.passport[0]) {
          driver.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.passport[0])
        }
        if (files.driverLicense && files.driverLicense[0]) {
          driver.driverLicenseFilePath = files.driverLicense[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.driverLicense[0])
        }
        // Upload files to AWS
        await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.ClientMerchant, file)));
      }

      // Save the driver without phone numbers first
      const resDriver = await await queryRunner.manager.save(Driver, driver);

      // Create driver phone numbers
      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replaceAll('+', '').trim();
        driverPhoneNumber.driver = resDriver; // Use the saved driver instance
        return driverPhoneNumber;
      });

      // Save driver phone numbers
      await queryRunner.manager.save(DriverPhoneNumber, driverPhoneNumbers);

      //create transaction if exist subscription
      if (createDriverDto.subscriptionId) {
        const subscription: Subscription = await this.subscriptionsRepository.findOneOrFail({ where: { id: createDriverDto.subscriptionId }, relations: ['currency'] })
        const currency = await this.currenciesRepository.findOneOrFail({ where: { id: subscription.currency?.id } });

        const transaction = {
          createdBy: user,
          currency: currency,
          userType: user.userType,
          amount: subscription.price,
          transactionType: TransactionTypes.DriverSubscriptionPayment,
          driver: resDriver, 
          verified: true,
          agent: agent
        };
        await queryRunner.manager.save(Transaction, transaction);
        driver.subscription = subscription;
        driver.subscribedAt = new Date();
        driver.subscribedTill = dateFns.add(new Date(), { months: subscription.duration });
        await await queryRunner.manager.save(Driver, driver);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('Agent')) {
          throw new NotFoundException(ResponseStauses.AgentNotFound)
        }
      } else if (err instanceof HttpException) {
        throw err;
      } else if (err.code === '23505' && err.table == 'driver_phone_number') {
        throw new InternalErrorException(ResponseStauses.PhoneNumberDuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async updateDriver(files: any, updateDriverDto: any, user: User): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      if (!updateDriverDto.agentId || isNaN(updateDriverDto.agentId)) {
        throw new BadRequestException(ResponseStauses.AgentIdIsRequired);
      }

      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: updateDriverDto.agentId } });
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: updateDriverDto.driverId } });
      driver.firstName = updateDriverDto.firstName || driver.firstName;
      driver.lastName = updateDriverDto.lastName || driver.lastName;
      driver.email = updateDriverDto.email || driver.email;
      driver.citizenship = updateDriverDto.citizenship || driver.citizenship;

      if (files) {
        const fileUploads = []
        if (files.passport && files.passport[0]) {
          driver.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.passport[0])
        }
        if (files.driverLicense && files.driverLicense[0]) {
          driver.driverLicenseFilePath = files.driverLicense[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.driverLicense[0])
        }
        // Upload files to AWS
        await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.ClientMerchant, file)));
      }

      // Save the driver without phone numbers first
      const resDriver = await await queryRunner.manager.save(Driver, driver);

      // Create driver phone numbers
      const driverPhoneNumbers = updateDriverDto.phoneNumbers.map(phoneNumber => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.phoneNumber = phoneNumber.toString().replaceAll('+', '').trim();
        driverPhoneNumber.driver = resDriver; // Use the saved driver instance
        return driverPhoneNumber;
      });

      // Save driver phone numbers
      await queryRunner.manager.save(DriverPhoneNumber, driverPhoneNumbers);

      //create transaction if exist subscription
      if (updateDriverDto.subscriptionId) {
        const subscription: Subscription = await this.subscriptionsRepository.findOneOrFail({ where: { id: updateDriverDto.subscriptionId }, relations: ['currency'] })
        const currency = await this.currenciesRepository.findOneOrFail({ where: { id: subscription.currency?.id } });

        const transaction = {
          createdBy: user,
          currency: currency,
          userType: user.userType,
          amount: subscription.price,
          transactionType: TransactionTypes.DriverSubscriptionPayment,
          driver: resDriver, 
          verified: true,
          agent: agent
        };
        await queryRunner.manager.save(Transaction, transaction);
        driver.subscription = subscription;
        driver.subscribedAt = new Date();
        driver.subscribedTill = dateFns.add(new Date(), { months: subscription.duration });
        await await queryRunner.manager.save(Driver, driver);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('Agent')) {
          throw new NotFoundException(ResponseStauses.AgentNotFound)
        }
      } else if (err instanceof HttpException) {
        throw err;
      } else if (err.code === '23505' && err.table == 'driver_phone_number') {
        throw new InternalErrorException(ResponseStauses.PhoneNumberDuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async addSubscriptionToDriver(driverId: number, subscriptionId: number, user: User): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      if(!driverId || isNaN(driverId)) {
        throw new BadRequestException(ResponseStauses.DriverIdIsRequired);
      }
      if(!subscriptionId || isNaN(subscriptionId)) {
        throw new BadRequestException(ResponseStauses.SubscriptionIsRequired)
      }

      const subscription: Subscription = await this.subscriptionsRepository.findOneOrFail({ where: { active: true, id: subscriptionId }, relations: ['currency'] });
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { blocked: false, id: driverId } });

      driver.subscribedAt = new Date();
      driver.subscribedTill = dateFns.add(new Date(), { months: subscription.duration });
      driver.subscription = subscription;
      await queryRunner.manager.save(Driver, driver);

      const transaction = {
        createdBy: user,
        currency: subscription.currency,
        userType: user.userType,
        amount: subscription.price,
        transactionType: TransactionTypes.DriverSubscriptionPayment,
        driver: driver, 
        agent: user,
        verified: true
      };
      await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();
      return new BpmResponse(true, null)
    } catch(err: any) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('Agent')) {
          throw new NotFoundException(ResponseStauses.AgentNotFound)
        }
      } else if (err instanceof HttpException) {
        throw err;
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

}