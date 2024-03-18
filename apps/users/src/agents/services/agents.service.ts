import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { BpmResponse, InternalErrorException, NotFoundException, ResponseStauses, Role, SundryService, User, UserTypes, Agent, AgentDto, BadRequestException, AgentBankAccount, AwsService, NoContentException } from '../..';
import * as dateFns from 'date-fns'

@Injectable()
export class AgentsService {

  constructor(
    @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(AgentBankAccount) private readonly bankAccountRepository: Repository<AgentBankAccount>,
    private sundriesService: SundryService,
    private awsService: AwsService
  ) { }

  async createAgent(files: any, createAgentDto: any, user: User): Promise<BpmResponse> {
    try {
      const passwordHash = await this.sundriesService.generateHashPassword(createAgentDto.password);
      const user: User = await this.usersRepository.save({ userType: UserTypes.Agent, password: passwordHash });
      const agent: Agent = new Agent();
      agent.user = user;
      agent.companyName = createAgentDto.companyName;
      agent.username = createAgentDto.username;
      agent.managerLastName = createAgentDto.managerLastName;
      agent.managerFirstName = createAgentDto.managerFirstName;
      agent.legalAddress = createAgentDto.legalAddress;
      agent.physicalAddress = createAgentDto.physicalAddress;
      agent.bankBranchName = createAgentDto.bankBranchName;
      agent.mfo = createAgentDto.mfo;
      agent.oked = createAgentDto.oked;
      agent.inn = createAgentDto.inn;
      agent.phoneNumber = createAgentDto.phoneNumber;
      agent.createdBy = user;
      if (files) {
        const fileUploads = []
        if (files.registrationCertificateFilePath && files.registrationCertificateFilePath[0]) {
          agent.registrationCertificateFilePath = files.registrationCertificateFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.registrationCertificateFilePath[0])
        }
        if (files.managerPassportFilePath && files.managerPassportFilePath[0]) {
          agent.managerPassportFilePath = files.managerPassportFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.managerPassportFilePath[0])
        }
        // Upload files to AWS
        await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.Agent, file)));
      } else {
        throw new BadRequestException(ResponseStauses.FileIsRequired);
      }

      const newAgent = await this.agentsRepository.save(agent);

      if (!createAgentDto.bankAccounts || !createAgentDto.bankAccounts.length) {
        throw new BadRequestException(ResponseStauses.BankAccountIsRequired);
      }
      createAgentDto.bankAccounts = JSON.parse(createAgentDto.bankAccounts);
      for (let account of createAgentDto.bankAccounts) {
        if (!account.currencyId || !account.account) {
          throw new BadRequestException(ResponseStauses.InvalidBankAccount)
        }
      }

      const currencies = await this.agentsRepository.find({ where: { blocked: false } });
      const bankAccounts: any[] = createAgentDto.bankAccounts.map((el: any) => {
        return {
          agent: newAgent,
          currency: currencies.find((cur: any) => cur.id == el.currencyId),
          account: el.account
        }
      });
      await this.bankAccountRepository.createQueryBuilder()
        .insert()
        .into(AgentBankAccount)
        .values(bankAccounts)
        .execute();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async updateAgent(files: any, createAgentDto: any): Promise<BpmResponse> {
    try {
      const passwordHash = await this.sundriesService.generateHashPassword(createAgentDto.password);
      const user: User = await this.usersRepository.save({ userType: UserTypes.Agent, password: passwordHash });
      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { id: createAgentDto.id } });
      agent.user = user;
      agent.companyName = createAgentDto.companyName;
      agent.username = createAgentDto.username;
      agent.managerLastName = createAgentDto.managerLastName;
      agent.managerFirstName = createAgentDto.managerFirstName;
      agent.legalAddress = createAgentDto.legalAddress;
      agent.physicalAddress = createAgentDto.physicalAddress;
      agent.bankBranchName = createAgentDto.bankBranchName;
      agent.mfo = createAgentDto.mfo;
      agent.oked = createAgentDto.oked;
      agent.inn = createAgentDto.inn;
      agent.phoneNumber = createAgentDto.phoneNumber;

      if (files && files.length) {
        const fileUploads = []
        if (files.registrationCertificateFilePath && files.registrationCertificateFilePath[0]) {
          agent.registrationCertificateFilePath = files.registrationCertificateFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.registrationCertificateFilePath[0])
        }
        if (files.managerPassportFilePath && files.managerPassportFilePath[0]) {
          agent.managerPassportFilePath = files.managerPassportFilePath[0].originalname.split(' ').join('').trim();
          fileUploads.push(files.managerPassportFilePath[0])
        }
        // Upload files to AWS
        await Promise.all(fileUploads.map((file: any) => this.awsService.uploadFile(UserTypes.Agent, file)));
      }

      const newAgent = await this.agentsRepository.save(agent);
      createAgentDto.bankAccounts = JSON.parse(createAgentDto.bankAccounts);
      for (let account of createAgentDto.bankAccounts) {
        if (!account.currencyId || !account.account) {
          throw new BadRequestException(ResponseStauses.InvalidBankAccount)
        }
      }

      const currencies = await this.agentsRepository.find({ where: { blocked: false } })
      const bankAccounts: any[] = createAgentDto.bankAccounts.map((el: any) => {
        return {
          agent: newAgent,
          currency: currencies.find((cur: any) => cur.id == el.currencyId),
          account: el.account
        }
      });
      await this.bankAccountRepository.createQueryBuilder()
        .insert()
        .into(AgentBankAccount)
        .values(bankAccounts)
        .execute();

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getAgents(id: number, pageSize: string, pageIndex: string, sortBy: string, sortType: string, companyName: string, createdFrom: string, createdAtTo: string): Promise<BpmResponse> {
    try {
      const filter: any = { deleted: false };
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
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


      const agents: Agent[] = await this.agentsRepository.find({ 
        where: filter, 
        relations: ['bankAccounts', 'drivers', 'drivers.phoneNumbers', 'drivers.subscription', 'drivers.subscription.currency'], 
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
        order: sort
        })
      if(!agents.length) {
        throw new NoContentException();
      }
      const merchantsCount = await this.agentsRepository.count({ where: filter })
      const totalPagesCount = Math.ceil(merchantsCount / size);
      return new BpmResponse(true, { content: agents, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch(err: any) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getAgentById(id: number): Promise<BpmResponse> {
    try {
      const agent: Agent = await this.agentsRepository.findOneOrFail({ where: { deleted: false, id }, 
        relations: ['bankAccounts', 'drivers', 'drivers.phoneNumbers', 'drivers.subscription', 'drivers.subscription.currency'] })
      return new BpmResponse(true, agent, null);
    } catch(err: any) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getAgent(id: number): Promise<BpmResponse> {
    try {
      const agents: Agent = await this.agentsRepository.findOneOrFail({ where: { deleted: false, id }, 
        relations: ['bankAccounts', 'drivers', 'drivers.phoneNumbers', 'drivers.subscription', 'drivers.subscription.currency'] })
      return new BpmResponse(true, agents, null);
    } catch(err: any) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async blockAgent(id: number, user: User): Promise<BpmResponse> {
    try {

      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const agent = await this.agentsRepository.findOneOrFail({ where: { id } });

      if (agent.blocked) {
        // agent is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyBlocked);
      }

      agent.blocked = true;
      agent.blockedAt = new Date();
      agent.blockedBy = user;
      const updateResult = await this.agentsRepository.update({ id: agent.id }, { blocked: true });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // agent not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async activateAgent(id: number, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const agent = await this.agentsRepository.findOneOrFail({ where: { id } });

      if (!agent.blocked) {
        // agent is already active
        throw new BadRequestException(ResponseStauses.AlreadyActive);
      }

      agent.blocked = false;
      agent.blockedAt = null;
      agent.blockedBy = null; 

      await this.agentsRepository.save(agent);

        return new BpmResponse(true, null, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // agent not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async deleteAgent(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const agent = await this.agentsRepository.findOneOrFail({ where: { id } });

      if (agent.deleted) {
        // agent is already blocked
        throw new BadRequestException(ResponseStauses.AlreadyDeleted);
      }

      const updateResult = await this.agentsRepository.update({ id: agent.id }, { deleted: true, phoneNumber: '_'+agent.phoneNumber });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // agent not found
        throw new NoContentException();
      } else if(err instanceof HttpException) {
        throw err
      } else {
        // Other error (handle accordingly)
       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async restoreAgent(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        return new BpmResponse(false, null, ['Id is required']);
      }
      const agent = await this.agentsRepository.findOneOrFail({ where: { id } });

      if (!agent.deleted) {
        // agent is already blocked
        throw new BadRequestException('');
      }

      const updateResult = await this.agentsRepository.update({ id: agent.id }, { deleted: false });

      if (updateResult.affected > 0) {
        // Update was successful
        return new BpmResponse(true, null, null);
      } else {
        // Update did not affect any rows
        throw new InternalErrorException(ResponseStauses.NotModified);
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        // agent not found
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