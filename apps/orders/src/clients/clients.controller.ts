import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { OrderDto, OrderOfferDto } from '..';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createOrder(@Body() createOrderDto: OrderDto, @Req() req: Request) {
    return this.clientsService.createOrder(createOrderDto, req['user']);
  }
  
  @Get('all-orders')
  async getAllMerchantOrders(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('userId') userId: number,
    @Query('clientId') clientId: number,
    @Query('orderId') orderId: number,
    @Query('statusId') statusId: string,
    @Query('loadingLocation') loadingLocation: string,
    @Query('deliveryLocation') deliveryLocation: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('createdAt') createdAt: string,
    @Query('sendDate') sendDate: string
  ) {
    return this.clientsService.getClientOrderByUserId(pageIndex, pageSize, userId, orderId, statusId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate);
  }

  @Get('order-by-id')
  async getOrderById(@Query('orderId') id: number) {
    return this.clientsService.getOrderById(id)
  }

  @Post('accept-offer')
  async acceptOffer(@Query('id') id: number, @Req() req: Request) {
    return this.clientsService.acceptDriverOffer(id);
  }

  @Post('offer-price')
  async offerPrice(@Body() offerDto: OrderOfferDto, @Req() req: Request) {
    return this.clientsService.offerPriceToDriver(offerDto, req['user']?.id);
  }
}
