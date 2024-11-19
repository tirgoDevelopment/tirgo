import { Body, Controller, Get, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { AdminOrderDto, AppendOrderDto, OrderDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Staffs orders')
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  
  @ApiOperation({ summary: 'Get all orders' })
  @Get()
  async getAllMerchantOrders(
    @Query() query: any
  ) {
    return this.staffsService.getOrders(query);
  }

  // @ApiOperation({ summary: 'Get order by id' })
  // @Get('order-by-id')
  // async getOrderById(@Query('orderId') id: number) {
  //   return this.staffsService.getOrderById(id)
  // }

  @ApiOperation({ summary: 'Staff create order for client' })
  @UsePipes(ValidationPipe)
  @Post()
  async createOrder(@Body() dto: AdminOrderDto, @Req() req: Request) {
    return this.staffsService.createOrder(dto, req['user']);
  }

  // @ApiOperation({ summary: 'Staff cancel order' })
  // @Post('cancel-order')
  // async cancelOrder(@Body('id') id: number, @Req() req: Request) {
  //   return this.staffsService.cancelOrder(id, req['user']);
  // }

  // @ApiOperation({ summary: 'Staff update order' })
  // @Put('update-order')
  // async updateOrder(@Body() updateOrderDto: OrderDto) {
  //   return this.staffsService.updateOrder(updateOrderDto);
  // }

  // @ApiOperation({ summary: 'Staff append order to driver' })
  // @Post('append-order')
  // async appendOrder(@Body() appendOrderDto: AppendOrderDto, @Req() req: Request) {
  //   return this.staffsService.appendOrderoDriver(appendOrderDto, req['user']);
  // }
}
