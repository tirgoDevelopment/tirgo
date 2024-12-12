import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Req, Query, Patch, Delete, Put, Param } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverMerchantsService } from '../services/driver-merchant.service';
import { CompleteDriverMerchantDto, CreateDriverMerchantDto, CreateDriverMerchantUserDto, CreateInStepDriverMerchantDto } from '../..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppendDriverMerchantDto, DriverBalanceManagementDto, DriverPaidWayKzDto } from '@app/shared-modules/entites/driver-merchant/dtos/driver-merchant.dto';
 
@ApiTags('Driver merchant')
@Controller('driver-merchants')
export class DriverMerchantController {
  constructor(
    private driverMerchantsService: DriverMerchantsService,
  ) { }

  @ApiOperation({ summary: 'Create driver merchant' })
  @Post('register')
  @UsePipes(ValidationPipe)
  async create(@Body() createDriverMerchantDto: CreateDriverMerchantDto) {
    return this.driverMerchantsService.createDriverMerchant(createDriverMerchantDto);
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
    return this.driverMerchantsService.createInStepMerchant(files, merchantData)
  }

  @ApiOperation({ summary: 'Create driver merchant step3' })
  @Post('register/complete')
  @UsePipes(ValidationPipe)
  async complete(@Body() createDriverMerchantDto: CompleteDriverMerchantDto) {
    return this.driverMerchantsService.completeMerchant(createDriverMerchantDto);
  }

  @ApiOperation({ summary: 'Create driver merchant user' })
  @Post('register/user')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createDriverMerchantUserDto: CreateDriverMerchantUserDto) {
    return this.driverMerchantsService.createUser(createDriverMerchantUserDto);
  }

  @ApiOperation({ summary: 'Update driver merchant' })
  @Put('update-driver-merchant')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificate', maxCount: 1 },
    { name: 'transportationCertificate', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  )
  async updateMerchant(@Body() dto: any, 
  @UploadedFiles() files: any ) {
   return this.driverMerchantsService.updateDriverMerchant(dto, files)
  }

  @ApiOperation({ summary: 'Verify driver merchant' })
  @Patch('verify-driver-merchant')
  async verifyMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverMerchantsService.verifyMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Reject driver merchant' })
  @Patch('reject-driver-merchant')
  async rejectMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverMerchantsService.rejectMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Block driver merchant' })
  @Patch('block-driver-merchant')
  async blockMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverMerchantsService.blockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Unblock driver merchant' })
  @Patch('unblock-driver-merchant')
  async unblockMerchant(@Query('id') id: number, @Req() req: Request) {
   return this.driverMerchantsService.unblockMerchant(id, req['user'])
  }

  @ApiOperation({ summary: 'Delete driver merchant' })
  @Delete()
  async deleteMerchant(@Query('id') id: number) {
   return this.driverMerchantsService.deleteMerchant(id)
  }

  @ApiOperation({ summary: 'Append driver' })
  @Post('append-driver')
  @UsePipes(ValidationPipe)
  async appendDriver(@Body() appendDriverMerchantDto: AppendDriverMerchantDto, @Req() req: Request) {
    return this.driverMerchantsService.appendDriverToMerchant(appendDriverMerchantDto, req['user']);
  }

  @ApiOperation({ summary: 'Request driver' })
  @Post('request-driver')
  @UsePipes(ValidationPipe)
  async requestDriver(@Req() req: Request, @Param('tmsId') tmsId: number, @Param('driverId') driverId: number) {
    return this.driverMerchantsService.requestDriverToMerchant(tmsId, driverId, req['user']);
  }

  //get methods  
  @ApiOperation({ summary: 'Get all merchants' })
  @Get('all-driver-merchants')
  async getmerchants() {
    return this.driverMerchantsService.getMerchants()
  }

  @ApiOperation({ summary: 'Get client merchant by id' })
  @Get('driver-merchant-by')
  async getById(@Query('id') id: number) {
    return this.driverMerchantsService.findMerchantById(id);
  }

  @ApiOperation({ summary: 'Get all unverified driver merchants' })
  @Get('unverified-driver-merchants')
  async getUnverifiedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverMerchantsService.getUnverifiedMerchants(pageSize, pageIndex, sortBy, sortType)
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
    @Query('createdAtFrom') createdAtFrom: string,
    @Query('createdAtTo') createdAtTo: string,
  ) {
    return this.driverMerchantsService.getVerifiedMerchants(id, pageSize, pageIndex, sortBy, sortType, companyName, createdAtFrom, createdAtTo)
  }

  @ApiOperation({ summary: 'Get all rejected driver merchants' })
  @Get('rejected-driver-merchants')
  async getRejectedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverMerchantsService.getRejectedMerchants(pageSize, pageIndex, sortBy, sortType)
  }

  
  @ApiOperation({ summary: 'Get all rejected driver merchants' })
  @Get('blocked-driver-merchants')
  async getBlockedMerchants(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driverMerchantsService.getBlockedMerchants(pageSize, pageIndex, sortBy, sortType)
  }
}
