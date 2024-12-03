import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalErrorException, NoContentException, BadRequestException, DriversServicesRequestsStatuses, DriversServicesRequestsStatusesDto, BpmResponse, ResponseStauses } from '../../index';

@Injectable()
export class ServicesRequestsStatusesService {
    constructor(
        @InjectRepository(DriversServicesRequestsStatuses) private readonly driversServicesRequestsStatuses: Repository<DriversServicesRequestsStatuses>,
    ) { }

    async createStatus(createStatusDto: DriversServicesRequestsStatusesDto): Promise<BpmResponse> {

        try {
            const status: DriversServicesRequestsStatuses = new DriversServicesRequestsStatuses();
            status.name = createStatusDto.name;
            status.code = createStatusDto.code;
            status.color = createStatusDto.color;

            const saveResult = await this.driversServicesRequestsStatuses.save(status);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
        }
    }

    async updateStatus(updateStatusDto: DriversServicesRequestsStatusesDto): Promise<BpmResponse> {
        try {
            const status: DriversServicesRequestsStatuses = await this.driversServicesRequestsStatuses.findOneOrFail({ where: { id: updateStatusDto.id } })
            status.name = updateStatusDto.name;
            status.code = updateStatusDto.code;
            status.color = updateStatusDto.color;
            // console.log(status)
            const res = await this.driversServicesRequestsStatuses.save(status);
            // console.log(res)

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                // Group not found
                throw new NoContentException();
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

    async getStatusById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const status = await this.driversServicesRequestsStatuses.findOneOrFail({ where: { id, isDeleted: false } });
            return new BpmResponse(true, status, null);
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

    async getAllStatuses(): Promise<BpmResponse> {
        try {
            const statuss = await this.driversServicesRequestsStatuses.find({ where: { isDeleted: false }, order: { createdAt: 'DESC' } });
            if (!statuss.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, statuss, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteStatus(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const status = await this.driversServicesRequestsStatuses.findOneOrFail({ where: { id, isDeleted: false } });
            status.isDeleted = true;
            await this.driversServicesRequestsStatuses.save(status);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
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

}