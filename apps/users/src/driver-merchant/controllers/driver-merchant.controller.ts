import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Req, Query, Patch } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverMerchantsService } from '../services/driver-merchant.service';
import { CompleteDriverMerchantDto, CreateDriverMerchantDto, CreateDriverMerchantUserDto, CreateInStepDriverMerchantDto } from '../..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppendDriverMerchantDto } from '@app/shared-modules/entites/driver-merchant/dtos/driver-merchant.dto';
 
@ApiTags('Driver merchant')
@Controller('driver-merchants')
export class DriverMerchantController {
  constructor(
    private driverDriverMerchantsService: DriverMerchantsService,
  ) { }

  @ApiOperation({ summary: 'Create driver merchant' })
  @Post('register')
  @UsePipes(ValidationPipe)
  async create(@Body() createDriverMerchantDto: CreateDriverMerchantDto) {
    return this.driverDriverMerchantsService.createDriverMerchant(createDriverMerchantDto);
  }
 
  @ApiOperation({ summary: 'Create driver merchant step2' })
  @Post('register/step')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificate', maxCount: 1 },
    { name: 'transportationCertificate', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  )
  async createDriver(
    @UploadedFiles() files: { passport?: any[], logo?: any[], registrationCertificate?: any[], transportationCertificate?: any[] },
    @Body() merchantData: CreateInStepDriverMerchantDto
  ) {
    return this.driverDriverMerchantsService.createInStepMerchant(files, merchantData)
  }

  @ApiOperation({ summary: 'Create driver merchant step3' })
  @Post('register/complete')
  @UsePipes(ValidationPipe)
  async complete(@Body() createDriverMerchantDto: CompleteDriverMerchantDto) {
    return this.driverDriverMerchantsService.completeMerchant(createDriverMerchantDto);
  }

  @ApiOperation({ summary: 'Create driver merchant user' })
  @Post('register/user')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createDriverMerchantUserDto: CreateDriverMerchantUserDto) {
    return this.driverDriverMerchantsService.createUser(createDriverMerchantUserDto);
  }

  @ApiOperation({ summary: 'Verify driver merchant' })
  @Patch('verify-driver-merchant')
  async verifyMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverDriverMerchantsService.verifyMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Reject driver merchant' })
  @Patch('reject-driver-merchant')
  async rejectMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverDriverMerchantsService.rejectMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Block driver merchant' })
  @Patch('block-driver-merchant')
  async blockMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverDriverMerchantsService.blockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Unblock driver merchant' })
  @Patch('unblock-driver-merchant')
  async unblockMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverDriverMerchantsService.unblockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Append driver' })
  @Post('append-driver')
  @UsePipes(ValidationPipe)
  async appendDriver(@Body() appendDriverMerchantDto: AppendDriverMerchantDto, @Req() req: Request) {
    return this.driverDriverMerchantsService.appendDriverToMerchant(appendDriverMerchantDto, req['user']);
  }

  //get methods  
  @ApiOperation({ summary: 'Get all merchants' })
  @Get('all-driver-merchants')
  async getmerchants() {
    return this.driverDriverMerchantsService.getMerchants()
  }

  @ApiOperation({ summary: 'Get client merchant by id' })
  @Get('driver-merchant-by')
  async getById(@Query('id') id: number) {
    return this.driverDriverMerchantsService.findMerchantById(id);
  }

  @ApiOperation({ summary: 'Get all unverified driver merchants' })
  @Get('unverified-driver-merchants')
  async getUnverifiedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverDriverMerchantsService.getUnverifiedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  @ApiOperation({ summary: 'Get all verified driver merchants' })
  @Get('verified-driver-merchants')
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
    return this.driverDriverMerchantsService.getVerifiedMerchants(id, pageSize, pageIndex, sortBy, sortType, companyName, createdFrom, createdAtTo)
  }

  @ApiOperation({ summary: 'Get all rejected driver merchants' })
  @Get('rejected-driver-merchants')
  async getRejectedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverDriverMerchantsService.getRejectedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  
  @ApiOperation({ summary: 'Get all rejected driver merchants' })
  @Get('blocked-driver-merchants')
  async getBlockedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverDriverMerchantsService.getBlockedMerchants(pageSize, pageIndex, sortBy, sortType)
  }
}
