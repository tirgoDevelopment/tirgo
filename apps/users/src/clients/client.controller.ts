import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Delete, Patch, Put, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './client.service';
import { ClientDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService
  ) { }

  @ApiOperation({ summary: 'Create client' })
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

  @ApiOperation({ summary: 'Update client' })
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

  @ApiOperation({ summary: 'Get client by id' })
  @Get('client-by')
  async getClient(@Query('id') id: number) {
    return this.clientsService.getClientById(id);
  }

  @ApiOperation({ summary: 'Get all clients' })
  @Get('all')
  async getAllClient(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('clientId') clientId: number, 
    @Query('firstName') firstName: string, 
    @Query('phoneNumber') phoneNumber: string, 
    @Query('createdFrom') createdFrom: string, 
    @Query('createdAtTo') createdAtTo: string, 
    @Query('lastLoginFrom') lastLoginFrom: string,
    @Query('lastLoginTo') lastLoginTo: string
  ) {
    return this.clientsService.getAllClients(pageSize, pageIndex, sortBy, sortType, clientId, firstName, phoneNumber, createdFrom, createdAtTo, lastLoginFrom, lastLoginTo);
  }

  @ApiOperation({ summary: 'Get all active clients' })
  @Get('active')
  async getAllActiveClient(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientsService.getAllActiveClients(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Get all non-active clients' })
  @Get('non-active')
  async getAllNonActiveClient(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientsService.getAllNonActiveClients(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Get all deleted clients' })
  @Get('deleted')
  async getAllDeletedClient(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientsService.getAllDeletedClients(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Delete client' })
  @Delete()
  async deleteClient(@Query('id') id: number) {
    return this.clientsService.deleteClient(id);
  }

  @ApiOperation({ summary: 'Restore client' })
  @Patch('restore-client')
  async restoreClient(@Query('id') id: number) {
    return this.clientsService.restoreClient(id);
  }

  @ApiOperation({ summary: 'Block client' })
  @Patch('block')
  async blockClient(@Query('id') id: number, @Body('blockReason') blockReason: string) {
    return this.clientsService.blockClient(id, blockReason);
  }

  @ApiOperation({ summary: 'Activate client' })
  @Patch('activate')
  async activateClient(@Query('id') id: number) {
    return this.clientsService.activateClient(id);
  }

}
