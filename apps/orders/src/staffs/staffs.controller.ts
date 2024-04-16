import { Body, Controller, Get, Post, Put, Query, Req } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { AppendOrderDto, OrderDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Staffs orders')
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  
  @ApiOperation({ summary: 'Get all orders' })
  @Get('all-orders')
  async getAllMerchantOrders(
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
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
    return this.staffsService.getOrders(sortBy, sortType, pageIndex, pageSize, userId, orderId, statusId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate, merchantOrder);
  }

  @ApiOperation({ summary: 'Get order by id' })
  @Get('order-by-id')
  async getOrderById(@Query('orderId') id: number) {
    return this.staffsService.getOrderById(id)
  }

  @ApiOperation({ summary: 'Staff create order for client' })
  @Post()
  async createOrder(@Body() createOrderDto: OrderDto, @Req() req: Request) {
    return this.staffsService.createOrder(createOrderDto, req['user']);
  }

  @ApiOperation({ summary: 'Staff cancel order' })
  @Post('cancel-order')
  async cancelOrder(@Body('id') id: number, @Req() req: Request) {
    return this.staffsService.cancelOrder(id, req['user']);
  }

  @ApiOperation({ summary: 'Staff update order' })
  @Put('update-order')
  async updateOrder(@Body() updateOrderDto: OrderDto) {
    return this.staffsService.updateOrder(updateOrderDto);
  }

  @ApiOperation({ summary: 'Staff append order to driver' })
  @Post('append-order')
  async appendOrder(@Body() appendOrderDto: AppendOrderDto, @Req() req: Request) {
    return this.staffsService.appendOrderoDriver(appendOrderDto, req['user']);
  }
}
