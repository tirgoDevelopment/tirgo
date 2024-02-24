import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AwsService, BpmResponse, DriverMerchant, InternalErrorException, ResponseStauses, SundryService, User, CreateDriverMerchantDto, NotFoundException, UserTypes, CreateInStepDriverMerchantDto, CompleteDriverMerchantDto, DriverBankAccount, CreateDriverMerchantUserDto, DriverMerchantUser, Role, BadRequestException } from '..';

@Injectable()
export class DriverMerchantsService {

  constructor(
    @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
    @InjectRepository(DriverMerchantUser) private readonly driverMerchantUsersRepository: Repository<DriverMerchantUser>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(DriverBankAccount) private readonly bankAccountRepository: Repository<DriverBankAccount>,
    private sundriesService: SundryService,
    private awsService: AwsService,
    private dataSource: DataSource
  ) { }

  async createDriverMerchant(createDriverMerchantDto: CreateDriverMerchantDto) {
    try {
      const passwordHash = await this.sundriesService.generateHashPassword(createDriverMerchantDto.password);
      const driverMerchant: DriverMerchant = await this.driverMerchantsRepository.create();
      driverMerchant.user = await this.usersRepository.save({ userType: UserTypes.DriverMerchant, password: passwordHash });
      driverMerchant.email = createDriverMerchantDto.email;
      driverMerchant.phoneNumber = createDriverMerchantDto.phoneNumber;
      driverMerchant.companyName = createDriverMerchantDto.companyName;
      driverMerchant.companyType = createDriverMerchantDto.companyType;

      const newDriverMerchant = await this.driverMerchantsRepository.save(driverMerchant);
      if (newDriverMerchant) {
        return new BpmResponse(true, newDriverMerchant, null)
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

  async createInStepMerchant(files: any, createMerchantDto: CreateInStepDriverMerchantDto) {
    try {
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: createMerchantDto.merchantId } });

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
        INSERT INTO bank_account (account, currency) 
        VALUES
          ${completeMerchantDto.bankAccounts.map((account: any) => `('${account.account}', '${account.currency}')`).join(', ')}
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
        driverMerchantUser.phoneNumber = createUserDto.phoneNumber;
  
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

    async verifyMerchant(id: number): Promise<BpmResponse> {
      if(!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      try {
        await queryRunner.startTransaction();
        const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneByOrFail({ id });
        if (merchant) {
  
          if(merchant.verified) {
            throw new BadRequestException(ResponseStauses.MerchantAlreadyVerified)
          }
  
          merchant.verified = true;
          merchant.verifiedAt = new Date()
          const verified = await this.driverMerchantsRepository.save(merchant);
          if (verified) {
            const role = (await this.rolesRepository.findOne({ where: { name: 'Super admin' } }));
            const merchantBaseUser: User = await this.usersRepository.findOneOrFail({ where: { id: merchant.user?.id } });
            const user: User = await this.usersRepository.save({ userType: UserTypes.ClientMerchantUser, password: merchantBaseUser.password, role: role });
  
            const clientMerchantUser: DriverMerchantUser = new DriverMerchantUser();
            clientMerchantUser.user = user;
            clientMerchantUser.driverMerchant = merchant;
            clientMerchantUser.fullName = merchant.supervisorFirstName + ' ' + merchant.supervisorLastName;
            clientMerchantUser.username = merchant.email;
            clientMerchantUser.phoneNumber = merchant.phoneNumber;
  
            const newMerchantUser = await this.driverMerchantUsersRepository.save(clientMerchantUser);
            await queryRunner.commitTransaction();
            return new BpmResponse(true, newMerchantUser, [ResponseStauses.SuccessfullyVerified]);
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
  

  async getMerchants() {
    return await this.driverMerchantsRepository.find()
  }

}