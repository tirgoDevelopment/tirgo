import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverMerchantsService } from './driver-merchant.service';
import { CompleteDriverMerchantDto, CreateDriverMerchantDto, CreateDriverMerchantUserDto, CreateInStepDriverMerchantDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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

  @ApiOperation({ summary: 'Get all merchants' })
  @Get('all-merchant')
  async getmerchants() {
    return this.driverDriverMerchantsService.getMerchants()
  }

}
