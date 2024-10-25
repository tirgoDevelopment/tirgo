import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Delete, Query, Patch, Put, Req, Param, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AppendDriversToTmsDto, DriverDto, UpdateDriverDto } from '../..';
import { DriversService } from '../services/driver.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateDriverBirthDayDto, UpdateDriverPhoneDto } from '@app/shared-modules/entites/driver/dtos/driver.dto';
 
@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(
    private driversService: DriversService
  ) { }

  @ApiOperation({ summary: 'Driver register' })
  @Post('register-driver')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 }
  ]))
  async registerDriver(
    @UploadedFiles() files: { profile?: any[] },
    @Body() driverData: DriverDto,
    @Req() req: Request
  ) {
    return this.driversService.registerDriver(driverData, req['user'], files)
  }

  @ApiOperation({ summary: 'Create Driver' })
  @Post('create-driver')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'driverLicense', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'profile', maxCount: 1 }
  ]))
  async createDriver(
    @UploadedFiles() files: { passport?: any[], driverLicense?: any[], profile?: any[]  },
    @Body() driverData: DriverDto,
    @Req() req: Request
  ) {
    console.log('Driver registration', files, req.body)
    return this.driversService.createDriver(driverData, req['user'], files)
  }

  @ApiOperation({ summary: 'Add Driver Phone number' })
  @Post('driver-add-phone')
  @UsePipes(ValidationPipe)
  reateDriver(
    @Body() driverData: UpdateDriverPhoneDto,
    @Req() req: Request
  ) {
    return this.driversService.addPhoneNumber(driverData, req['user'])
  }

  @ApiOperation({ summary: 'Update driver' })
  @UsePipes(ValidationPipe)
  @Put('update-driver')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
    { name: 'driverLicense', maxCount: 1 },
  ]))
  updateDriver(
    @UploadedFiles() files: { passport?: any[], driverLicense?: any[] },
    @Body() updateDriverDto: UpdateDriverDto
    ) {
    return this.driversService.updateDriver(updateDriverDto, files)
  }

  @ApiOperation({ summary: 'Update driver phone' })
  @UsePipes(ValidationPipe)
  @Patch('update-driver-phone/:id')
  updateDriverPhone(
    @Param('id') id: number,
    @Body() updateDriverPhoneDto: UpdateDriverPhoneDto,
    @Req() req: Request
  ) {
    return this.driversService.updateDriverPhoneNumber(updateDriverPhoneDto, id, req['user'])
  }

  @ApiOperation({ summary: 'Update driver birthday date' })
  @UsePipes(ValidationPipe)
  @Patch('update-driver-birthday-date/:id')
  updateDriverBirthday(
    @Body() updateDriverBirthDayDto: UpdateDriverBirthDayDto,
    @Req() req: Request
  ) {
    return this.driversService.updateDriverBirthday(updateDriverBirthDayDto,  req['user'])
  }

  @ApiOperation({ summary: 'Get driver by id' })
  @Get('driver-by-id')
  async getDriver(@Query('id') id: number, @Query('userId') userId: number) {
    return this.driversService.getDriverById(id, userId);
  }

  @ApiOperation({ summary: 'Get driver by id' })
  @Get('driver-by-phone')
  async getDriverByPhone(@Query('phone') phone: number) {
    return this.driversService.getDriverByPhone(phone);
  }

  @ApiOperation({ summary: 'Get all drivers' })
  @Get('all-drivers') 
  async getDrivers(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('driverId') driverId: number,
    @Query('firstName') firstName: string,
    @Query('phoneNumber') phoneNumber: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('isSubscribed') isSubscribed: boolean,
    @Query('status') status: string,
    @Query('userState') state: string,
    @Query('isVerified') isVerified: string,
    @Query('createdAtFrom') createdAtFrom: string,
    @Query('createdAtTo') createdAtTo: string,
    @Query('lastLoginFrom') lastLoginFrom: string,
    @Query('lastLoginTo') lastLoginTo: string
  ) {
    return this.driversService.getAllDrivers(pageSize, pageIndex, sortBy, sortType, driverId, firstName, phoneNumber, transportKindId, transportTypeId, isSubscribed, status, state, isVerified,  createdAtFrom, createdAtTo, lastLoginFrom, lastLoginTo)
  }

  @ApiOperation({ summary: 'Get all merchant drivers' })
  @Get('merchant-drivers')
  async getMerchantDeletedDrivers(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('merchantId') merchantId: number,
    @Query('userState') state: string,
  ) {
    return this.driversService.getMerchantDrivers(pageSize, pageIndex, sortBy, sortType, merchantId, state);
  }

  @ApiOperation({ summary: 'Get drivers by agent id' })
  @Get('agent-drivers')
  async getDriverByAgent(
    @Query('agentId') agentId: number,
    @Query('driverId') driverId: number,
    @Query('firstName') firstName: string,
    @Query('createdAtFrom') createdAtFrom: string,
    @Query('createdAtTo') createdAtTo: string,
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('userState') state: string
  ) {
    return this.driversService.getDriverByAgentId(pageSize, pageIndex, sortBy, sortType, state, agentId, driverId, firstName, createdAtFrom, createdAtTo);
  }

  @ApiOperation({ summary: 'Delete driver' })
  @Delete()
  async deleteDriver(@Query('id') id: number, @Req() req: Request) {
    return this.driversService.deleteDriver(id, req['user']);
  }

  @ApiOperation({ summary: 'Block driver' })
  @Patch('block-driver')
  async blockDriver(@Query('id') id: number, @Body('blockReason') blockReason: string, @Req() req: Request) {
    return this.driversService.blockDriver(id, blockReason, req['user']);
  }

  @ApiOperation({ summary: 'Unblock driver' })
  @Patch('unblock-driver')
  async activateDriver(@Query('id') id: number, @Req() req: Request) {
    return this.driversService.activateDriver(id, req['user']);
  }

  @ApiOperation({ summary: 'Admin append driver to agent' })
  @Post('append-driver-to-agent')
  async appendToAgent(@Body('driverId') driverId: number, @Body('agentId') agentId: number, @Req() req: Request) {
    return this.driversService.appendDriverToAgent(driverId, agentId, req['user']?.id)
  }

  @ApiOperation({ summary: 'Append drivers to tms' })
  @Post('append-drivers-tms')
  @UsePipes(ValidationPipe)
  async appendDriver(@Body() appendDriverMerchantDto: AppendDriversToTmsDto, @Req() req: Request) {
    return this.driversService.appendDriverToMerchant(appendDriverMerchantDto, req['user']);
  }

}
