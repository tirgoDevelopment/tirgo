import { Body, Controller, Get, Param, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CancelOfferDto, ClientRepliesOrderOffer, OrderDto, OrderOfferDto, OrderQueryDto, RejectOfferDto, ReplyDriverOrderOfferDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clients orders')
@Controller('')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Client create order' })
  @UsePipes(ValidationPipe)
  @Post('clients')
  async createOrder(@Body() dto: OrderDto, @Req() req: Request) {
    return this.clientsService.createOrder(dto, req['user']);
  }

  @ApiOperation({ summary: 'Client update order' })
  @UsePipes(ValidationPipe)
  @Put(':id/clients')
  async updateOrder(@Param('id') id: number, @Body() dto: OrderDto, @Req() req: Request) {
    return this.clientsService.updateOrder(id, dto, req['user']);
  }

  @ApiOperation({ summary: 'Client get all orders' })
  @UsePipes(ValidationPipe)
  @Get('clients')
  async getAllMerchantOrders(
    @Req() req: Request,
    @Query() query: OrderQueryDto
  ) {
    return this.clientsService.getClientsOrders(query, req['user']);
  }

  @ApiOperation({ summary: 'Get order by orderId' })
  @Get(':id/clients')
  async getOrderById(@Param('id') id: number, @Req() req: Request) {
    return this.clientsService.getOrderById(id, req['user']);
  }

  @ApiOperation({ summary: 'Get order by orderId' })
  @Get(':id/clients/offers/drivers')
  async getOfferedDrivers(@Param('id') id: number, @Req() req: Request) {
    return this.clientsService.getOfferedDrivers(id, req['user']);
  }

  @ApiOperation({ summary: 'Get order by orderId' })
  @Get(':id/clients/offers/drivers/:driverId')
  async getOffersByDriver(@Param('id') id: number, @Param('driverId') driverId: number, @Req() req: Request) {
    return this.clientsService.getOffersByDriver(id, driverId, req['user']);
  }

  @ApiOperation({ summary: 'Client reply driver\'s offer' })
  @UsePipes(ValidationPipe)
  @Post(':id/clients/offers/:offerId/reply')
  async replyDriverOffer(@Param('orderId') orderId: number, @Param('offerId') offerId: number, @Body() dto: ReplyDriverOrderOfferDto, @Req() req: Request) {
    return this.clientsService.replyDriverOrderOffer(orderId, offerId, dto, req['user']);
  }

  @ApiOperation({ summary: 'Client accept driver\'s offer' })
  @UsePipes(ValidationPipe)
  @Post(':id/clients/offers/:offerId/accept')
  async acceptDriverOffer(@Param('orderId') orderId: number, @Param('offerId') offerId: number, @Req() req: Request) {
    return this.clientsService.acceptDriverOrderOffer(orderId, offerId, req['user']);
  }

  @ApiOperation({ summary: 'Client reject driver\'s offer' })
  @Post(':id/clients/offers/:offerId/reject')
  async rejectOffer(@Param('id') id: number, @Param('offerId') offerId: number, @Body() rejectDto: RejectOfferDto, @Req() req: Request) {
    return this.clientsService.rejectDriverOffer(id, offerId, rejectDto, req['user']);
  }

  @ApiOperation({ summary: 'Client cancel driver\'s offer' })
  @Post(':id/clients/offers/:offerId/cancel')
  async cancelOffer(@Param('id') id: number, @Param('orderId') orderId: number, @Body() cancelDto: CancelOfferDto, @Req() req: Request) {
    return this.clientsService.cancelDriverOffer(id, orderId, cancelDto, req['user']);
  }
}
