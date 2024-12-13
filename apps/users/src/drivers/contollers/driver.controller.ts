import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Delete, Query, Patch, Put, Req, Param, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AppendDriversToTmsDto, DriverDto, UpdateDriverDto, GetDriversDto } from '../..';
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
  @Post('register')
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
  @Post()
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

  @ApiOperation({ summary: 'Update driver profile' })
  @Patch(':id/profile')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 }
  ]))
  async updateDriverProfile(
    @UploadedFiles() files: { profile?: any[] },
    @Param('id') id: number,
    @Req() req: Request
  ) {
    return this.driversService.updateDrierProfile(files, id)
  }

  @ApiOperation({ summary: 'Add Driver Phone number' })
  @Post(':id/phone-number')
  @UsePipes(ValidationPipe)
  reateDriver(
    @Param('id') id: number,
    @Body() driverData: UpdateDriverPhoneDto,
    @Req() req: Request
  ) {
    return this.driversService.addPhoneNumber(driverData, id, req['user'])
  }

  @ApiOperation({ summary: 'Update driver' })
  @UsePipes(ValidationPipe)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'passport', maxCount: 1 },
    { name: 'driverLicense', maxCount: 1 },
  ]))
  updateDriver(
    @UploadedFiles() files: { passport?: any[], driverLicense?: any[] },
    @Body() updateDriverDto: UpdateDriverDto,
    @Param('id') id: number
    ) {
    return this.driversService.updateDriver(id, updateDriverDto, files)
  }

  @ApiOperation({ summary: 'Update driver phone' })
  @UsePipes(ValidationPipe)
  @Patch(':driverId/phone-number/:phoneNumberId')
  updateDriverPhone(
    @Param('driverId') driverId: number,
    @Param('phoneNumberId') phoneNumberId: number,
    @Body() updateDriverPhoneDto: UpdateDriverPhoneDto,
    @Req() req: Request
  ) {
    return this.driversService.updateDriverPhoneNumber(updateDriverPhoneDto, driverId, phoneNumberId, req['user'])
  }

  @ApiOperation({ summary: 'Update driver birthday date' })
  @UsePipes(ValidationPipe)
  @Patch(':id/birthday-date')
  updateDriverBirthday(@Param('id') id: number, @Body() updateDriverBirthDayDto: UpdateDriverBirthDayDto, @Req() req: Request) {
    console.log(req['user'])
    return this.driversService.updateDriverBirthday(updateDriverBirthDayDto, id,  req['user'])
  }

  @ApiOperation({ summary: 'Get driver by id' })
  @Get(':id')
  async getDriver(@Param('id') id: number) {
    return this.driversService.getDriverById(id);
  }

  @ApiOperation({ summary: 'Get driver by phone number' })
  @Get('phone-number/:phoneNumber/:code')
  async getDriverByPhone(@Param('phoneNumber') phoneNumber: string, @Param('code') code: string) {
    return this.driversService.getDriverByPhone(phoneNumber, code);
  }

  @ApiOperation({ summary: 'Get all drivers' })
  @Get() 
  async getDrivers(@Query() query: GetDriversDto, @Req() req: Request) {
    return this.driversService.getAllDrivers(query, req['user']);
  }

  @ApiOperation({ summary: 'Get all merchant drivers' })
  @Get('merchants/:merchantId')
  async getMerchantDeletedDrivers(@Param('merchantId') merchantId: number, @Query() query: GetDriversDto) {
    return this.driversService.getMerchantDrivers(merchantId, query);
  }

  @ApiOperation({ summary: 'Get drivers by agent id' })
  @Get('agents/:agentId')
  async getDriverByAgent(@Param() agentId: number, @Query() query: GetDriversDto) {
    return this.driversService.getAgentDrivers(agentId, query);
  }

  @ApiOperation({ summary: 'Delete driver' })
  @Delete(':id')
  async deleteDriver(@Param('id') id: number, @Req() req: Request) {
    return this.driversService.deleteDriver(id, req['user']);
  }

  @ApiOperation({ summary: 'Block driver' })
  @Patch(':id/block')
  async blockDriver(@Param('id') id: number, @Body('blockReason') blockReason: string, @Req() req: Request) {
    return this.driversService.blockDriver(id, blockReason, req['user']);
  }

  @ApiOperation({ summary: 'Unblock driver' })
  @Patch(':id/unblock')
  async activateDriver(@Param('id') id: number, @Req() req: Request) {
    return this.driversService.activateDriver(id, req['user']);
  }

  @ApiOperation({ summary: 'List of tms assign requests' })
  @Get('/tms-assign-requests/')
  async driverTmsAssignRequets(@Param('id') id: number, @Req() req: Request) {
    return this.driversService.driverAcceptTmsAssignRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Driver accept tms assign request' })
  @Patch('/tms-assign-requests/:id/accept')
  async driverAccepetTmsAssignRequets(@Param('id') id: number, @Req() req: Request) {
    return this.driversService.driverAcceptTmsAssignRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Driver reject tms assign request driver' })
  @Patch('tms-assign-requests/:id/reject')
  async driverRejectTmsAssignRequets(@Param('id') id: number, @Req() req: Request) {
    return this.driversService.driverRejectTmsAssignRequest(id, req['user']);
  }

  @ApiOperation({ summary: 'Admin assign driver to agent' })
  @Post(':driverId/agents/:agentId')
  async assignToAgent(@Param('driverId') driverId: number, @Param('agentId') agentId: number, @Req() req: Request) {
    return this.driversService.assignDriverToAgent(driverId, agentId, req['user']?.id)
  }

  @ApiOperation({ summary: 'Assign drivers to TMS' })
  @Post('tmses/:tmsId/assign')
  @UsePipes(ValidationPipe)
  async assignDriver(@Body() appendDriverMerchantDto: AppendDriversToTmsDto, @Param('tmsId') tmsId: number, @Req() req: Request) {
    return this.driversService.appendDriverToMerchant(appendDriverMerchantDto, tmsId, req['user']);
  }

  @ApiOperation({ summary: 'Unassign driver from TMS' })
  @Post('tmses/:tmsId/drivers/:driverId/unassign')
  @UsePipes(ValidationPipe)
  async unassignDriver(@Param('tmsId') tmsId: number, @Param('driverId') driverId: number, @Req() req: Request) {
    return this.driversService.unassignDriverFromMerchant(tmsId, driverId, req['user']);
  }

}
