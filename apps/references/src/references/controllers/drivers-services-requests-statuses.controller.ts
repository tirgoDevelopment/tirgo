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
import { DriversServicesRequestsStatusesDto } from '../..';
import { ServicesRequestsStatusesService } from '../services/drivers-services-requests-statuses.service';

@Controller('services-requests-statuses')
export class ServicesRequestsStatusesController {
  constructor(private readonly servicesRequestsStatusesService: ServicesRequestsStatusesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createStatus(@Body() dto: DriversServicesRequestsStatusesDto) {
    return this.servicesRequestsStatusesService.createStatus(dto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateStatus(@Body() dto: DriversServicesRequestsStatusesDto) {
    return this.servicesRequestsStatusesService.updateStatus(dto);
  }

  @Get(':id')
  async getStatus(@Query('id') id: string) {
    return this.servicesRequestsStatusesService.getStatusById(id);
  }

  @Get()
  async getAllStatuses() {
    return this.servicesRequestsStatusesService.getAllStatuses();
  }

  @Delete('')
  async deleteStatus(@Query('id') id: string) {
    return this.servicesRequestsStatusesService.deleteStatus(id);
  }

}