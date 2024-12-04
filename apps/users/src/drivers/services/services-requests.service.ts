import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import {
  UserTypes, DriversServices, DriversServicesRequests, NoContentException,
  DriversServicesRequestsMessagesDto,
  DriversServicesRequestsMessages,
  DriversServicesRequestsMessagesQueryDto,
  SseEventNames,
  DriversServicesRequestsOperationDto,
  ServicesRequestsStatusesCodes, DriversServicesRequestsStatuses, Driver,
  DriversServicesRequestsDto, 
  DriversServicesRequestsQueryDto, BpmResponse, InternalErrorException, ResponseStauses, User,
  DriversServicesRequestsStatusesChangesHistory
} from '../..';
import { SseGateway } from '../../sse/sse.service';
import { DriversServicesRequestsRepository } from '../repositories/services-requests.repository';
import { DriversServicesRequestsMessagesRepository } from '../repositories/services-requests-messages.repository';

@Injectable()
export class ServicesRequestsService {
  constructor(
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(DriversServices) private readonly driversServicesRepository: Repository<DriversServices>,
    @InjectRepository(DriversServicesRequestsStatuses) private readonly servicesRequestsStatusesRepository: Repository<DriversServicesRequestsStatuses>,
    @InjectRepository(DriversServicesRequestsStatusesChangesHistory) private readonly statusesHistoryRepository: Repository<DriversServicesRequestsStatusesChangesHistory>,
    private driversServicesRequestsMessagesRepository: DriversServicesRequestsMessagesRepository,
    private sseService: SseGateway,
    private driversServicesRequestsRepository: DriversServicesRequestsRepository
  ) { }

