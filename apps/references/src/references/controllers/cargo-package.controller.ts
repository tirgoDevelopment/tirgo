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
import { CargoPackageDto } from '../..';
import { CargoPackagesService } from '../services/cargo-package.service';

@Controller('cargo-packages')
export class CargoPackagesController {
  constructor(private readonly cargoPackagesService: CargoPackagesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createCargoPackage(@Body() createCargoPackageDto: CargoPackageDto) {
    return this.cargoPackagesService.createCargoPackage(createCargoPackageDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateCargoPackage(@Body() updateCargoPackageDto: CargoPackageDto) {
    return this.cargoPackagesService.updateCargoPackage(updateCargoPackageDto);
  }

  @Get()
  async getCargoPackage(@Query('id') id: string) {
    return this.cargoPackagesService.getCargoPackageById(id);
  }

  @Get('all')
  async getAllCargoPackages() {
    return this.cargoPackagesService.getAllCargoPackages();
  }

  @Delete('')
  async deleteCargoPackage(@Query('id') id: string) {
    return this.cargoPackagesService.deleteCargoPackage(id);
  }

}