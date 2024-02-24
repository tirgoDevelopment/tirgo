import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Put, Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverDto, DriverTransportDto } from '../..';
import { AgentDriversService } from '../services/agent-driver.service';

@Controller('agents')
export class AgentDriversController {
    constructor(
        private agentDriversService: AgentDriversService
    ) { }

    @Post('add-driver') 
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'driverLicenseFilePath', maxCount: 1 },
        { name: 'passportFilePath', maxCount: 1 }
    ]))
    async createDriver(
        @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[] }, 
        @Body() data: DriverDto,
        @Req() req: Request
    ) {
        return this.agentDriversService.createDriver(files, data, req['user'])
    }

    @Post('add-subscription-driver') 
    @UsePipes(ValidationPipe)
    async addSubscriptionToDriver(
        @Body('driverId') driverId: number,
        @Body('subscriptionId') subscriptionId: number,
        @Req() req: Request
    ) {
        return this.agentDriversService.addSubscriptionToDriver(driverId, subscriptionId, req['user'])
    }

    @Put('update-driver')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'driverLicenseFilePath', maxCount: 1 },
        { name: 'passportFilePath', maxCount: 1 }
    ]))
    async updateDriver(
        @UploadedFiles() files: { passportFilePath?: any[], driverLicenseFilePath?: any[] },
        @Body() data: any,
    ) {
    }

    @Get('get-agent-drivers')
    async getDriverTransprots(@Query('driverId') driverId: number, @Query('transportId') transportId: number) {
    }

}
