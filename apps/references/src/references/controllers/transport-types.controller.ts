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
import { TransportTypesService } from '../services/transport-type.service';
import { TransportTypeDto } from '../..';

@Controller('transport-types')
export class TransportTypesController {
  constructor(private readonly transportesService: TransportTypesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createTransportType(@Body() createTransportTypeDto: TransportTypeDto) {
    return this.transportesService.createTransportType(createTransportTypeDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateTransportType(@Body() updateTransportTypeDto: TransportTypeDto) {
    return this.transportesService.updateTransportType(updateTransportTypeDto);
  }

  @Get()
  async getTransportType(@Query('id') id: string) {
    return this.transportesService.getTransportTypeById(id);
  }

  @Get('all')
  async getAllTransportTypes() {
    return this.transportesService.getAllTransportTypes();
  }

  @Delete('')
  async deleteTransportType(@Query('id') id: string) {
    return this.transportesService.deleteTransportType(id);
  }

}