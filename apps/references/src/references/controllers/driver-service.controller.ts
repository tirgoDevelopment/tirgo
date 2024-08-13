import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Put, Query, Delete } from '@nestjs/common';
import { DriverServiceDto } from '../..';
import { DriverServicesService } from '../services/driver-services.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('driver-services')
export class DriverServicesController {

  constructor(private readonly driverServicesService: DriverServicesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createDriverService(@Body() createDriverServiceDto: DriverServiceDto) {
    return this.driverServicesService.createDriverService(createDriverServiceDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateDriverService(@Body() updateDriverServiceDto: DriverServiceDto) {
    return this.driverServicesService.updateDriverService(updateDriverServiceDto);
  }

  @Get('get-by')
  async getDriverService(@Query('id') id: number) {
    return this.driverServicesService.getDriverServiceById(id);
  }

  @Get('all-driver-services')
  async getAllDriverServices() {
    return this.driverServicesService.getAllDriverServices();
  }

  @Delete()
  async deleteDriverService(
    @Query('id') id: number
  ) {
    return this.driverServicesService.deleteDriverService(id);
  }

}
