import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AwsService, BadRequestException, BpmResponse, Client, ClientDto, ClientPhoneNumber, InternalErrorException, NoContentException, NotFoundException, ResponseStauses, SundryService, User, UserTypes } from '..';
import * as dateFns from 'date-fns'

@Injectable()
export class ClientsService {

  constructor(
    @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private awsService: AwsService,
    private sundriesService: SundryService
  ) { }

  async createClient(passportFile: any, createClientDto: ClientDto, user: User): Promise<BpmResponse> {
    const queryRunner = this.clientsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      if(!(/[a-zA-Z]/.test(createClientDto.password) && /\d/.test(createClientDto.password))) {
        throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
      }

      const passwordHash = await this.sundriesService.generateHashPassword(createClientDto.password);
      const client: Client = new Client();
      client.user = await this.usersRepository.save({ userType: UserTypes.Client, password: passwordHash });
      client.firstName = createClientDto.firstName; 0
      client.lastName = createClientDto.lastName;
      client.email = createClientDto.email;
      client.citizenship = createClientDto.citizenship;
      client.additionalPhoneNumber = createClientDto.additionalPhoneNumber;
     

      if(user && user.userType == UserTypes.Staff) {
        client.createdBy = user;
      }

      if(typeof createClientDto.phoneNumbers == 'string') {
        createClientDto.phoneNumbers = JSON.parse(createClientDto.phoneNumbers)
      }
      if(!(createClientDto.phoneNumbers instanceof Array)) {
        throw new BadRequestException(ResponseStauses.PhoneNumbeersMustBeArray)
      }
      const clientPhoneNumbers = createClientDto.phoneNumbers.map(phoneNumber => {
        const clientPhoneNumber = new ClientPhoneNumber();
        clientPhoneNumber.phoneNumber = phoneNumber.toString().replace('+', '');
        clientPhoneNumber.client = client; 
        return clientPhoneNumber;
      });

        client.phoneNumbers = clientPhoneNumbers;

        if(passportFile) {
        await this.awsService.uploadFile('client', passportFile);
        client.passportFilePath = passportFile.originalname.split(' ').join('').trim();
      }
      await this.clientsRepository.save(client);

      await queryRunner.commitTransaction();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      await queryRunner.rollbackTransaction();
      this.awsService.deleteFile('client', passportFile.originalname.split(' ').join('').trim())

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

  async updateClient(files: any, updateClientDto: ClientDto): Promise<BpmResponse> {
    try {
      const client = await this.clientsRepository.findOneOrFail({ where: { id: updateClientDto.id } });
      client.firstName = updateClientDto.firstName || client.firstName;
      client.lastName = updateClientDto.lastName || client.lastName;
      client.additionalPhoneNumber = updateClientDto.additionalPhoneNumber || client.additionalPhoneNumber;
      client.email = updateClientDto.email || client.email;
      client.citizenship = updateClientDto.citizenship || client.citizenship;

      if(files && files.passport) {
        client.passportFilePath = files.passport[0].originalname.split(' ').join('').trim();
        await this.awsService.uploadFile('client', files.passport[0]);
      }

      const res = await this.clientsRepository.update({ id: client.id }, client);
      if (res.affected) {
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
      } else {
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getClientById(id: number): Promise<BpmResponse> {
    if (!id) {
      return new BpmResponse(false, null, ['Id id required']);
    }
    try {
      // const client = await this.clientsRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['phoneNumbers', 'user'] });
      const client = await this.clientsRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.phoneNumbers', 'phoneNumber')
      .leftJoin('client.user', 'user')
      .addSelect('user.id')
      .addSelect('user.userType')
      .addSelect('user.lastLogin')
      .where(`client.deleted = false AND client.id = ${id}`)
      .getOneOrFail();
      if (!client) {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      }
      return new BpmResponse(true, client, null);
    } catch (err: any) {
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }
  
  async getAllClients(pageSize: string, pageIndex: string, sortBy: string, sortType: string, clientId: number, firstName: string, phoneNumber: string, createdFrom: string, createdAtTo: string, lastLoginFrom: string, lastLoginTo: string): Promise<BpmResponse> {
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

    if(clientId) {
      filter.id = Number(clientId)
    } 
    if(firstName) {
      filter.firstName = firstName;
    }
    if(phoneNumber) {
      filter.phoneNumbers = { phoneNumber: '+' + phoneNumber }
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
      const clients = await this.clientsRepository.find({ 
        where: filter, 
        relations: ['phoneNumbers', 'user'], 
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
      });
      if (!clients.length) {
        throw new NoContentException();
      }
      const clientsCount = await this.clientsRepository.count({ where: filter })
      const totalPagesCount = Math.ceil(clientsCount / size);
      return new BpmResponse(true, { content: clients, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getAllActiveClients(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }

      const clients = await this.clientsRepository.find({ 
        where: { blocked: false, deleted: false }, 
        relations: ['phoneNumbers', 'user'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
      });
      if (!clients.length) {
        throw new NoContentException();
      }
      const clientsCount = await this.clientsRepository.count({ where: { blocked: false, deleted: false } })
      const totalPagesCount = Math.ceil(clientsCount / size);
      return new BpmResponse(true, { content: clients, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getAllNonActiveClients(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }

      const clients = await this.clientsRepository.find({ 
        where: { blocked: true, deleted: false }, 
        relations: ['phoneNumbers', 'user'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
      });
      if (!clients.length) {
        throw new NoContentException();
      }
      const clientsCount = await this.clientsRepository.count({ where: { blocked: true, deleted: false } })
      const totalPagesCount = Math.ceil(clientsCount / size);
      return new BpmResponse(true, { content: clients, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getAllDeletedClients(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }

      const clients = await this.clientsRepository.find({ 
        where: { deleted: true }, 
        relations: ['phoneNumbers', 'user'],
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
      });
      if (!clients.length) {
        throw new NoContentException();
      }
      const clientsCount = await this.clientsRepository.count({ where: { deleted: false } })
      const totalPagesCount = Math.ceil(clientsCount / size);
      return new BpmResponse(true, { content: clients, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      if(err instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async deleteClient(id: number): Promise<BpmResponse> {
    try {
        if (!id) {
            return new BpmResponse(false, null, ['Id is required']);
        }
        const client = await this.clientsRepository.findOneOrFail({ where: { id }, relations: ['phoneNumbers'] });

        if (client.deleted) {
            // Client is already deleted
            throw new BadRequestException(ResponseStauses.AlreadyDeleted);
        }

        client.deleted = true;

        // Update phoneNumbers by adding underscores
        if (client.phoneNumbers) {
            client.phoneNumbers.forEach(phone => {
                phone.phoneNumber = '_' + phone.phoneNumber;
            });
        }

        await this.clientsRepository.save(client);

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
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const client = await this.clientsRepository.findOneOrFail({ where: { id } });

      const updateResult = await this.clientsRepository.update({ id: client.id }, { deleted: false });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Client not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async blockClient(id: number, blockReason: string, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const client = await this.clientsRepository.findOneOrFail({ where: { id } });

      if (client.blocked) {
        // Client is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      client.blockReason = blockReason;
      client.blocked = true;
      client.blockedAt = new Date();
      client.blockedBy = user;

      await this.clientsRepository.save(client);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Client not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async activateClient(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const client = await this.clientsRepository.findOneOrFail({ where: { id } });

      if (!client.blocked) {
        // Client is already unblocked
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      client.blocked = false;
      client.blockReason = null;
      client.blockedAt = null;
      client.blockedBy = null;

      await this.clientsRepository.save(client);

        return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // Client not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

}