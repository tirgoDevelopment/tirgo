import { Body, Controller, Get, Post, Put, Query, Req } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { OrderDto } from '..';

@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  
  @Get('all-orders')
  async getAllMerchantOrders(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('orderId') orderId: number,
    @Query('statusId') statusId: string,
    @Query('loadingLocation') loadingLocation: string,
    @Query('deliveryLocation') deliveryLocation: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('createdBy') userId: number,
    @Query('createdAt') createdAt: string,
    @Query('sendDate') sendDate: string,
    @Query('merchantOrder') merchantOrder: boolean
  ) {
    return this.staffsService.getOrders(pageIndex, pageSize, userId, orderId, statusId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate, merchantOrder);
  }

  @Get('order-by-id')
  async getOrderById(@Query('orderId') id: number) {
    return this.staffsService.getOrderById(id)
  }

  @Post()
  async createOrder(@Body() createOrderDto: OrderDto, @Req() req: Request) {
    return this.staffsService.createOrder(createOrderDto, req['user']);
  }

  @Post('cancel-order')
  async cancelOrder(@Query('id') id: number, @Req() req: Request) {
    return this.staffsService.cancelOrder(id, req['user']);
  }

  @Put('update-order')
  async updateOrder(@Body() updateOrderDto: OrderDto) {
    return this.staffsService.updateOrder(updateOrderDto);
  }
}
