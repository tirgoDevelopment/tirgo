import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Delete, Patch, Put, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './client.service';
import { ClientDto } from '..';

@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService
  ) { }

  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
  ]))
  async createClient(
    @UploadedFiles() files: { passport?: any[] },
    @Body() clientData: ClientDto,
  ) {
    return this.clientsService.createClient(files.passport[0], clientData)
  }

  @Put()
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
  ]))
  async updateClient(
    @UploadedFiles() files: { passport?: any[] },
    @Body() clientData: ClientDto,
  ) {
    return this.clientsService.updateClient(files, clientData)
  }

  // @Put()
  // @UsePipes(ValidationPipe)
  // async updateClient(@Body() updateClientDto: ClientDto) {
  //   return this.clientsService.updateClient(updateClientDto);
  // }
  
  @Get('client-by')
  async getClient(@Query('id') id: number) {
    return this.clientsService.getClientById(id);
  }

  @Get('all')
  async getAllClient(
    @Query('clientId') clientId: number, 
    @Query('firstName') firstName: string, 
    @Query('phoneNumber') phoneNumber: string, 
    @Query('createdFrom') createdFrom: string, 
    @Query('createdAtTo') createdAtTo: string, 
    @Query('lastLoginFrom') lastLoginFrom: string,
    @Query('lastLoginTo') lastLoginTo: string
  ) {
    return this.clientsService.getAllClients(clientId, firstName, phoneNumber, createdFrom, createdAtTo, lastLoginFrom, lastLoginTo);
  }

  @Get('active')
  async getAllActiveClient() {
    return this.clientsService.getAllActiveClients();
  }

  @Get('non-active')
  async getAllNonActiveClient() {
    return this.clientsService.getAllNonActiveClients();
  }

  @Get('deleted')
  async getAllDeletedClient() {
    return this.clientsService.getAllDeletedClients();
  }

  @Delete()
  async deleteClient(@Query('id') id: number) {
    return this.clientsService.deleteClient(id);
  }

  @Patch('restore-client')
  async restoreClient(@Query('id') id: number) {
    return this.clientsService.restoreClient(id);
  }

  @Patch('block')
  async blockClient(@Query('id') id: number, @Body('blockReason') blockReason: string) {
    return this.clientsService.blockClient(id, blockReason);
  }

  @Patch('activate')
  async activateClient(@Query('id') id: number) {
    return this.clientsService.activateClient(id);
  }

}
