import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BpmResponse, CargoType, CargoTypeGroup, ResponseStauses } from '../../index';
import { InternalErrorException, NoContentException, BadRequestException, CargoTypeDto  } from '../../index';

@Injectable()
export class CargoTypesService {
    constructor(
        @InjectRepository(CargoType) private readonly cargoTypesRepository: Repository<CargoType>,
        @InjectRepository(CargoTypeGroup) private readonly cargoTypeGroupsRepository: Repository<CargoTypeGroup>,
    ) { }

    async createCargoType(createCargoTypeDto: CargoTypeDto): Promise<BpmResponse> {

        try {
            const group = await this.cargoTypeGroupsRepository.findOneOrFail({ where: { id: createCargoTypeDto.cargoTypeGroupId } });
            const cargoType: CargoType = new CargoType();
            cargoType.name = createCargoTypeDto.name;
            cargoType.codeTNVED = createCargoTypeDto.codeTNVED;
            cargoType.group = group;
            
            const saveResult = await this.cargoTypesRepository.save(cargoType);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            if (err.name == 'EntityNotFoundError') {
                // Group not found
                throw new NoContentException();
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

    async updateCargoType(updateCargoTypeDto: CargoTypeDto): Promise<BpmResponse> {

        try {
            const group = await this.cargoTypeGroupsRepository.findOneOrFail({ where: { id: updateCargoTypeDto.cargoTypeGroupId } });
            const cargoType: CargoType = await this.cargoTypesRepository.findOneOrFail({ where: { id: updateCargoTypeDto.id } })
            cargoType.name = updateCargoTypeDto.name;
            cargoType.codeTNVED = updateCargoTypeDto.codeTNVED;
            cargoType.group = group;

            await this.cargoTypesRepository.update({ id: cargoType.id }, cargoType);

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

    async getCargoTypeById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const cargoType = await this.cargoTypesRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, cargoType, null);
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

    async getAllCargoTypes(): Promise<BpmResponse> {
        try {
            const cargoTypes = await this.cargoTypesRepository.find({ where: { deleted: false }, relations: ['group'] });
            if (!cargoTypes.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, cargoTypes, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCargoType(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const cargoType = await this.cargoTypesRepository.findOneOrFail({ where: { id, deleted: false } });
            await this.cargoTypesRepository.softDelete(id);
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