import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { OrderOfferDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Drivers orders')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  
  @ApiOperation({ summary: 'Get all orders' })
  @Get('all-orders')
  async getAllMerchantOrders(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('orderId') orderId: number,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('statusId') statusId: string,
    @Query('loadingLocation') loadingLocation: string,
    @Query('deliveryLocation') deliveryLocation: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('createdAt') createdAt: string,
    @Query('sendDate') sendDate: string
  ) {
    return this.driversService.getOrders(sortBy, sortType, pageIndex, pageSize, orderId, statusId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate);
  }

  @ApiOperation({ summary: 'Get all waiting orders' })
  @Get('all-waiting-orders')
  async getAllWaitginOrders(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('orderId') orderId: number,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('loadingLocation') loadingLocation: string,
    @Query('deliveryLocation') deliveryLocation: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('createdAt') createdAt: string,
    @Query('sendDate') sendDate: string
  ) {
    return this.driversService.getWaitingOrders(sortBy, sortType, pageIndex, pageSize, orderId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate);
  }

  @ApiOperation({ summary: 'Get order by order id' })
  @Get('active-order-by')
  async getActiveOrder(@Query('driverId') id: number) {
    return this.driversService.getActiveOrderByDriverId(id)
  }

  @ApiOperation({ summary: 'Get order by order id' })
  @Get('merchant-active-orders')
  async getMerchantOrders(@Query('merchantId') id: number) {
    return this.driversService.getMerchantActiveOrders(id)
  }

  @ApiOperation({ summary: 'Get order by order id' })
  @Get('archive-orders-by')
  async getArchiveOrders(@Query('driverId') id: number) {
    return this.driversService.getArchiveOrdersByDriverId(id)
  }

  @ApiOperation({ summary: 'Get order by order id' })
  @Get('order-by-id')
  async getOrderById(@Query('orderId') id: number) {
    return this.driversService.getOrderById(id)
  }

  @ApiOperation({ summary: 'Driver offer price for order' })
  @Post('offer-price')
  async offerPrice(@Body() offerPriceDto: OrderOfferDto, @Req() req: Request) {
    return this.driversService.offerPriceToOrder(offerPriceDto, req['user']?.id)
  }

  @ApiOperation({ summary: 'Driver accept client\'s offer' })
  @Post('accept-offer')
  async acceptOffer(@Query('id') id: number, @Req() req: Request) {
    return this.driversService.acceptClientOffer(id);
  }

  @ApiOperation({ summary: 'Driver get offers by order id' })
  @Get('offers')
  async getOffers(@Query('orderId') id: number) {
    return this.driversService.getDriverOffers()
  }

  // @Post('cancel-order')
  // async cancelOrder(@Query('id') id: number) {
  //   return this.driversService.cancelOrder(id);
  // }
}
