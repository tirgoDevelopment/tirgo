import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from '../services/cities.service';

@Controller('cities')
export class CitiesController {
  constructor(
    private citiesServices: CitiesService
  ) {}

  @Get()
  async getCities (
    @Query('city') city: string,
    @Query('lang') lan: string
  ) {
    return this.citiesServices.findCity(city, lan)
  }
}
