import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Delete, Query, Patch, Put, Req, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverDto } from '../..';
import { DriversService } from '../services/driver.service';

@Controller('drivers')
export class DriversController {
  constructor(
    private driversService: DriversService
  ) { }

  @Post('register')
  @UsePipes(ValidationPipe)
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'passport', maxCount: 1 },
  //   { name: 'techPassport', maxCount: 1 },
  //   { name: 'driverLicense', maxCount: 1 },
  // ]))
  async createDriver(
    // @UploadedFiles() files: { passport?: any[], driverLicense?: any[] },
    @Body() driverData: DriverDto,
  ) {
    // files.passport[0], files.driverLicense[0],
    return this.driversService.createDriver(driverData)
  }

  @Put()
  updateDriver(@Body() updateDriverDto: DriverDto) {
    return this.driversService.updateDriver(updateDriverDto)
  }

  @Get('driver-by')
  async getDriver(@Query('id') id: number, @Query('userId') userId: number) {
    return this.driversService.getDriverById(id, userId);
  }

  @Get('by-agent')
  async getDriverByAgent(@Query('agentId') id: number) {
    return this.driversService.getDriverByAgentId(id);
  }

  @Get('all') 
  async getDrivers(
    @Query('driverId') driverId: number,
    @Query('firstName') firstName: string,
    @Query('phoneNumber') phoneNumber: string,
    @Query('transportKindId') transportKindId: number,
    @Query('isSubscribed') isSubscribed: boolean,
    @Query('status') status: string,
    @Query('isVerified') isVerified: boolean,
    @Query('createdFrom') createdFrom: string,
    @Query('createdAtTo') createdAtTo: string,
    @Query('lastLoginFrom') lastLoginFrom: string,
    @Query('lastLoginTo') lastLoginTo: string
  ) {
    return this.driversService.getAllDrivers(driverId, firstName, phoneNumber, transportKindId, isSubscribed, status, isVerified,  createdFrom, createdAtTo, lastLoginFrom, lastLoginTo)
  }

  @Get('active')
  async getAllActiveDriver() {
    return this.driversService.getAllActiveDrivers();
  }

  @Get('non-active')
  async getAllNonActiveDriver() {
    return this.driversService.getAllNonActiveDrivers();
  }

  @Get('deleted')
  async getAllDeletedDriver() {
    return this.driversService.getAllDeletedDrivers();
  }

  @Delete()
  async deleteDriver(@Query('id') id: number) {
    return this.driversService.deleteDriver(id);
  }

  @Patch('block')
  async blockDriver(@Query('id') id: number, @Body('blockReason') blockReason: string) {
    return this.driversService.blockDriver(id, blockReason);
  }

  @Patch('activate')
  async activateDriver(@Query('id') id: number) {
    return this.driversService.activateDriver(id);
  }

  @Post('append-to-agent')
  async appendToAgent(@Body('driverId') driverId: number, @Body('agentId') agentId: number, @Req() req: Request) {
    return this.driversService.appendDriverToAgent(driverId, agentId, req['user']?.id)
  }

}
