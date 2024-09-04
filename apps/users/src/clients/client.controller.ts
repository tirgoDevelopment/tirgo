import { Body, Controller, Post, Req, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Delete, Patch, Put, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './client.service';
import { ClientDto, UpdateClientDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService
  ) { }

  @ApiOperation({ summary: 'Create client' })
  @Post('create-client')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
  ]))
  async createClient(
    @UploadedFiles() files: { passport?: any[] },
    @Body() clientData: ClientDto,
    @Req() req: Request
  ) {
    return this.clientsService.createClient(files.passport[0], clientData, req['user'])
  }

  @ApiOperation({ summary: 'Update client' })
  @Put('update-client')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
  ]))
  async updateClient(
    @UploadedFiles() files: { passport?: any[] },
    @Body() clientData: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(files, clientData)
  }

  @ApiOperation({ summary: 'Get client by id' })
  @Get('client-by-id')
  async getClient(@Query('id') id: number) {
    return this.clientsService.getClientById(id);
  }

  @ApiOperation({ summary: 'Get all clients' })
  @Get('all-clients')
  async getAllClient(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('clientId') clientId: number,
    @Query('state') state: string, 
    @Query('firstName') firstName: string, 
    @Query('phoneNumber') phoneNumber: string, 
    @Query('createdAtFrom') createdAtFrom: string, 
    @Query('createdAtTo') createdAtTo: string, 
    @Query('lastLoginFrom') lastLoginFrom: string,
    @Query('lastLoginTo') lastLoginTo: string
  ) {
    return this.clientsService.getAllClients(pageSize, pageIndex, sortBy, sortType, state, clientId, firstName, phoneNumber, createdAtFrom, createdAtTo, lastLoginFrom, lastLoginTo);
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
  @Patch('block-client')
  async blockClient(@Query('id') id: number, @Body('blockReason') blockReason: string, @Req() req: Request) {
    return this.clientsService.blockClient(id, blockReason, req['user']);
  }

  @ApiOperation({ summary: 'Unblock client' })
  @Patch('unblock-client')
  async activateClient(@Query('id') id: number, @Req() req: Request) {
    return this.clientsService.activateClient(id, req['user']);
  }

}
