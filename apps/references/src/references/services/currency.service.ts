import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BpmResponse, Currency, ResponseStauses } from '../../index';
import { CurrencyDto } from '../../index';
import { InternalErrorException, NoContentException, BadRequestException } from '../../index';

@Injectable()
export class CurrenciesService {
    constructor(
        @InjectRepository(Currency) private readonly currencysRepository: Repository<Currency>,
    ) { }

    async createCurrency(createCurrencyDto: CurrencyDto): Promise<BpmResponse> {

        try {
            const currency: Currency = new Currency();
            currency.name = createCurrencyDto.name;
            currency.code = createCurrencyDto.code;
            
            const saveResult = await this.currencysRepository.save(currency);
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

    async updateCurrency(updateCurrencyDto: CurrencyDto): Promise<BpmResponse> {

        try {
            const currency: Currency = new Currency();
            currency.name = updateCurrencyDto.name;
            currency.code = updateCurrencyDto.code;

            await this.currencysRepository.update({ id: currency.id }, currency);

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

    async getCurrencyById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const currency = await this.currencysRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, currency, null);
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

    async getAllCurrencies(): Promise<BpmResponse> {
        try {
            const currencys = await this.currencysRepository.find({ where: { deleted: false }, order: { id: 'DESC' } });
            if (!currencys.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, currencys, null);
        } catch (err: any) {
            return new BpmResponse(false, null, [ResponseStauses.NotFound]);
        }
    }

    async deleteCurrency(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                return new BpmResponse(false, null, ['Id is required']);
            }
            const currency = await this.currencysRepository.findOneOrFail({ where: { id, deleted: false } });
            await this.currencysRepository.softDelete(id);
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