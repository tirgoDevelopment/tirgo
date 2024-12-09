import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Put, Query, Delete, Param } from '@nestjs/common';
import { DriversServicesDto } from '../..';
import { DriverServicesService } from '../services/driver-services.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Driver services')
@Controller('driver-services')
export class DriverServicesController {

  constructor(private readonly driverServicesService: DriverServicesService) { }

  @ApiOperation({ summary: 'Create drive service' })
  @Post()
  @UsePipes(ValidationPipe)
  async createDriverService(@Body() createDriverServiceDto: DriversServicesDto) {
    return this.driverServicesService.createDriverService(createDriverServiceDto);
  }

  @ApiOperation({ summary: 'Update drive service' })
  @Put()
  @UsePipes(ValidationPipe)
  async updateDriverService(@Body() updateDriverServiceDto: DriversServicesDto) {
    return this.driverServicesService.updateDriverService(updateDriverServiceDto);
  }

  @ApiOperation({ summary: 'Get drive service by id' })
  @Get(':id')
  async getDriverService(@Param('id') id: number) {
    return this.driverServicesService.getDriverServiceById(id);
  }

  @ApiOperation({ summary: 'Get all drive service' })
  @Get()
  async getAllDriverServices(
    @Query('isSubscription') isSubscription: boolean,
    @Query('isLegalEntity') isLegalEntity: boolean
  ) {
    return this.driverServicesService.getAllDriverServices(isSubscription, isLegalEntity);
  }

  @ApiOperation({ summary: 'Delete drive service' })
  @Delete(':id')
  async deleteDriverService(
    @Param('id') id: number
  ) {
    return this.driverServicesService.deleteDriverService(id);
  }

}
