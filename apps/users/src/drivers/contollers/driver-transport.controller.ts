import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Put, Patch, Param, Delete, Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TransportsService } from '../services/driver-transport.service';
import { DriverTransportDto } from '../..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Drivers transport')
@Controller('drivers/:driverId/transports')
export class DriverTransportsController {
    constructor(
        private driverTransportsService: TransportsService
    ) { }

    @ApiOperation({ summary: 'Create driver transport' })
    @Post()
    @UsePipes(ValidationPipe)
    async createDriver(
        @Param('driverId') driverId: number,
        @Body() data: DriverTransportDto,
    ) {
        return this.driverTransportsService.addDriverTransport(driverId, data)
    }

    // @ApiOperation({ summary: 'Verify driver transport' })
    // @Post('transport-verification')
    // @UsePipes(ValidationPipe)
    // @UseInterceptors(FileFieldsInterceptor([
    //    { name: 'techPassportFrontFilePath', maxCount: 1}, 
    //    { name: 'techPassportBackFilePath', maxCount: 1}, 
    //    { name: 'transportFrontFilePath', maxCount: 1}, 
    //    { name: 'transportBackFilePath', maxCount: 1}, 
    //    { name: 'transportSideFilePath', maxCount: 1}, 
    //    { name: 'goodsTransportationLicenseCardFilePath', maxCount: 1}, 
    //    { name: 'driverLicenseFilePath', maxCount: 1}, 
    //    { name: 'passportFilePath', maxCount: 1},
    // ]))
    // async driverToVerification(
    //     @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[], 
    //         goodsTransportationLicenseCardFilePath?: any[], transportFilePath?: any[], techPassportBackFilePath?: any[], techPassportFrontFilePath?: any[]},
    //     @Body() data: DriverTransportVerificationDto,
    // ) {
    //     return this.driverTransportsService.addDriverTransportToVerification(files, data)
    // }

    @ApiOperation({ summary: 'Update driver transport' })
    @Put(':transportId')
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
        @Param('driverId') driverId: number,
        @Param('transportId') transportId: number,
        @Body() data: any,
    ) {
        return this.driverTransportsService.updateDriverTransport(transportId, driverId, files, data)
    }

    @ApiOperation({ summary: 'Remove driver transport' })
    @Delete(':transportId')
    @UsePipes(ValidationPipe)
    async removeDriverTransport(@Param('driverId') driverId: number, @Param('transportId') transportId: number, @Req() req: any) {
        return this.driverTransportsService.removeDriverTransport(driverId, transportId, req['user'])
    }

    @ApiOperation({ summary: 'Change driver transport status' })
    @Patch('active/:tramsportId')
    @UsePipes(ValidationPipe)
    async changeDriverTransportStatus(@Param('driverId') driverId: number, @Param('transportId') transportId: number) {
        return this.driverTransportsService.changeActiveDriverTransport(driverId, transportId);
    }

    @ApiOperation({ summary: 'Get driver transport by driver id' })
    @Get(':tramsportId')
    async getDriverTransprots(@Param('driverId') driverId: number, @Param('transportId') transportId: number) {
        return this.driverTransportsService.getTransportByDriverId(driverId, transportId);
    }

}
