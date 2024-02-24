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
import { CargoLoadingMethodsService } from '../services/cargo-loading-method.service';

@Controller('cargo-loading-method')
export class CargoLoadingMethodesController {
  constructor(private readonly cargoLoadingMethodesService: CargoLoadingMethodsService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createCargoLoadingMethod(@Body() createCargoLoadingMethodDto: any) {
    return this.cargoLoadingMethodesService.createCargoLoadingMethod(createCargoLoadingMethodDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateCargoLoadingMethod(@Body() updateCargoLoadingMethodDto: any) {
    return this.cargoLoadingMethodesService.updateCargoLoadingMethod(updateCargoLoadingMethodDto);
  }

  @Get()
  async getCargoLoadingMethod(@Query('id') id: string) {
    return this.cargoLoadingMethodesService.getCargoLoadingMethodById(id);
  }

  @Get('all')
  async getAllCargoLoadingMethodes() {
    return this.cargoLoadingMethodesService.getAllCargoLoadingMethods();
  }

  @Delete('')
  async deleteCargoLoadingMethod(@Query('id') id: string) {
    return this.cargoLoadingMethodesService.deleteCargoLoadingMethod(id);
  }

}