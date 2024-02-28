import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { OrderOfferDto } from '..';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  
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

  @Get('order-by-id')
  async getOrderById(@Query('orderId') id: number) {
    return this.driversService.getOrderById(id)
  }

  @Post('offer-price')
  async offerPrice(@Body() offerPriceDto: OrderOfferDto, @Req() req: Request) {
    return this.driversService.offerPriceToOrder(offerPriceDto, req['user']?.id)
  }

  
  @Post('accept-offer')
  async acceptOffer(@Query('id') id: number, @Req() req: Request) {
    return this.driversService.acceptClientOffer(id);
  }

  @Get('offers')
  async getOffers(@Query('orderId') id: number) {
    return this.driversService.getDriverOffers()
  }

  // @Post('cancel-order')
  // async cancelOrder(@Query('id') id: number) {
  //   return this.driversService.cancelOrder(id);
  // }
}
