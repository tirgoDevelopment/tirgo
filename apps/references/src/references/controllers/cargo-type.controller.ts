import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { CargoTypesService } from '../services/cargo-type.service';
import { CargoTypeDto } from '../..';

@Controller('cargo-types')
export class CargoTypesController {
  constructor(private readonly cargoTypesService: CargoTypesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createCargoType(@Body() createCargoTypeDto: CargoTypeDto) {
    return this.cargoTypesService.createCargoType(createCargoTypeDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateCargoType(@Body() updateCargoTypeDto: CargoTypeDto) {
    return this.cargoTypesService.updateCargoType(updateCargoTypeDto);
  }

  @Get()
  async getCargoType(@Query('id') id: string) {
    return this.cargoTypesService.getCargoTypeById(id);
  }

  @Get('all')
  async getAllCargoTypes() {
    return this.cargoTypesService.getAllCargoTypes();
  }

  @Delete('')
  async deleteCargoType(@Query('id') id: string) {
    return this.cargoTypesService.deleteCargoType(id);
  }

}