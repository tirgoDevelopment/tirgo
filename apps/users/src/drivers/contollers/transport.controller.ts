import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Put } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TransportsService } from '../services/transport.service';
import { DriverTransportDto } from '../..';
import { DriverTransportVerificationDto } from '@app/shared-modules/entites/driver/dtos/driver-transport.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Drivers transport')
@Controller('driver')
export class DriverTransportsController {
    constructor(
        private driverTransportsService: TransportsService
    ) { }

    @ApiOperation({ summary: 'Create driver transport' })
    @Post('add-transport')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'techPassportFrontFilePath', maxCount: 1}, 
        { name: 'techPassportBackFilePath', maxCount: 1}, 
        { name: 'transportFrontFilePath', maxCount: 1}, 
        { name: 'transportBackFilePath', maxCount: 1}, 
        { name: 'transportSideFilePath', maxCount: 1}, 
        { name: 'goodsTransportationLicenseCardFilePath', maxCount: 1}, 
        { name: 'driverLicenseFilePath', maxCount: 1}, 
        { name: 'passportFilePath', maxCount: 1},
    ]))
    async createDriver(
        @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[], 
            goodsTransportationLicenseCardFilePath?: any[], transportFilePath?: any[], techPassportBackFilePath?: any[], techPassportFrontFilePath?: any[]},
        @Body() data: DriverTransportDto,
    ) {
        return this.driverTransportsService.addDriverTransport(files, data)
    }

    @ApiOperation({ summary: 'Verify driver transport' })
    @Post('transport-verification')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
       { name: 'techPassportFrontFilePath', maxCount: 1}, 
       { name: 'techPassportBackFilePath', maxCount: 1}, 
       { name: 'transportFrontFilePath', maxCount: 1}, 
       { name: 'transportBackFilePath', maxCount: 1}, 
       { name: 'transportSideFilePath', maxCount: 1}, 
       { name: 'goodsTransportationLicenseCardFilePath', maxCount: 1}, 
       { name: 'driverLicenseFilePath', maxCount: 1}, 
       { name: 'passportFilePath', maxCount: 1},
    ]))
    async driverToVerification(
        @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[], 
            goodsTransportationLicenseCardFilePath?: any[], transportFilePath?: any[], techPassportBackFilePath?: any[], techPassportFrontFilePath?: any[]},
        @Body() data: DriverTransportVerificationDto,
    ) {
        return this.driverTransportsService.addDriverTransportToVerification(files, data)
    }

    @ApiOperation({ summary: 'Update driver transport' })
    @Put('update-transport')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'techPassportFrontFilePath', maxCount: 1}, 
        { name: 'techPassportBackFilePath', maxCount: 1}, 
        { name: 'transportFrontFilePath', maxCount: 1}, 
        { name: 'transportBackFilePath', maxCount: 1}, 
        { name: 'transportSideFilePath', maxCount: 1}, 
        { name: 'goodsTransportationLicenseCardFilePath', maxCount: 1}, 
        { name: 'driverLicenseFilePath', maxCount: 1}, 
        { name: 'passportFilePath', maxCount: 1},
    ]))
    async updateDriver(
        @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[], 
            goodsTransportationLicenseCardFilePath?: any[], transportFilePath?: any[], techPassportBackFilePath?: any[], techPassportFrontFilePath?: any[]},
        @Body() data: any,
    ) {
        return this.driverTransportsService.updateDriverTransport(files, data)
    }

    @ApiOperation({ summary: 'Get driver transport by driver id' })
    @Get('get-driver-transport')
    async getDriverTransprots(@Query('driverId') driverId: number, @Query('transportId') transportId: number) {
        return this.driverTransportsService.getTransportByDriverId(driverId, transportId);
    }

}
