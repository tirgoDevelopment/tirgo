import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { BpmResponse, DriverService, DriverServiceDto, InternalErrorException, NoContentException, ResponseStauses } from '../..';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class DriverServicesService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(DriverService) private readonly driverServicesRepository: Repository<DriverService>) {}

    async createDriverService(createDriverServiceDto: DriverServiceDto): Promise<BpmResponse> {

        try {
            const driverService: DriverService = new DriverService();
            driverService.name = createDriverServiceDto.name;
            driverService.amount = createDriverServiceDto.amount;
            driverService.code = createDriverServiceDto.code;

            await this.driverServicesRepository.save(driverService);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            throw new InternalErrorException(ResponseStauses.CreateDataFailed);
        }
    }

    async updateDriverService(updateDriverServiceDto: DriverServiceDto): Promise<BpmResponse> {

        try {
            const driverService: DriverService = await this.driverServicesRepository.findOneOrFail({ where: { id: updateDriverServiceDto.id } });
            driverService.name = updateDriverServiceDto.name;
            driverService.amount = updateDriverServiceDto.amount;
            driverService.code = updateDriverServiceDto.code;

            await this.driverServicesRepository.save(driverService);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            if (err.name == 'EntityNotFoundError') {
                // Client not found
                throw new NoContentException();
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }


    async getDriverServiceById(id: number): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const driverService = await this.driverServicesRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, driverService, null);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                // Client not found
                throw new NoContentException();
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

    async getAllDriverServices(): Promise<BpmResponse> {
        try {
            const driverSevices = await this.driverServicesRepository.find({ where: { deleted: false } });
            if (!driverSevices.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, driverSevices, null);
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

    async deleteDriverService(id: number): Promise<BpmResponse> {
        try {
          if(!id) {
            throw new BadRequestException(ResponseStauses.IdIsRequired);
          }
          const driverService = await this.driverServicesRepository.findOneOrFail({ where: { id } });
    
          const updateResult = await this.driverServicesRepository.delete({ id: driverService.id });

          if (updateResult.affected > 0) {
            // Update was successful
            return new BpmResponse(true, null, null);
          } else {
            // Update did not affect any rows
            throw new InternalErrorException(ResponseStauses.NotModified);
          }
        } catch (err: any) {
          if (err instanceof EntityNotFoundError) {
            // Subscription not found
            throw new NoContentException();
          } else if(err instanceof HttpException) {
            throw err
          } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
          }
        }
      }

}