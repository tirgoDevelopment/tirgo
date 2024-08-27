import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalErrorException, NoContentException, BadRequestException, BpmResponse, CargoTypeGroup, ResponseStauses, CargoTypeGroupDto } from '../../index';

@Injectable()
export class CargoTypeGroupsService {
    constructor(
        @InjectRepository(CargoTypeGroup) private readonly cargoTypeGroupsRepository: Repository<CargoTypeGroup>,
    ) { }

    async createCargoTypeGroup(createCargoTypeGroupDto: CargoTypeGroupDto): Promise<BpmResponse> {

        try {
            const cargoTypeGroup: CargoTypeGroup = new CargoTypeGroup();
            cargoTypeGroup.name = createCargoTypeGroupDto.name;
            cargoTypeGroup.codeTNVED = createCargoTypeGroupDto.codeTNVED;

            const saveResult = await this.cargoTypeGroupsRepository.save(cargoTypeGroup);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            throw new InternalErrorException(ResponseStauses.CreateDataFailed, err.message);
        }
    }

    async updateCargoTypeGroup(updateCargoTypeGroupDto: CargoTypeGroupDto): Promise<BpmResponse> {

        try {
            const cargoTypeGroup: CargoTypeGroup = await this.cargoTypeGroupsRepository.findOneOrFail({ where: { id: updateCargoTypeGroupDto.id }, order: { id: 'DESC' } });
            cargoTypeGroup.name = updateCargoTypeGroupDto.name;
            cargoTypeGroup.codeTNVED = updateCargoTypeGroupDto.codeTNVED;

            await this.cargoTypeGroupsRepository.update({ id: cargoTypeGroup.id }, cargoTypeGroup);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
        } catch (err: any) {
            throw new InternalErrorException(ResponseStauses.UpdateDataFailed, err.message);
        }
    }

    async getCargoTypeGroupById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const cargoTypeGroup = await this.cargoTypeGroupsRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, cargoTypeGroup, null);
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

    async getAllCargoTypeGroups(): Promise<BpmResponse> {
        try {
            const cargoTypeGroups = await this.cargoTypeGroupsRepository.find({ where: { deleted: false }, relations: ['cargoTypes'] });
            if (!cargoTypeGroups.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, cargoTypeGroups, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCargoTypeGroup(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const cargoTypeGroup = await this.cargoTypeGroupsRepository.findOneOrFail({ where: { id, deleted: false }, order: { id: 'DESC' } });
            cargoTypeGroup.deleted = true;

            await this.cargoTypeGroupsRepository.save(cargoTypeGroup);
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