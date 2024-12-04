import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityNotFoundError, In, Repository } from 'typeorm';
import {
  UserTypes, DriversServices, DriversServicesRequests, NoContentException,
  ServicesRequestsStatusesCodes, DriversServicesRequestsStatuses, Driver, DriversServicesRequestsDto, DriversServicesRequestsQueryDto, BpmResponse, InternalErrorException, ResponseStauses, User
} from '../..';
import * as dateFns from 'date-fns';
import { SseGateway } from '../../sse/sse.service';
import { DriversServicesRequestsRepository } from '../repositories/services-requests.repository';

@Injectable()
export class ServicesRequestsService {
  constructor(
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(DriversServices) private readonly driversServicesRepository: Repository<DriversServices>,
    @InjectRepository(DriversServicesRequestsStatuses) private readonly servicesRequestsStatusesRepository: Repository<DriversServicesRequestsStatuses>,
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

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err.name, err.message)
      if (err instanceof HttpException) {
        throw err
      } else if (err instanceof EntityNotFoundError) {
        if (err.message.includes("Driver")) {
          throw new BadRequestException(ResponseStauses.DriverNotFound);
        } else if (err.message.includes("DriversServicesRequestsStatuses")) {
          throw new BadRequestException(ResponseStauses.ServiceNotFound);
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
}
