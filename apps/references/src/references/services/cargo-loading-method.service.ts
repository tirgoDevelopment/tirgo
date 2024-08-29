import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalErrorException, NoContentException, BadRequestException, CargoLoadMethod, BpmResponse, ResponseStauses } from '../../index';

@Injectable()
export class CargoLoadingMethodsService {
    constructor(
        @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>,
    ) { }

    async createCargoLoadingMethod(createCargoLoadingMethodDto: any): Promise<BpmResponse> {

        try {
            const cargoLoadingMethod: CargoLoadMethod = new CargoLoadMethod();
            cargoLoadingMethod.name = createCargoLoadingMethodDto.name;
            
            const saveResult = await this.cargoLoadingMethodsRepository.save(cargoLoadingMethod);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
        }
    }

    async updateCargoLoadingMethod(updateCargoLoadingMethodDto: any): Promise<BpmResponse> {

        try {
            const cargoLoadingMethod: CargoLoadMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: updateCargoLoadingMethodDto.id } })
            cargoLoadingMethod.name = updateCargoLoadingMethodDto.name;

            await this.cargoLoadingMethodsRepository.update({ id: cargoLoadingMethod.id }, cargoLoadingMethod);

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

    async getCargoLoadingMethodById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const cargoLoadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, cargoLoadingMethod, null);
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

    async getAllCargoLoadingMethods(): Promise<BpmResponse> {
        try {
            const cargoLoadingMethods = await this.cargoLoadingMethodsRepository.find({ where: { deleted: false }, order: { createdAt: 'DESC' } });
            if (!cargoLoadingMethods.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, cargoLoadingMethods, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCargoLoadingMethod(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const cargoLoadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id, deleted: false } });
            cargoLoadingMethod.deleted = true;
            await this.cargoLoadingMethodsRepository.save(cargoLoadingMethod);
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