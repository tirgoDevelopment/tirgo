import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { BpmResponse, DriversServices, DriversServicesDto, InternalErrorException, NoContentException, ResponseStauses } from '../..';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class DriverServicesService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(DriversServices) private readonly driverServicesRepository: Repository<DriversServices>) { }

    async createDriverService(dto: DriversServicesDto): Promise<BpmResponse> {

        try {
            const driverService: DriversServices = new DriversServices();
            driverService.name = dto.name;
            driverService.description = dto.description;
            driverService.type = dto.type;
            driverService.tirAmount = dto.tirAmount;
            driverService.uzsAmount = dto.uzsAmount;
            driverService.kztAmount = dto.kztAmount;
            driverService.code = dto.code;
            driverService.withoutSubscription = dto.withoutSubscription;
            driverService.isLegalEntity = dto.isLegalEntity;

            await this.driverServicesRepository.save(driverService);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            throw new InternalErrorException(ResponseStauses.CreateDataFailed);
        }
    }

    async updateDriverService(dto: DriversServicesDto): Promise<BpmResponse> {

        try {
            const driverService: DriversServices = await this.driverServicesRepository.findOneOrFail({ where: { id: dto.id } });
            driverService.name = dto.name;
            driverService.description = dto.description;
            driverService.type = dto.type;
            driverService.tirAmount = dto.tirAmount;
            driverService.uzsAmount = dto.uzsAmount;
            driverService.kztAmount = dto.kztAmount;
            driverService.code = dto.code;
            driverService.withoutSubscription = dto.withoutSubscription;
            driverService.isLegalEntity = dto.isLegalEntity;


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
            const driverService = await this.driverServicesRepository.findOneOrFail({ where: { id, isDeleted: false } });
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

    async getAllDriverServices(isSubscription: boolean, isLegalEntity: boolean): Promise<BpmResponse> {
        try {
            let filter = { isDeleted: false };
            if (isSubscription == true || isSubscription == false) {
                filter['withoutSubscription'] = isSubscription;
            }
            if (isLegalEntity == true || isLegalEntity == false) {
                filter['isLegalEntity'] = isLegalEntity;
            }
            const driverSevices = await this.driverServicesRepository.find({ where: filter, order: { createdAt: 'DESC' } });
            if (!driverSevices.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, driverSevices, null);
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

    async deleteDriverService(id: number): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const driverService = await this.driverServicesRepository.findOneOrFail({ where: { id } });
            driverService.isDeleted = true;
            const updateResult = await this.driverServicesRepository.save(driverService);
            return new BpmResponse(true, null, null);
        } catch (err: any) {
            if (err instanceof EntityNotFoundError) {
                // Subscription not found
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

}