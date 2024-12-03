import { Body, Controller, Get, Param, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DriversServicesRequestsDto, DriversServicesRequestsQueryDto } from '../..';
import { ServicesRequestsService } from '../services/services-requests.service';

@Controller('services-requests')
export class ServicesRequestsController {

  constructor(
    private servicesRequestsService: ServicesRequestsService
  ) { }

  @ApiOperation({ summary: 'Driver create service request' })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: DriversServicesRequestsDto,
    @Req() req: Request
  ) {
    return this.servicesRequestsService.create(dto, req['user']);
  }

  @ApiOperation({ summary: 'Get all driver service requests' })
  @Get()
  async getAll(
    @Query() query: DriversServicesRequestsQueryDto,
    @Req() req: Request
  ) {
    return this.servicesRequestsService.getAll(query, req['user']);
  }

  @ApiOperation({ summary: 'Get all driver service requests by driver id' })
  @Get('/drivers/:id')
  async getAllByDriver(
    @Query() query: DriversServicesRequestsQueryDto,
    @Param('id') id: number,
    @Req() req: Request
  ) {
    return this.servicesRequestsService.getAllByDriverId(query, id, req['user']);
  }

}
