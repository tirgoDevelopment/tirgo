import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsS3BucketKeyNames, AwsService, BadRequestException, BpmResponse, CargoStatusCodes, Client, ClientDto, ClientPhoneNumber, CustomJwtService, GetClientsDto, InternalErrorException, NoContentException, NotFoundException, Order, ResponseStauses, SundryService, UpdateClientBirthDayDto, UpdateClientPhoneDto, User, UserDocumentTypes, UserStates, UserTypes } from '..';
import { ClientsRepository } from './repositories/client.repository';
import { ClientDocuments } from '..';

@Injectable()
export class ClientsService {

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(ClientPhoneNumber) private readonly clientPhoneNumberRepository: Repository<ClientPhoneNumber>,
    private awsService: AwsService,
    private readonly clientRepository: ClientsRepository,
    private sundriesService: SundryService,
    private customJwtService: CustomJwtService
  ) { }

  async createClient(files: any, createClientDto: ClientDto, user: User): Promise<BpmResponse> {
    const queryRunner = this.clientRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    let profileFile;
    try {
      await queryRunner.startTransaction();

      const client: Client = queryRunner.manager.create(Client);
      const newUser = await this.usersRepository.save({ userType: UserTypes.Client });
      client.user = newUser;
      client.firstName = createClientDto.firstName;
      client.lastName = createClientDto.lastName;


      if (user && user.userType == UserTypes.Staff) {
        client.createdBy = user;
      }

      if (typeof createClientDto.phoneNumbers == 'string') {
        createClientDto.phoneNumbers = JSON.parse(createClientDto.phoneNumbers)
      }
      if (!(createClientDto.phoneNumbers instanceof Array)) {
        throw new BadRequestException(ResponseStauses.PhoneNumbeersMustBeArray)
      }
      const clientPhoneNumbers = createClientDto.phoneNumbers.map(phone => {
        const clientPhoneNumber = new ClientPhoneNumber();
        clientPhoneNumber.number = phone.number.toString().replaceAll('+', '').trim();
        clientPhoneNumber.code = phone.code;
        clientPhoneNumber.isMain = phone.isMain;
        clientPhoneNumber.client = client; 
        return clientPhoneNumber;
      });
      client.phoneNumbers = clientPhoneNumbers;

      const newClient = await this.clientRepository.save(client);

      if(files && files.profile) {
        profileFile = files.profile[0];

        const profileDoc = new ClientDocuments();
        profileDoc.clientId = newClient.id;
        profileDoc.name = profileFile.originalname?.split(' ').join('').trim();
        profileDoc.bucket = 'clients';
        profileDoc.mimeType = profileFile.mimetype;
        profileDoc.size = profileFile.size;
        profileDoc.docType = UserDocumentTypes.Profile;
        profileDoc.fileHash = profileFile.filename?.split(' ').join('').trim();
        profileDoc.description = profileFile.description;
        client.profileFile = profileDoc;
        await queryRunner.manager.save(ClientDocuments, profileDoc);

        const res = await this.awsService.uploadFile(AwsS3BucketKeyNames.ClientsProfiles, profileFile);
        if(!res) {
          throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
        }
      }

      await queryRunner.commitTransaction();

      const payload: any = { sub: newClient.id, userId: newUser.id, userType: UserTypes.Client };
      const token: string = await this.customJwtService.generateToken(payload);
      return new BpmResponse(true, { token }, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      await queryRunner.rollbackTransaction();
      this.awsService.deleteFile(AwsS3BucketKeyNames.ClientsProfiles, profileFile.originalname?.split(' ').join('').trim())

      if (err instanceof HttpException) {
        throw err
      } else if (err.code == '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async updateClient(profileFile: any, updateClientDto: ClientDto): Promise<BpmResponse> {
    const queryRunner = this.clientRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const client = await this.clientRepository.findOneOrFail({ where: { id: updateClientDto.id } });
      client.firstName = updateClientDto.firstName || client.firstName;
      client.lastName = updateClientDto.lastName || client.lastName;

      if(profileFile) {
        const profileDoc = new ClientDocuments();
        profileDoc.clientId = client.id;
        profileDoc.name = profileFile.originalname.split(' ').join('').trim();
        profileDoc.bucket = 'clients';
        profileDoc.mimeType = profileFile.mimetype;
        profileDoc.size = profileFile.size;
        profileDoc.docType = UserDocumentTypes.Profile;
        profileDoc.fileHash = profileFile.filename.split(' ').join('').trim();
        profileDoc.description = profileFile.description;
        client.profileFile = profileDoc;
        await queryRunner.manager.save(ClientDocuments, profileDoc);

        const res = await this.awsService.uploadFile(AwsS3BucketKeyNames.ClientsProfiles, profileDoc);
        if(!res) {
          throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
        }
      }

      await queryRunner.commitTransaction();
      const res = await this.clientRepository.update({ id: client.id }, client);
      if (res.affected) {
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
      } else {
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async updateClientProfile(files: any, clientId: number): Promise<BpmResponse> {
    try {

      if(!files.profile || !files.profile[0]) {
        throw new BadRequestException(ResponseStauses.FileIsRequired)
      }
      const client = await this.clientRepository.findOneOrFail({where: { id: clientId }});

      const profile = files.profile[0];
      const profileDoc = new ClientDocuments();
      profileDoc.clientId = client.id;
      profileDoc.name = profile.originalname.split(' ').join('').trim();
      profileDoc.bucket = 'clients';
      profileDoc.mimeType = profile.mimetype;
      profileDoc.size = profile.size;
      profileDoc.docType = UserDocumentTypes.Profile;
      profileDoc.fileHash = profile.filename.split(' ').join('').trim();
      profileDoc.description = profile.description;
      client.profileFile = profileDoc;
        
      const res = await this.awsService.uploadFile(AwsS3BucketKeyNames.ClientsProfiles, profile);
      if(!res) {
        throw new InternalErrorException(ResponseStauses.AwsStoreFileFailed);
      }

      await this.clientRepository.save(client)
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

  async updateClientPhoneNumber(updateDriverPhoneDto: UpdateClientPhoneDto, clientId: number, phoneNumberId: number, user: any): Promise<BpmResponse> {
    try {

      const phoneNumber = await this.clientPhoneNumberRepository.findOneOrFail({ where: { id: phoneNumberId, client: { id: clientId } } });
      phoneNumber.number = updateDriverPhoneDto.number.toString().replaceAll('+', '').trim();
      phoneNumber.code = updateDriverPhoneDto.code;
      await this.clientPhoneNumberRepository.save(phoneNumber);
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

  async updateClientBirthday(dto: UpdateClientBirthDayDto, clientId: number, user: any): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({ where: {id: clientId} });
      client.birthdayDate = dto.birthdayDate;

      await this.clientRepository.save(client);

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

  async addPhoneNumber(createDriverPhoneDto: any, clientId: number, user: any): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({where: { id: clientId }});

      const newPhoneNumber = new ClientPhoneNumber();
      newPhoneNumber.number = createDriverPhoneDto.number;
      newPhoneNumber.code = createDriverPhoneDto.code;
      newPhoneNumber.client = client;
      newPhoneNumber.createdBy = user.id;

      const result = await this.clientPhoneNumberRepository.save(newPhoneNumber)
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

  async getClientById(id: number): Promise<BpmResponse> {
    try {
      // const client = await this.clientRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['phoneNumbers', 'user'] });
      const client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoin('client.phoneNumbers', 'phoneNumber')
        .addSelect(['phoneNumber.id', 'phoneNumber.number', 'phoneNumber.code', 'phoneNumber.isMain'])
        .leftJoinAndSelect('client.profileFile', 'profileFile')
        .leftJoin('client.user', 'user')
        .addSelect('user.id')
        .addSelect('user.userType')
        .addSelect('user.lastLogin')
        .where(`client.is_deleted = false AND client.id = ${id}`)
        .getOneOrFail();


        // const ordersInfo = await this.ordersRepository
        // .createQueryBuilder('o')
        // .select([
        //   'COUNT(o.id) AS "totalOrders"',
        //   `COUNT(CASE WHEN cargoStatus.code = ${CargoStatusCodes.Completed} THEN 1 ELSE 0 END) AS "completedOrders"`,
        //   `COUNT(CASE WHEN cargoStatus.code = ${CargoStatusCodes.Canceled} THEN 1 ELSE 0 END) AS "cancelledOrders"`
        // ])
        // .leftJoin('o.client', 'client')
        // .leftJoin('o.cargoStatus', 'cargoStatus')
        // .where('o.deleted = false')
        // .andWhere('client.id = :id', { id })
        // .getRawOne();
      
        // console.log(ordersInfo)
        // client['ordersInfo'] = ordersInfo;
      return new BpmResponse(true, client, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getAllClients(query: GetClientsDto): Promise<BpmResponse> {
    try {
      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 0;
      const sort: any = {};
      if (query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }

      const filter: any = {
        state: query.state || UserStates.Active,
        clientId: query.clientId,
        firstName: query.firstName,
        phoneNumber: query.phoneNumber,
        phoneCode: query.phoneCode,
        createdAtFrom: query.createdAtFrom,
        createdAtTo: query.createdAtTo,
        lastLoginFrom: query.lastLoginFrom,
        lastLoginTo: query.lastLoginTo
      };

      const clients = await this.clientRepository.findAllClients(filter, sort, index, size)
      if (!clients.data.length) {
        throw new NoContentException();
      }
      const totalPagesCount = Math.ceil(clients.count / size);
      return new BpmResponse(true, { content: clients.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async deleteClient(id: number, user: any): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({ where: { id }, relations: ['phoneNumbers'] });

      if (client.isDeleted) {
        // Client is already deleted
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      client.isDeleted = true;
      client.deletedAt = new Date();
      client.deletedBy = user;

    await Promise.all(client.phoneNumbers.map(async (phoneNumber) => {
      phoneNumber.isDeleted = true;
      phoneNumber.deletedAt = new Date();
      await this.clientPhoneNumberRepository.save(phoneNumber);  
    }))

      await this.clientRepository.save(client);

      return new BpmResponse(true, null, null);
    } catch (err: any) {
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

  async restoreClient(id: number): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({ where: { id } });

      client.isDeleted = false;
      client.deletedAt = null;
      client.deletedBy = null;  

      await this.clientRepository.save(client);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
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

  async blockClient(id: number, blockReason: string, user: User): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({ where: { id } });

      client.blockReason = blockReason;
      client.isBlocked = true;
      client.blockedAt = new Date();
      client.blockedBy = user;

      await this.clientRepository.save(client);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
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

  async activateClient(id: number, user: User): Promise<BpmResponse> {
    try {
      const client = await this.clientRepository.findOneOrFail({ where: { id } });

      if (!client.isBlocked) {
        // Client is already unblocked
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      client.isBlocked = false;
      client.blockReason = null;
      client.blockedAt = null;
      client.blockedBy = null;

      await this.clientRepository.save(client);

      return new BpmResponse(true, null, null);
    } catch (err: any) {
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

}