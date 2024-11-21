import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { OrderOfferDto, OrderQueryDto, RejectOfferDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CancelOfferDto } from '@app/shared-modules/entites/orders/dtos/cancel-offer.dto';

@ApiTags('Drivers orders')
@Controller()
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  
  @ApiOperation({ summary: 'Get all orders' })
  @Get('drivers')
  async getAllMerchantOrders(
    @Query() query: OrderQueryDto,
    @Req() req: Request
  ) {
    return this.driversService.getOrders(req['user'], query);
  }

  @ApiOperation({ summary: 'Get order by order id' })
  @Get(':id/drivers')
  async getActiveOrder(@Param('id') id: number) {
    return this.driversService.getOrderById(id)
  }

  @ApiOperation({ summary: 'Driver offer price for order' })
  @Post(':id/drivers/offers')
  async offerPrice(@Param('id') id: number, @Body() dto: OrderOfferDto, @Req() req: Request) {
    return this.driversService.offerPriceToOrder(id, dto, req['user'])
  }

  @ApiOperation({ summary: 'Driver cancel offer for order' })
  @Post(':id/drivers/offers/:offerId/cancel')
  async cancelOffer(@Param('id') id: number, @Param('offerId') offerId: number, @Req() req: Request) {
    // return this.driversService.cancelOfferPriceToOrder(id, offerId, req['user'])
  }

  // @ApiOperation({ summary: 'Driver accept client\'s offer' })
  // @Post('accept-offer')
  // async acceptOffer(@Query('id') id: number, @Req() req: Request) {
  //   return this.driversService.acceptClientOffer(id);
  // }

  // @ApiOperation({ summary: 'Driver reject client\'s offer' })
  // @Post('reject-offer')
  // async rejectOffer(@Param('id') id: number, @Body() rejectDto: RejectOfferDto, @Req() req: Request) {
  //   return this.driversService.rejectClientOffer(id, rejectDto, req['user']);
  // }

  // @ApiOperation({ summary: 'Driver cancel client\'s offer' })
  // @Post('cancel-offer')
  // async cancelOffer(@Param('id') id: number, @Body() cancelDto: CancelOfferDto, @Req() req: Request) {
  //   return this.driversService.cancelClientOffer(id, cancelDto, req['user']);
  // }

  // @ApiOperation({ summary: 'Driver get offers by order id' })
  // @Get('offers')
  // async getOffers(@Query('orderId') id: number) {
  //   return this.driversService.getDriverOffers()
  // }

  // @Post('cancel-order')
  // async cancelOrder(@Query('id') id: number) {
  //   return this.driversService.cancelOrder(id);
  // }
}
