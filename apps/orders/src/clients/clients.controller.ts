import { Body, Controller, Get, Param, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientRepliesOrderOffer, OrderDto, OrderOfferDto, OrderQueryDto, RejectOfferDto, ReplyDriverOrderOfferDto } from '..';
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

  @ApiOperation({ summary: 'Client create order' })
  @UsePipes(ValidationPipe)
  @Post(':id/clients/offers/:offerId/reply')
  async replyDriverOffer(@Param('orderId') orderId: number, @Param('offerId') offerId: number, @Body() dto: ReplyDriverOrderOfferDto, @Req() req: Request) {
    return this.clientsService.replyDriverOrderOffer(orderId, offerId, dto, req['user']);
  }

  // @ApiOperation({ summary: 'Client accept driver offer to order' })
  // @Post('accept-offer')
  // async acceptOffer(@Query('id') id: number, @Req() req: Request) {
  //   return this.clientsService.acceptDriverOffer(id);
  // }

  // @ApiOperation({ summary: 'Client offer price to driver to deliver order' })
  // @Post('offer-price')
  // async offerPrice(@Body() offerDto: OrderOfferDto, @Req() req: Request) {
  //   return this.clientsService.offerPriceToDriver(offerDto, req['user']?.id);
  // }

  // @ApiOperation({ summary: 'Client reject driver\'s offer' })
  // @Post('reject-offer')
  // async rejectOffer(@Param('id') id: number, @Body() rejectDto: RejectOfferDto, @Req() req: Request) {
  //   return this.clientsService.rejectDriverOffer(id, rejectDto, req['user']);
  // }

  // @ApiOperation({ summary: 'Client cancel driver\'s offer' })
  // @Post('cancel-offer')
  // async cancelOffer(@Param('id') id: number, @Body() cancelDto: CancelOfferDto, @Req() req: Request) {
  //   return this.clientsService.cancelDriverOffer(id, cancelDto, req['user']);
  // }
}
