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
import { CargoStatusesService } from '../services/cargo-status.service';
import { CargoStatusDto } from '../..';

@Controller('cargo-statuses')
export class CargoStatusesController {
  constructor(private readonly cargoStatusesService: CargoStatusesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createCargoStatus(@Body() createCargoStatusDto: CargoStatusDto) {
    return this.cargoStatusesService.createCargoStatus(createCargoStatusDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateCargoStatus(@Body() updateCargoStatusDto: CargoStatusDto) {
    return this.cargoStatusesService.updateCargoStatus(updateCargoStatusDto);
  }

  @Get()
  async getCargoStatus(@Query('id') id: string) {
    return this.cargoStatusesService.getCargoStatusById(id);
  }

  @Get('all')
  async getAllCargoStatuses() {
    return this.cargoStatusesService.getAllCargoStatuses();
  }

  @Delete('')
  async deleteCargoStatus(@Query('id') id: string) {
    return this.cargoStatusesService.deleteCargoStatus(id);
  }

}