  async create(dto: DriversServicesRequestsDto, user: User): Promise<BpmResponse> {
    try {

      let driver;
      if (user.userType == UserTypes.Driver) {
        driver = await this.driversRepository.findOneOrFail({ where: { id: user.driver?.id, isDeleted: false } });
      } else if (user.userType == UserTypes.Staff) {
        if (dto.driverId) {
          driver = await this.driversRepository.findOneOrFail({ where: { id: dto.driverId, isDeleted: false } });
        } else {
          throw new BadRequestException(ResponseStauses.DriverIdIsRequired);
        }
      }

      if (driver.isBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked);
      }

      const services = await this.driversServicesRepository.find({ where: { id: In(dto.servicesIds) } });
      if (!services.length) {
        throw new BadRequestException(ResponseStauses.ServiceNotFound);
      }

      const driverServiceRequest = new DriversServicesRequests();
      driverServiceRequest.driver = driver;
      driverServiceRequest.services = services;
      driverServiceRequest.status = await this.servicesRequestsStatusesRepository.findOneOrFail({ where: { code: ServicesRequestsStatusesCodes.Waiting } });
      driverServiceRequest.createdBy = user;

      await this.driversServicesRequestsRepository.save(driverServiceRequest);
      await this.sseService.sendNotificationToAllUsers({ data: '', event: SseEventNames.NewServiceRequest });
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else if (err instanceof EntityNotFoundError) {
        if (err.message.includes("Driver")) {
          throw new BadRequestException(ResponseStauses.DriverNotFound);
        } else if (err.message.includes("DriversServicesRequestsStatuses")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestStatusNotFound);
        } else {
          throw new BadRequestException(ResponseStauses.NotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);

      }
    }
  }

  async cancelServiceRequest(dto: DriversServicesRequestsOperationDto, id: number, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Driver && user.userType != UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      const request = await this.driversServicesRequestsRepository.findOneOrFail({ where: { id: +id }, relations: ['status'] })

      if (request.status?.code == ServicesRequestsStatusesCodes.Working || request.status?.code == ServicesRequestsStatusesCodes.Completed) {
        throw new BadRequestException(ResponseStauses.RequestCantBeCanceleted);
      }

      const status = await this.servicesRequestsStatusesRepository.findOneOrFail({ where: { code: ServicesRequestsStatusesCodes.Canceled } });
      request.status = status; 
      request.isCanceled = true;
      request.canceledAt = new Date();
      request.canceledBy = user;
      request.cancelReason = dto.cancelReason || '';

      await this.driversServicesRequestsRepository.save(request);

      await this.statusesHistoryRepository.save({ driverServiceRequest: request, status, createdBy: user });

      await this.sseService.sendNotificationToAllUsers({ data: { requestId: request.id }, event: SseEventNames.ServiceRequestCanceled });

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCanceled]);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else if (err instanceof EntityNotFoundError) {
        if (err.message.includes(`"DriversServicesRequests"`)) {
          throw new BadRequestException(ResponseStauses.ServiceRequestNotFound);
        } else if (err.message.includes("DriversServicesRequestsStatuses")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestStatusNotFound);
        } else {
          throw new BadRequestException(ResponseStauses.NotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);

      }
    }
  }

  async deleteServiceRequest(dto: DriversServicesRequestsOperationDto, id: number, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Driver && user.userType != UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const request = await this.driversServicesRequestsRepository.findOneOrFail({ where: { id }, relations: ['status'] })

      if (request.status?.code != ServicesRequestsStatusesCodes.Waiting) {
        throw new BadRequestException(ResponseStauses.RequestStatusIsNotWaiting);
      }

      const status = await this.servicesRequestsStatusesRepository.findOneOrFail({ where: { code: ServicesRequestsStatusesCodes.Deleted } });
      request.status = status;
      request.isDeleted = true;
      request.deletedBy = user;
      request.deletedAt = new Date();
      request.deleteReason = dto.deleteReason || '';

      await this.driversServicesRequestsRepository.save(request);

      await this.statusesHistoryRepository.save({ driverServiceRequest: request, status, createdBy: user });

      await this.sseService.sendNotificationToAllUsers({ data: { requestId: request.id }, event: SseEventNames.ServiceRequestDeleted });

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else if (err instanceof EntityNotFoundError) {
        if (err.message.includes("DriversServicesRequests")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestNotFound);
        } else if (err.message.includes("DriversServicesRequestsStatuses")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestStatusNotFound);
        } else {
          throw new BadRequestException(ResponseStauses.NotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);

      }
    }
  }
  async getAll(query: DriversServicesRequestsQueryDto, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Staff) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 1;

      const sort: any = {};
      if (query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }

      const data = await this.driversServicesRequestsRepository.findAll(query, sort, index, size)
      if (!data.data.length) {
        throw new NoContentException();
      }
      const totalPagesCount = Math.ceil(data.count / size);
      return new BpmResponse(true, { content: data.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);

      }
    }
  }

  async getAllByDriverId(query: DriversServicesRequestsQueryDto, driverId: number, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Staff && user.userType != UserTypes.Driver) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 1;

      const sort: any = {};
      if (query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }

      query.driverId = driverId;

      const data = await this.driversServicesRequestsRepository.findAll(query, sort, index, size)

      if (!data.data.length) {
        throw new NoContentException();
      }
      const totalPagesCount = Math.ceil(data.count / size);
      return new BpmResponse(true, { content: data.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);

      }
    }
  }

  async sendMessage(dto: DriversServicesRequestsMessagesDto, driverServiceRequestId: number, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Staff && user.userType != UserTypes.Driver) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const serviceRequestMessage: DriversServicesRequestsMessages = new DriversServicesRequestsMessages();
      serviceRequestMessage.message = dto.message;
      serviceRequestMessage.messageType = dto.messageType;
      serviceRequestMessage.senderUserType = user.userType;
      serviceRequestMessage.sentBy = user;
      serviceRequestMessage.createdBy = user;
      serviceRequestMessage.driverServiceRequest = await this.driversServicesRequestsRepository.findOneOrFail({ where: { id: +driverServiceRequestId } });

      if (dto.isReplied) {
        if (!dto.repliedToId) {
          throw new BadRequestException(ResponseStauses.RepliedToIdIsRequired);
        }
        serviceRequestMessage.isReplied = dto.isReplied;
        serviceRequestMessage.repliedToId = dto.repliedToId;
      }
      await this.driversServicesRequestsMessagesRepository.save(serviceRequestMessage);
      await this.sseService.sendNotificationToAllUsers({ data: dto.message, event: SseEventNames.NewMessage });
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else if (err instanceof EntityNotFoundError) {
        if (err.message.includes("DriversServicesRequestsRepository")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestNotFound);
        } else if (err.message.includes("DriversServicesRequestsStatuses")) {
          throw new BadRequestException(ResponseStauses.ServiceRequestStatusNotFound);
        } else {
          throw new BadRequestException(ResponseStauses.NotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }
  async getAllMessages(query: DriversServicesRequestsMessagesQueryDto, driverServiceRequestId: number, user: User): Promise<BpmResponse> {
    try {

      if (user.userType != UserTypes.Staff && user.userType != UserTypes.Driver) {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      if (user.userType == UserTypes.Driver) {
        const exists = await this.driversServicesRequestsRepository.exists({ where: { id: driverServiceRequestId, driver: { id: user.driver?.id } } });
        if (!exists) {
          throw new BadRequestException(ResponseStauses.AccessDenied);
        }
      }

      // set request id to get messags only related to servicesRequest 
      query['driverServiceRequestId'] = driverServiceRequestId;

      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 1;

      const sort: any = {};
      if (query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }


      const data = await this.driversServicesRequestsMessagesRepository.findAll(query, sort, index, size)
      if (!data.data.length) {
        throw new NoContentException();
      }

      const totalPagesCount = Math.ceil(data.count / size);
      return new BpmResponse(true, { content: data.data, totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }
}
