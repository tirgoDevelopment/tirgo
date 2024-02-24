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
import { TransportKindsService } from '../services/transport-kind.service';
import { TransportKindDto } from '../..';

@Controller('transport-kinds')
export class TransportKindsController {
  constructor(private readonly transportesService: TransportKindsService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createTransportKind(@Body() createTransportKindDto: TransportKindDto) {
    return this.transportesService.createTransportKind(createTransportKindDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateTransportKind(@Body() updateTransportKindDto: TransportKindDto) {
    return this.transportesService.updateTransportKind(updateTransportKindDto);
  }

  @Get()
  async getTransportKind(@Query('id') id: string) {
    return this.transportesService.getTransportKindById(id);
  }

  @Get('all')
  async getAllTransportKinds() {
    return this.transportesService.getAllTransportKinds();
  }

  @Delete('')
  async deleteTransportKind(@Query('id') id: string) {
    return this.transportesService.deleteTransportKind(id);
  }

}