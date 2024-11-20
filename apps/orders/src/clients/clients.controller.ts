import { Body, Controller, Get, Param, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { OrderDto, OrderOfferDto, OrderQueryDto, RejectOfferDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CancelOfferDto } from '@app/shared-modules/entites/orders/dtos/cancel-offer.dto';

@ApiTags('Clients orders')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Client create order' })
  @UsePipes(ValidationPipe)
  @Post()
  async createOrder(@Body() createOrderDto: OrderDto, @Req() req: Request) {
    return this.clientsService.createOrder(createOrderDto, req['user']);
  }

  @ApiOperation({ summary: 'Client get all orders' })
  @UsePipes(ValidationPipe)
  @Get()
  async getAllMerchantOrders(
    @Req() req: Request,
    @Query() query: OrderQueryDto
  ) {
    return this.clientsService.getClientOrderByUserId(query, req['user']);
  }

  // @ApiOperation({ summary: 'Get order by orderId' })
  // @Get('order-by-id')
  // async getOrderById(@Query('orderId') id: number) {
  //   return this.clientsService.getOrderById(id)
  // }

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
