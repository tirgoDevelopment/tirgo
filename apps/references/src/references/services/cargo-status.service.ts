import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalErrorException, NoContentException, BadRequestException, CargoStatus, CargoStatusDto, BpmResponse, ResponseStauses } from '../../index';

@Injectable()
export class CargoStatusesService {
    constructor(
        @InjectRepository(CargoStatus) private readonly cargoStatusesRepository: Repository<CargoStatus>,
    ) { }

    async createCargoStatus(createCargoStatusDto: CargoStatusDto): Promise<BpmResponse> {

        try {
            const cargoStatus: CargoStatus = new CargoStatus();
            cargoStatus.name = createCargoStatusDto.name;
            cargoStatus.code = createCargoStatusDto.code;
            cargoStatus.color = createCargoStatusDto.color;
            
            const saveResult = await this.cargoStatusesRepository.save(cargoStatus);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
        }
    }

    async updateCargoStatus(updateCargoStatusDto: CargoStatusDto): Promise<BpmResponse> {
        try {
            const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id: updateCargoStatusDto.id } })
            cargoStatus.name = updateCargoStatusDto.name;
            cargoStatus.code = updateCargoStatusDto.code;
            cargoStatus.color = updateCargoStatusDto.color;
            // console.log(cargoStatus)
            const res = await this.cargoStatusesRepository.save(cargoStatus);
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

    async getCargoStatusById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, cargoStatus, null);
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

    async getAllCargoStatuses(): Promise<BpmResponse> {
        try {
            const cargoStatuss = await this.cargoStatusesRepository.find({ where: { deleted: false }, order: { id: 'DESC' } });
            if (!cargoStatuss.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, cargoStatuss, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCargoStatus(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id, deleted: false } });
            await this.cargoStatusesRepository.softDelete(id);
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