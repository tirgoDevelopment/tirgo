import { Body, Controller, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Get, Query, Put, Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriverDto, DriverTransportDto } from '../..';
import { AgentDriversService } from '../services/agent-driver.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Agents')
@Controller('agents')
export class AgentDriversController {
    constructor(
        private agentDriversService: AgentDriversService
    ) { }

    @ApiOperation({ summary: 'Create agent driver' })
    @Post('add-driver') 
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'driverLicense', maxCount: 1 },
        { name: 'passport', maxCount: 1 }
    ]))
    async createDriver(
        @UploadedFiles() files: { passport?: any[], driverLicense?: any[] }, 
        @Body() data: DriverDto,
        @Req() req: Request
    ) {
        return this.agentDriversService.createDriver(files, data, req['user'])
    }

    @ApiOperation({ summary: 'Agent add subscription to driver' })
    @Post('add-subscription-driver') 
    @UsePipes(ValidationPipe)
    async addSubscriptionToDriver(
        @Body('driverId') driverId: number,
        @Body('subscriptionId') subscriptionId: number,
        @Req() req: Request
    ) {
        return this.agentDriversService.addSubscriptionToDriver(driverId, subscriptionId, req['user'])
    }

    @ApiOperation({ summary: 'Update agent driver' })
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

    @ApiOperation({ summary: 'Get agent driver by id' })
    @Get('get-agent-drivers')
    async getDriverTransprots(@Query('driverId') driverId: number, @Query('transportId') transportId: number) {
    }

}
