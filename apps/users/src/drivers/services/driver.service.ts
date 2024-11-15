import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Agent, AppendDriversToTmsDto, AwsService, BadRequestException, BpmResponse, CargoStatusCodes, Currency, CustomJwtService, Driver, DriverDocuments, DriverDto, DriverMerchant, DriverMerchantUser, DriverPhoneNumber, DriverTransport, InternalErrorException, NoContentException, NotFoundException, OrderOffer, ResponseStauses, SundryService, Transaction, TransactionTypes, UpdateDriverDto, User, UserDocumentTypes, UserStates, UserTypes } from '../..';
import { DriversRepository } from '../repositories/drivers.repository';
import { GetDriversDto, UpdateDriverBirthDayDto, UpdateDriverPhoneDto, AwsS3BucketKeyNames } from '../../';

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
      const newUser = await queryRunner.manager.save(User, { userType: 'driver' });
      driver.user = newUser;
      driver.firstName = createDriverDto.firstName;
      driver.lastName = createDriverDto.lastName;
      driver.birthdayDate = createDriverDto.birthdayDate;
      if(files && files.profile) {
        const profile = files.profile[0];
        const profileDoc = new DriverDocuments();
        profileDoc.driverId = driver.id;
        profileDoc.name = profile.originalname?.split(' ').join('').trim();
        profileDoc.bucket = 'drivers';
        profileDoc.mimeType = profile.mimetype;
        profileDoc.size = profile.size;
        profileDoc.docType = UserDocumentTypes.Profile;
        profileDoc.fileHash = profile.filename?.split(' ').join('').trim();
        profileDoc.description = profile.description;
        driver.profileFile = profileDoc;
        await queryRunner.manager.save(DriverDocuments, profileDoc);

        const res = await this.awsService.uploadFile(AwsS3BucketKeyNames.DriversProfiles, profile);
        if(!res) {
          throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
        }
      }

      if(typeof createDriverDto.phoneNumbers == 'string') {
        createDriverDto.phoneNumbers = JSON.parse(createDriverDto.phoneNumbers)
      }
      
      if(!(createDriverDto.phoneNumbers instanceof Array)) {
        throw new BadRequestException(ResponseStauses.PhoneNumbeersMustBeArray)
      }

      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phone => {
        if(!phone.number || !phone.code || !phone.isMain) {
          throw new BadRequestException(ResponseStauses.PhoneNumberShouldContainAll)
        }
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.number = phone.number.toString().replaceAll('+', '').trim();
        driverPhoneNumber.code = phone.code;
        driverPhoneNumber.isMain = phone.isMain;
        driverPhoneNumber.createdBy = newUser;
        driverPhoneNumber.driver = driver; 
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;

      // Save driver and associated entities
      const newDriver = await queryRunner.manager.save(Driver, driver);

      
      // Commit the transaction
      await queryRunner.commitTransaction();

      const payload: any = { sub: newDriver.id, userId: newUser.id, userType: UserTypes.Driver };
      const token: string = await this.customJwtService.generateToken(payload);

      return new BpmResponse(true, { token }, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      if(files && files.profile) {
        const profile = files.profile[0].originalname.split(' ').join('').trim();
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversProfiles, profile);
      }
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
        if(files.passport) {
          const passport = files.passport[0];
          const passportDoc = new DriverDocuments();
          passportDoc.driverId = driver.id;
          passportDoc.name = passport.originalname.split(' ').join('').trim();
          passportDoc.bucket = AwsS3BucketKeyNames.DriversPassports;
          passportDoc.mimeType = passport.mimetype;
          passportDoc.size = passport.size;
          passportDoc.docType = UserDocumentTypes.Passport;
          passportDoc.fileHash = passport.filename.split(' ').join('').trim();
          passportDoc.description = passport.description;
          driver.passportFile = passportDoc;
          await queryRunner.manager.save(DriverDocuments, passportDoc);
          passport.bucket = AwsS3BucketKeyNames.DriversPassports;
          uploads.push(passport);
        }
        if(files.profile) {
          const profile = files.profile[0];
          const profileDoc = new DriverDocuments();
          profileDoc.driverId = driver.id;
          profileDoc.name = profile.originalname.split(' ').join('').trim();
          profileDoc.bucket = AwsS3BucketKeyNames.DriversProfiles;
          profileDoc.mimeType = profile.mimetype;
          profileDoc.size = profile.size;
          profileDoc.docType = UserDocumentTypes.Profile;
          profileDoc.fileHash = profile.filename.split(' ').join('').trim();
          profileDoc.description = profile.description;
          driver.profileFile = profileDoc;
          await queryRunner.manager.save(DriverDocuments, profileDoc);
          profile.bucket = AwsS3BucketKeyNames.DriversProfiles;
          uploads.push(profile);
        }
        if(files.driverLicense) {
          const driverLicense = files.driverLicense[0];
          const driverLicenseDoc = new DriverDocuments();
          driverLicenseDoc.driverId = driver.id;
          driverLicenseDoc.name = driverLicense.originalname.split(' ').join('').trim();
          driverLicenseDoc.bucket = AwsS3BucketKeyNames.DriversLicenses;
          driverLicenseDoc.mimeType = driverLicense.mimetype;
          driverLicenseDoc.size = driverLicense.size;
          driverLicenseDoc.docType = UserDocumentTypes.DriverLicense;
          driverLicenseDoc.fileHash = driverLicense.filename.split(' ').join('').trim();
          driverLicenseDoc.description = driverLicense.description;
          driver.driverLicenseFile = driverLicenseDoc;
          await queryRunner.manager.save(DriverDocuments, driverLicenseDoc);
          driverLicense.bucket = AwsS3BucketKeyNames.DriversLicenses;
          uploads.push(driverLicense);
        }

        // Upload files to AWS
      const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(file.bucket, file)));
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
      const driverPhoneNumbers = createDriverDto.phoneNumbers.map(phone => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.number = phone.number.toString().replaceAll('+', '').trim();
        driverPhoneNumber.code = phone.code;
        driverPhoneNumber.isMain = phone.isMain;
        driverPhoneNumber.createdBy = newUser;
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
      if(files && files.passport) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversPassports, files.passport[0]?.originalname.split(' ').join('').trim());
      }
      if(files && files.profile) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversProfiles, files.profile[0]?.originalname.split(' ').join('').trim());
      }
      if(files && files.driverLicense) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversLicenses, files.driverLicense[0]?.originalname.split(' ').join('').trim());
      }
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
    const queryRunner = this.driverRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      const driver = await queryRunner.manager.findOneOrFail(Driver, { where: { id: updateDriverDto.id } })
      driver.firstName = updateDriverDto.firstName || driver.firstName;
      driver.lastName = updateDriverDto.lastName || driver.lastName;
      driver.email = updateDriverDto.email || driver.email;
      driver.birthdayDate = updateDriverDto.birthdayDate || driver.birthdayDate;
      driver.citizenship = updateDriverDto.citizenship || driver.citizenship;

      const driverPhoneNumbers = updateDriverDto.phoneNumbers.map(phone => {
        const driverPhoneNumber = new DriverPhoneNumber();
        driverPhoneNumber.number = phone.number.toString().replaceAll('+', '').trim();
        driverPhoneNumber.code = phone.code;
        driverPhoneNumber.isMain = phone.isMain;
        driverPhoneNumber.driver = driver; 
        return driverPhoneNumber;
      });
      driver.phoneNumbers = driverPhoneNumbers;
            
      if(files) {
        const uploads: any = [];
        if(files.passport) {
          const passport = files.passport[0];
          const passportDoc = new DriverDocuments();
          passportDoc.driverId = driver.id;
          passportDoc.name = passport.originalname.split(' ').join('').trim();
          passportDoc.bucket = AwsS3BucketKeyNames.DriversPassports;
          passportDoc.mimeType = passport.mimetype;
          passportDoc.size = passport.size;
          passportDoc.docType = UserDocumentTypes.Passport;
          passportDoc.fileHash = passport.filename.split(' ').join('').trim();
          passportDoc.description = passport.description;
          driver.passportFile = passportDoc;
          await queryRunner.manager.save(DriverDocuments, passportDoc);
          passport.bucket = AwsS3BucketKeyNames.DriversPassports;
          uploads.push(passport);
        }
        if(files.profile) {
          const profile = files.profile[0];
          const profileDoc = new DriverDocuments();
          profileDoc.driverId = driver.id;
          profileDoc.name = profile.originalname.split(' ').join('').trim();
          profileDoc.bucket = AwsS3BucketKeyNames.DriversProfiles;
          profileDoc.mimeType = profile.mimetype;
          profileDoc.size = profile.size;
          profileDoc.docType = UserDocumentTypes.Profile;
          profileDoc.fileHash = profile.filename.split(' ').join('').trim();
          profileDoc.description = profile.description;
          driver.profileFile = profileDoc;
          await queryRunner.manager.save(DriverDocuments, profileDoc);
          profile.bucket = AwsS3BucketKeyNames.DriversProfiles;
          uploads.push(profile);
        }
        if(files.driverLicense) {
          const driverLicense = files.driverLicense[0];
          const driverLicenseDoc = new DriverDocuments();
          driverLicenseDoc.driverId = driver.id;
          driverLicenseDoc.name = driverLicense.originalname.split(' ').join('').trim();
          driverLicenseDoc.bucket = AwsS3BucketKeyNames.DriversLicenses;
          driverLicenseDoc.mimeType = driverLicense.mimetype;
          driverLicenseDoc.size = driverLicense.size;
          driverLicenseDoc.docType = UserDocumentTypes.DriverLicense;
          driverLicenseDoc.fileHash = driverLicense.filename.split(' ').join('').trim();
          driverLicenseDoc.description = driverLicense.description;
          driver.driverLicenseFile = driverLicenseDoc;
          await queryRunner.manager.save(DriverDocuments, driverLicenseDoc);
          driverLicense.bucket = AwsS3BucketKeyNames.DriversLicenses;
          uploads.push(driverLicense);
        }

        // Upload files to AWS
        const res = await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(file.bucket, file)));
        if(res.includes(false)) {
          // await queryRunner.rollbackTransaction();
          throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
        }

      }
      
      await queryRunner.manager.save(Driver, driver)
           
      // Commit the transaction
      await queryRunner.commitTransaction();
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if(files && files.passport[0]) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversPassports, files.passport[0]?.originalname.split(' ').join('').trim());
      }
      if(files && files.profile[0]) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversProfiles, files.profile[0]?.originalname.split(' ').join('').trim());
      }
      if(files && files.driverLicense[0]) {
        this.awsService.deleteFile(AwsS3BucketKeyNames.DriversLicenses, files.driverLicense[0]?.originalname.split(' ').join('').trim());
      }   
      console.log(err)
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

  async updateDriverPhoneNumber(updateDriverPhoneDto: UpdateDriverPhoneDto, driverId: number, phoneNumberId: number, user: any): Promise<BpmResponse> {
    try {

      const phoneNumber = await this.driverPhoneNumbersRepository.findOneOrFail({ where: { id: phoneNumberId, driver: { id: driverId } } });
      phoneNumber.number = updateDriverPhoneDto.number.toString().replaceAll('+', '').trim();
      phoneNumber.code = updateDriverPhoneDto.code;
      await this.driverPhoneNumbersRepository.save(phoneNumber);
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

  async updateDrierProfile(files: any, driverId: number): Promise<BpmResponse> {
    try {

      if(!files.profile || !files.profile[0]) {
        throw new BadRequestException(ResponseStauses.FileIsRequired)
      }
      const driver = await this.driverRepository.findOneOrFail({where: { id: driverId }});

      const profile = files.profile[0];
      const profileDoc = new DriverDocuments();
      profileDoc.driverId = driver.id;
      profileDoc.name = profile.originalname.split(' ').join('').trim();
      profileDoc.bucket = 'drivers';
      profileDoc.mimeType = profile.mimetype;
      profileDoc.size = profile.size;
      profileDoc.docType = UserDocumentTypes.Profile;
      profileDoc.fileHash = profile.filename.split(' ').join('').trim();
      profileDoc.description = profile.description;
      driver.profileFile = profileDoc;
        
      const res = await this.awsService.uploadFile(AwsS3BucketKeyNames.DriversProfiles, profile);
      if(!res) {
        throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
      }

      await this.driverRepository.save(driver)
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.message.includes('EntityNotFoundError')) {
        throw new NoContentException();
      } else if (err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }
  async addPhoneNumber(createDriverPhoneDto: UpdateDriverPhoneDto, driverId: number, user: any): Promise<BpmResponse> {
    try {
      const driver = await this.driverRepository.findOneOrFail({where: { id: driverId }});

      const newPhoneNumber = new DriverPhoneNumber();
      newPhoneNumber.number = createDriverPhoneDto.number;
      newPhoneNumber.code = createDriverPhoneDto.code;
      newPhoneNumber.driver = driver;
      newPhoneNumber.createdBy = user.id;

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

  async updateDriverBirthday(updateDriverBirthDayDto: UpdateDriverBirthDayDto, driverId: number, user: any): Promise<BpmResponse> {
    try {
      const driver = await this.driverRepository.findOneOrFail({ where: {id: driverId} });
      driver.birthdayDate = updateDriverBirthDayDto.birthdayDate;

      await this.driverRepository.save(driver);

      return new BpmResponse(true, null, null);
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

  async getDriverById(id: number): Promise<BpmResponse> {

    try {
      const driver = await this.driverRepository
        .createQueryBuilder('driver')
        .leftJoinAndSelect('driver.driverMerchant', 'driverMerchant')
        .leftJoinAndSelect('driver.driverTransports', 'transports')
        .leftJoinAndSelect('transports.transportType', 'transportType')
        .leftJoinAndSelect('transports.transportKind', 'transportKind')
        .leftJoinAndSelect('transports.cargoLoadMethods', 'cargoLoadMethods')
        .leftJoin('driver.phoneNumbers', 'phoneNumber')
        .addSelect('phoneNumber.id')
        .addSelect('phoneNumber.number')
        .addSelect('phoneNumber.code')
        .addSelect('phoneNumber.isMain')
        .leftJoin('driver.user', 'user')
        .addSelect('user.id')
        .addSelect('user.userType')
        .addSelect('user.lastLogin')
        .where(`driver.is_deleted = false AND driver.id = ${id}`)
        .getOneOrFail();

        // const canceledOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { cargoStatus: { code: CargoStatusCodes.Canceled } } } });
        // const closdOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { isSafeTransaction: true,  cargoStatus: { code: CargoStatusCodes.Closed } } } });
        // const completedOrdersCount = await this.orderOffersRepository.count({ where: { accepted: true, driver: { id }, order: { isSafeTransaction: false,  cargoStatus: { code: CargoStatusCodes.Completed } } } });


      // const isDriverBusy = await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: false, cargoStatus: { code: CargoStatusCodes.Accepted } } } }) || await this.orderOffersRepository.exists({ where: { accepted: true, driver: { id: driver.id }, order: { isSafeTransaction: true, cargoStatus: { code: In([CargoStatusCodes.Accepted, CargoStatusCodes.Completed]) } } } });
      // driver['isBusy'] = isDriverBusy;
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
    try {
        // Query to retrieve driver by phone number
        const driver = await this.driverRepository
            .createQueryBuilder('driver')
            .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
            .leftJoinAndSelect('driver.driverMerchant', 'driverMerchant')
            .leftJoinAndSelect('driver.driverTransports', 'transports')
            .leftJoinAndSelect('transports.transportType', 'transportType')
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

  async getAllDrivers(query: GetDriversDto): Promise<BpmResponse> {
    try {
      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 0;
      const sort: any = {};
      if(query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType; 
      } else {
        sort['id'] = 'DESC'
      }
    const filter: any = { 
      deleted: false,
      driverId: query.driverId, 
      firstName: query.firstName, 
      phoneNumber: query.phoneNumber, 
      transportKindId: query.transportKindId,
      transportTypeId: query.transportTypeId, 
      isSubscribed: query.isSubscribed, 
      status: query.status, 
      isVerified: query.isVerified,
      createdAtFrom: query.createdAtFrom, 
      createdAtTo: query.createdAtTo, 
      lastLoginFrom: query.lastLoginFrom, 
      lastLoginTo: query.lastLoginTo,
      state: query.state
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
  
  async getMerchantDrivers(merchantId: number, query: GetDriversDto): Promise<BpmResponse> {
    try {
      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 0;
      if(!merchantId || isNaN(merchantId)) {
        throw new BadRequestException(ResponseStauses.MerchantIdIsRequired)
      }

      const sort: any = {};
      if(query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const filter = {
        merchantId,
        deleted: false,
        driverId: query.driverId, 
        firstName: query.firstName, 
        phoneNumber: query.phoneNumber, 
        transportKindId: query.transportKindId,
        transportTypeId: query.transportTypeId, 
        isSubscribed: query.isSubscribed, 
        status: query.status, 
        isVerified: query.isVerified,
        createdAtFrom: query.createdAtFrom, 
        createdAtTo: query.createdAtTo, 
        lastLoginFrom: query.lastLoginFrom, 
        lastLoginTo: query.lastLoginTo,
        state: query.state
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
      const driver = await this.driverRepository.findOneOrFail({ where: { id }, relations: ['phoneNumbers'] });

      if (driver.isDeleted) {
        // Driver is already deleted
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      driver.isDeleted = true;
      driver.deletedAt = new Date();
      driver.deletedBy = user;

      // Update phoneNumbers by adding underscores
      await Promise.all(driver.phoneNumbers.map(async (phoneNumber) => {
        phoneNumber.isDeleted = true;
        phoneNumber.deletedAt = new Date();
        await this.driverPhoneNumbersRepository.save(phoneNumber);  
      }))

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
      const driver = await this.driverRepository.findOneOrFail({ where: { id } });

      if (driver.isBlocked) {
        // Driver is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      driver.isBlocked = true;
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
      const driver = await this.driverRepository.findOneOrFail({ where: { id } });

      if (!driver.isBlocked) {
        // Driver is already active
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      driver.blockReason = null;
      driver.blockedAt = null;
      driver.blockedBy = null;
      driver.isBlocked = false;

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

  async appendDriverToMerchant(dto: AppendDriversToTmsDto, tmsId: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
          throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      const drivers: Driver[] = await this.driverRepository.find({ where: { id: In(dto.driverIds) }, relations: ['driverMerchant'] });
      const isAssignedExists = drivers.some((el: any) => el.driverMerchant);
      if(isAssignedExists) {
        throw new BadRequestException(ResponseStauses.AlreadyAssigned);
      }
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: tmsId }, relations: ['drivers'] });
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

  async assignDriverToAgent(driverId: number, agentId: number, user: any): Promise<BpmResponse> {
    try {

      const isExists: boolean = await this.driverRepository.exists({ where: { id: driverId, agent: { id: agentId }, isBlocked: false, isDeleted: false } });
      if(isExists) {
        throw new BadRequestException(ResponseStauses.DriverAlreadyAssigned);
      }
      const driver: Driver = await this.driverRepository.findOneOrFail({ where: { id: driverId, isBlocked: false, isDeleted: false } });
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

  async getAgentDrivers(agentId: number, query: GetDriversDto): Promise<BpmResponse> {
    try {

      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 0;
      const sort: any = {};
      if(query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }

      if (!agentId || isNaN(agentId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      let filter: any = { 
        agentId,
        deleted: false,
        driverId: query.driverId, 
        firstName: query.firstName, 
        phoneNumber: query.phoneNumber, 
        transportKindId: query.transportKindId,
        transportTypeId: query.transportTypeId, 
        isSubscribed: query.isSubscribed, 
        status: query.status, 
        isVerified: query.isVerified,
        createdAtFrom: query.createdAtFrom, 
        createdAtTo: query.createdAtTo, 
        lastLoginFrom: query.lastLoginFrom, 
        lastLoginTo: query.lastLoginTo,
        state: query.state
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