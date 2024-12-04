import { Body, Controller, Get, Param, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriversServicesRequestsDto, DriversServicesRequestsQueryDto, DriversServicesRequestsMessagesDto, DriversServicesRequestsMessagesQueryDto } from '../..';
import { ServicesRequestsService } from '../services/services-requests.service';

@ApiTags('Drivers services requests')
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

  @ApiOperation({ summary: 'Send message to service request' })
  @Post(':id/messages')
  @UsePipes(ValidationPipe)
  async createMessage(
    @Body() dto: DriversServicesRequestsMessagesDto,
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.sendMessage(dto, id, req['user']);
  }

  @ApiOperation({ summary: 'Get service request messages' })
  @Get(':id/messages')
  @UsePipes(ValidationPipe)
  async getMessages(
    @Query() query: DriversServicesRequestsMessagesQueryDto,
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.getAllMessages(query, id, req['user']);
  }

}
