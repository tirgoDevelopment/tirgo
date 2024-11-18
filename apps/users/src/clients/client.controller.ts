import { Body, Controller, Post, Req, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Delete, Patch, Put, Param, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './client.service';
import { ClientDto, GetClientsDto, UpdateClientDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService
  ) { }

  @ApiOperation({ summary: 'Register client' })
  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 },
  ]))
  async registerClient(
    @UploadedFiles() files: { profile?: any[] },
    @Body() clientData: ClientDto,
    @Req() req: Request
  ) {
    return this.clientsService.createClient(files.profile[0], clientData, req['user'])
  }

  @ApiOperation({ summary: 'Create client' })
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 },
  ]))
  async createClient(
    @UploadedFiles() files: { profile?: any[] },
    @Body() clientData: ClientDto,
    @Req() req: Request
  ) {
    return this.clientsService.createClient(files.profile[0], clientData, req['user'])
  }

  @ApiOperation({ summary: 'Update client' })
  @Put()
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 },
  ]))
  async updateClient(
    @UploadedFiles() files: { profile?: any[] },
    @Body() clientData: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(files[0], clientData)
  }

  @ApiOperation({ summary: 'Update client profile' })
  @Patch(':id/profile')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 }
  ]))
  async updateDriverProfile(
    @UploadedFiles() files: { passport?: any[] },
    @Param('id') id: number,
    @Req() req: Request
  ) {
    return this.clientsService.updateClientProfile(files, id)
  }

  @ApiOperation({ summary: 'Add client Phone number' })
  @Post(':id/phone-number')
  @UsePipes(ValidationPipe)
  reateDriver(
    @Param('id') id: number,
    @Body() clientData: any,
    @Req() req: Request
  ) {
    return this.clientsService.addPhoneNumber(clientData, id, req['user'])
  }

  @ApiOperation({ summary: 'Get client by id' })
  @Get(':id')
  async getClient(@Param('id') id: number) {
    return this.clientsService.getClientById(id);
  }

  @ApiOperation({ summary: 'Get all clients' })
  @Get()
  async getAllClient(@Query() query: GetClientsDto) {
    return this.clientsService.getAllClients(query);
  }

  @ApiOperation({ summary: 'Delete client' })
  @Delete(':id')

  async deleteClient(@Param('id') id: number, @Req() req: Request) {
    return this.clientsService.deleteClient(id, req['user']);
  }

  @ApiOperation({ summary: 'Restore client' })
  @Patch(':id/restore')
  async restoreClient(@Param('id') id: number) {
    return this.clientsService.restoreClient(id);
  }

  @ApiOperation({ summary: 'Block client' })
  @Patch(':id/block')
  async blockClient(@Param('id') id: number, @Body('blockReason') blockReason: string, @Req() req: Request) {
    return this.clientsService.blockClient(id, blockReason, req['user']);
  }

  @ApiOperation({ summary: 'Unblock client' })
  @Patch(':id/unblock')
  async activateClient(@Param('id') id: number, @Req() req: Request) {
    return this.clientsService.activateClient(id, req['user']);
  }

}
