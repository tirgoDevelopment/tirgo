import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalErrorException, NoContentException, BadRequestException, CargoPackage, CargoPackageDto, BpmResponse, ResponseStauses } from '../../index';

@Injectable()
export class CargoPackagesService {
    constructor(
        @InjectRepository(CargoPackage) private readonly cargoPackagesRepository: Repository<CargoPackage>,
    ) { }

    async createCargoPackage(createCargoPackageDto: CargoPackageDto): Promise<BpmResponse> {

        try {
            const cargoPackage: CargoPackage = new CargoPackage();
            cargoPackage.name = createCargoPackageDto.name;
            
            const saveResult = await this.cargoPackagesRepository.save(cargoPackage);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
        }
    }

    async updateCargoPackage(updateCargoPackageDto: CargoPackageDto): Promise<BpmResponse> {

        try {
            const cargoPackage: CargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: updateCargoPackageDto.id } })
            cargoPackage.name = updateCargoPackageDto.name;

            await this.cargoPackagesRepository.update({ id: cargoPackage.id }, cargoPackage);

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

    async getCargoPackageById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, cargoPackage, null);
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

    async getAllCargoPackages(): Promise<BpmResponse> {
        try {
            const cargoPackages = await this.cargoPackagesRepository.find({ where: { deleted: false }, order: { id: 'DESC' } });
            if (!cargoPackages.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, cargoPackages, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCargoPackage(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id, deleted: false } });
            cargoPackage.deleted = true;
            await this.cargoPackagesRepository.save(cargoPackage);
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