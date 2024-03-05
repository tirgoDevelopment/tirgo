import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Delete, Query, Patch, Put, Req, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverDto } from '../..';
import { DriversService } from '../services/driver.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(
    private driversService: DriversService
  ) { }

  @ApiOperation({ summary: 'Create driver' })
  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
    { name: 'driverLicense', maxCount: 1 },
  ]))
  async createDriver(
    @UploadedFiles() files: { passport?: any[], driverLicense?: any[] },
    @Body() driverData: DriverDto,
    @Req() req: Request
  ) {
    return this.driversService.createDriver(driverData, req['user'], files)
  }

  @ApiOperation({ summary: 'Update driver' })
  @Put()
  updateDriver(@Body() updateDriverDto: DriverDto) {
    return this.driversService.updateDriver(updateDriverDto)
  }

  @ApiOperation({ summary: 'Get driver by id' })
  @Get('driver-by')
  async getDriver(@Query('id') id: number, @Query('userId') userId: number) {
    return this.driversService.getDriverById(id, userId);
  }

  @ApiOperation({ summary: 'Get driver by agent id' })
  @Get('by-agent')
  async getDriverByAgent(@Query('agentId') id: number) {
    return this.driversService.getDriverByAgentId(id);
  }

  @ApiOperation({ summary: 'Get all drivers' })
  @Get('all') 
  async getDrivers(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
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
    return this.driversService.getAllDrivers(pageSize, pageIndex, sortBy, sortType, driverId, firstName, phoneNumber, transportKindId, isSubscribed, status, isVerified,  createdFrom, createdAtTo, lastLoginFrom, lastLoginTo)
  }

  @ApiOperation({ summary: 'Get all active drivers' })
  @Get('active')
  async getAllActiveDriver(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driversService.getAllActiveDrivers(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Get all non-active drivers' })
  @Get('non-active')
  async getAllNonActiveDriver(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driversService.getAllNonActiveDrivers(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Get all deleted drivers' })
  @Get('deleted')
  async getAllDeletedDriver(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
  ) {
    return this.driversService.getAllDeletedDrivers(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Delete driver' })
  @Delete()
  async deleteDriver(@Query('id') id: number) {
    return this.driversService.deleteDriver(id);
  }

  @ApiOperation({ summary: 'Block driver' })
  @Patch('block')
  async blockDriver(@Query('id') id: number, @Body('blockReason') blockReason: string) {
    return this.driversService.blockDriver(id, blockReason);
  }

  @ApiOperation({ summary: 'Activate driver' })
  @Patch('activate')
  async activateDriver(@Query('id') id: number) {
    return this.driversService.activateDriver(id);
  }

  @ApiOperation({ summary: 'Admin append driver to agent' })
  @Post('append-to-agent')
  async appendToAgent(@Body('driverId') driverId: number, @Body('agentId') agentId: number, @Req() req: Request) {
    return this.driversService.appendDriverToAgent(driverId, agentId, req['user']?.id)
  }

}
