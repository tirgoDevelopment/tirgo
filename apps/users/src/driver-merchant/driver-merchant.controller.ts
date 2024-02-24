import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverMerchantsService } from './driver-merchant.service';
import { CompleteDriverMerchantDto, CreateDriverMerchantDto, CreateDriverMerchantUserDto, CreateInStepDriverMerchantDto } from '..';

@Controller()
export class DriverMerchantController {
  constructor(
    private driverDriverMerchantsService: DriverMerchantsService,
  ) { }

  @Post('register/driver-merchant')
  @UsePipes(ValidationPipe)
  async create(@Body() createDriverMerchantDto: CreateDriverMerchantDto) {
    return this.driverDriverMerchantsService.createDriverMerchant(createDriverMerchantDto);
  }
 
  @Post('register/driver-merchant/step')
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

  @Post('register/driver-merchant/complete')
  @UsePipes(ValidationPipe)
  async complete(@Body() createDriverMerchantDto: CompleteDriverMerchantDto) {
    return this.driverDriverMerchantsService.completeMerchant(createDriverMerchantDto);
  }

  @Post('register/driver-merchant/user')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createDriverMerchantUserDto: CreateDriverMerchantUserDto) {
    return this.driverDriverMerchantsService.createUser(createDriverMerchantUserDto);
  }

  @Get('register/merchant')
  async getmerchants() {
    return this.driverDriverMerchantsService.getMerchants()
  }

}
