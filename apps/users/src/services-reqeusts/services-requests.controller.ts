import { Body, Controller, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ServicesRequestsService } from './services-requests.service';

@Controller('services-requests')
export class ServicesRequestsController {

  constructor(
    private servicesRequestsService: ServicesRequestsService
  ) { }

  @ApiOperation({ summary: 'Driver create service request' })
  @Post()
  @UsePipes(ValidationPipe)
  async registerDriver(
    @Body() driverData: any,
    @Req() req: Request
  ) {

  }

}
