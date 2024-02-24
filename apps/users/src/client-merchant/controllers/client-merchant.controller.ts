import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Put, Patch, Query, Delete, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientMerchantsService } from '../services/client-merchant.service';
import { ClientMerchantDto, CompleteClientMerchantDto, CreateClientMerchantDto, CreateClientMerchantUserDto, CreateInStepClientMerchantDto, UpdateClientMerchantUserDto } from '../..';
import { ClientMerchantUsersService } from '../services/client-merchant-user.service';

@Controller()
export class ClientMerchantController {
  constructor(
    private clientMerchantsService: ClientMerchantsService,
    private clientClientMerchantUsersService: ClientMerchantUsersService,
  ) { }

  @Post('register/client-merchant')
  @UsePipes(ValidationPipe)
  async create(@Body() createClientMerchantDto: CreateClientMerchantDto) {
    return this.clientMerchantsService.createClientMerchant(createClientMerchantDto);
  }
 
  @Post('register/client-merchant/step')
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

  @Post('register/client-merchant/complete')
  @UsePipes(ValidationPipe)
  async complete(@Body() createClientMerchantDto: CompleteClientMerchantDto) {
    return this.clientMerchantsService.completeMerchant(createClientMerchantDto);
  }

  @Put('register/client-merchant')
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

  @Post('register/client-merchant/user')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createClientMerchantUserDto: CreateClientMerchantUserDto) {
    return this.clientClientMerchantUsersService.createUser(createClientMerchantUserDto);
  }

  @Patch('client-merchant/verify')
  async verifyMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.verifyMerchant(id)
  }

  @Patch('client-merchant/reject')
  async rejectMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.rejectMerchant(id)
  }

  @Delete('client-merchant')
  async deleteMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.deleteMerchant(id)
  }

  @Patch('client-merchant/block-merchant')
  async blockMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.blockMerchant(id)
  }

  @Patch('client-merchant/activate-merchant')
  async activateMerchant(@Query('id') id: number) {
   return this.clientMerchantsService.activateMerchant(id)
  }

  @Get('merchant')
  async getmerchants() {
    return this.clientMerchantsService.getMerchants()
  }

  @Get('client-merchant/unverified-merchants')
  async getUnverifiedMerchants() {
    return this.clientMerchantsService.getUnverifiedMerchants()
  }

  @Get('client-merchant/verified-merchants')
  async getVerifiedMerchants(
    @Query('merchantId') id: number,
    @Query('companyName') companyName: string,
    @Query('createdFrom') createdFrom: string,
    @Query('createdAtTo') createdAtTo: string,
  ) {
    return this.clientMerchantsService.getVerifiedMerchants(id, companyName, createdFrom, createdAtTo)
  }

  @Get('client-merchant/rejected-merchants')
  async getRejectedMerchants() {
    return this.clientMerchantsService.getRejectedMerchants()
  }

  @Get('client-merchant/id')
  async getById(@Query('id') id: number) {
    return this.clientMerchantsService.findMerchantById(id);
  }

}
