import { Injectable } from '@nestjs/common';
import { BpmResponse, InternalErrorException, ResponseStauses } from '../..';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CitiesService {
    constructor(private readonly httpService: HttpService) {}

    async findCity(cityName: string, language: string) {
        try {
           const res = await this.httpService.get(`https://nominatim.openstreetmap.org/search?q=${cityName}&format=json&accept-language=${language}`).toPromise()
           const data = res.data.map((el: any) => {
            return { name: el.name, addressType: el.addresstype, displayName: el.display_name, latitude: el.lat, longitude: el.lon }
           })
            return new BpmResponse(true, data, null);
} catch (err: any) {
            console.log(err)
            // Other error (handle accordingly)
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }

}