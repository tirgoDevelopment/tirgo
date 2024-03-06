import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Put, Patch, Query, Delete, Req, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientMerchantsService } from '../services/client-merchant.service';
import { ClientMerchantDto, CompleteClientMerchantDto, CreateClientMerchantDto, CreateClientMerchantUserDto, CreateInStepClientMerchantDto, UpdateClientMerchantUserDto } from '../..';
import { ClientMerchantUsersService } from '../services/client-merchant-user.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Client merchant')
@Controller('client-merchants')
export class ClientMerchantController {
  constructor(
    private clientMerchantsService: ClientMerchantsService,
    private clientClientMerchantUsersService: ClientMerchantUsersService,
  ) { }

  @ApiOperation({ summary: 'Create client merchant' })
  @Post('register')
  @UsePipes(ValidationPipe)
  async create(@Body() createClientMerchantDto: CreateClientMerchantDto) {
    return this.clientMerchantsService.createClientMerchant(createClientMerchantDto);
  }
 
  @ApiOperation({ summary: 'Create client merchant step2' })
  @Post('register/step')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([ 
    { name: 'registrationCertificateFilePath', maxCount: 1 },
    { name: 'transportationCertificateFilePath', maxCount: 1 },
    { name: 'passportFilePath', maxCount: 1 },
    { name: 'logoFilePath', maxCount: 1 },
  ]),
  )
  async createDriver(
    @UploadedFiles() files: { passport?: any[], logo?: any[], registrationCertificate?: any[], transportationCertificate?: any[] },
    @Body() merchantData: CreateInStepClientMerchantDto
  ) {
    return this.clientMerchantsService.createInStepMerchant(files, merchantData)
  }

  @ApiOperation({ summary: 'Create client merchant complete' })
  @Post('register/complete')
  @UsePipes(ValidationPipe)
  async complete(@Body() createClientMerchantDto: CompleteClientMerchantDto) {
    return this.clientMerchantsService.completeMerchant(createClientMerchantDto);
  }

  @ApiOperation({ summary: 'Update client merchant' })
  @Put('update-client-merchant')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificate', maxCount: 1 },
    { name: 'transportationCertificate', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]))
  async updateDriver(
    @UploadedFiles() files: { passport?: any[], logo?: any[], registrationCertificate?: any[], transportationCertificate?: any[] },
    @Body() merchantData: ClientMerchantDto
  ) {
    return this.clientMerchantsService.updateClientMerchant(files, merchantData)
  }

  @ApiOperation({ summary: 'Verify client merchant' })
  @Patch('verify-client-merchant')
  async verifyMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.clientMerchantsService.verifyMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Reject client merchant' })
  @Patch('reject-client-merchant')
  async rejectMerchant(@Query('id') id: number,  @Req() req: Request) {
   return this.clientMerchantsService.rejectMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Delete client merchant' })
  @Delete()
  async deleteMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.deleteMerchant(id)
  }

  @ApiOperation({ summary: 'Block client merchant' })
  @Patch('block-client-merchant')
  async blockMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.clientMerchantsService.blockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Activate client merchant' })
  @Patch('activate-client-merchant')
  async activateMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.clientMerchantsService.unblockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Get all merchant' })
  @Get()
  async getmerchants() {
    return this.clientMerchantsService.getMerchants()
  }

  @ApiOperation({ summary: 'Get all unverified client merchants' })
  @Get('unverified-client-merchants')
  async getUnverifiedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientMerchantsService.getUnverifiedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  @ApiOperation({ summary: 'Get all verified client merchants' })
  @Get('verified-client-merchants')
  async getVerifiedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('merchantId') id: number,
    @Query('companyName') companyName: string,
    @Query('createdFrom') createdFrom: string,
    @Query('createdAtTo') createdAtTo: string,
  ) {
    return this.clientMerchantsService.getVerifiedMerchants(id, pageSize, pageIndex, sortBy, sortType, companyName, createdFrom, createdAtTo)
  }

  @ApiOperation({ summary: 'Get all rejected client merchants' })
  @Get('rejected-client-merchants')
  async getRejectedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientMerchantsService.getRejectedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  @ApiOperation({ summary: 'Get all rejected client merchants' })
  @Get('blocked-client-merchants')
  async getBlockedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.clientMerchantsService.getBlockedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  @ApiOperation({ summary: 'Get client merchant by id' })
  @Get('client-merchant-by')
  async getById(@Query('id') id: number) {
    return this.clientMerchantsService.findMerchantById(id);
  }

}
