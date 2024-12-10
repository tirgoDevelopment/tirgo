import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DriversServicesRequestsDto,
  DriversServicesRequestsOperationDto,
  DriversServicesRequestsPricesDto,
  DriversServicesRequestsQueryDto,
  DriversServicesRequestsMessagesDto,
  DriversServicesRequestsMessagesQueryDto
} from '../..';
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

  @ApiOperation({ summary: 'Cancel service request' })
  @Patch(':id/cancel')
  @UsePipes(ValidationPipe)
  async cancel(
    @Body() dto: DriversServicesRequestsOperationDto,
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.cancelServiceRequest(dto, id, req['user']);
  }

  @ApiOperation({ summary: 'Pricing service request' })
  @Patch(':id/price')
  @UsePipes(ValidationPipe)
  async price(
    @Body() dto: DriversServicesRequestsPricesDto,
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.priceServiceRequest(dto, id, req['user']);
  }

  @ApiOperation({ summary: 'Driver confirms price of service request' })
  @Patch(':id/confirm-price')
  @UsePipes(ValidationPipe)
  async confirm(
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.confirmServiceRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Staff starts working on service request' })
  @Patch(':id/working')
  @UsePipes(ValidationPipe)
  async working(
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.workingServiceRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Staff completes working on service request' })
  @Patch(':id/complete')
  @UsePipes(ValidationPipe)
  async complete(
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.completeServiceRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Delete service request' })
  @Delete(':id/delete')
  @UsePipes(ValidationPipe)
  async delete(
    @Body() dto: DriversServicesRequestsOperationDto,
    @Req() req: Request,
    @Param('id') id: number
  ) {
    return this.servicesRequestsService.deleteServiceRequest(dto, id, req['user']);
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
