import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportKindDto } from '../../index';
import { BpmResponse, ResponseStauses, TransportKind, InternalErrorException, NoContentException, BadRequestException } from '../../index';

@Injectable()
export class TransportKindsService {
    constructor(
        @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    ) { }

    async createTransportKind(createTransportKindDto: TransportKindDto): Promise<BpmResponse> {

        try {
            const transportKind: TransportKind = new TransportKind();
            transportKind.name = createTransportKindDto.name;
            transportKind.isMode = createTransportKindDto.isMode;

            const saveResult = await this.transportKindsRepository.save(transportKind);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            throw new InternalErrorException(ResponseStauses.CreateDataFailed, err.message);
        }
    }

    async updateTransportKind(updateTransportKindDto: TransportKindDto): Promise<BpmResponse> {

        try {
            const transportKind: TransportKind = await this.transportKindsRepository.findOneOrFail({ where: { id: updateTransportKindDto.id } })
            transportKind.name = updateTransportKindDto.name;
            transportKind.isMode = updateTransportKindDto.isMode;

            await this.transportKindsRepository.update({ id: transportKind.id }, transportKind);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
        } catch (err: any) {
            throw new InternalErrorException(ResponseStauses.UpdateDataFailed, err.message);
        }
    }

    async getTransportKindById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const transportKind = await this.transportKindsRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, transportKind, null);
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

    async getAllTransportKinds(): Promise<BpmResponse> {
        try {
            const transportKinds = await this.transportKindsRepository.find({ where: { deleted: false }, relations: ['createdBy'], order: { id: 'DESC' } });
            if (!transportKinds.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, transportKinds, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteTransportKind(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const transportKind = await this.transportKindsRepository.findOneOrFail({ where: { id, deleted: false } });
            await this.transportKindsRepository.softDelete(id);
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