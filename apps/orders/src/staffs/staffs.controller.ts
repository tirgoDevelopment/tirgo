import { Body, Controller, Get, Param, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { AdminOrderDto, AdminOrderOfferDto, AssignOrderDto, OrderDto, OrderOfferDto, OrderQueryDto, RejectOfferDto } from '..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CancelOfferDto } from '@app/shared-modules/entites/orders/dtos/cancel-offer.dto';

@ApiTags('Staffs orders')
@Controller()
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  
  @ApiOperation({ summary: 'Get all orders' })
  @UsePipes(ValidationPipe)
  @Get('staffs')
  async getAllMerchantOrders(
    @Query() query: OrderQueryDto
  ) {
    return this.staffsService.getOrders(query);
  }

  @ApiOperation({ summary: 'Get order by id' })
  @Get(':id/staffs')
  async getOrderById(@Param('id') id: number) {
    return this.staffsService.getOrderById(id)
  }

  @ApiOperation({ summary: 'Staff create order for client' })
  @UsePipes(ValidationPipe)
  @Post('staffs')
  async createOrder(@Body() dto: AdminOrderDto, @Req() req: Request) {
    return this.staffsService.createOrder(dto, req['user']);
  }

  @ApiOperation({ summary: 'Staff cancel order' })
  @Post(':id/staffs/cancel')
  async cancelOrder(@Param('id') id: number, @Req() req: Request) {
    return this.staffsService.cancelOrder(id, req['user']);
  }

  @ApiOperation({ summary: 'Staff update order' })
  @UsePipes(ValidationPipe)
  @Put(':id/staffs')
  async updateOrder(@Body() updateOrderDto: AdminOrderDto, @Param('id') id: number) {
    return this.staffsService.updateOrder(id, updateOrderDto);
  }


  @ApiOperation({ summary: 'Admin offer driver price for order' })
  @UsePipes(ValidationPipe)
  @Post(':id/staffs/offers')
  async offerPrice(@Param('id') id: number, @Body() dto: AdminOrderOfferDto, @Req() req: Request) {
    return this.staffsService.offerPriceToOrder(id, dto, req['user'])
  }

  @ApiOperation({ summary: 'Admin cancel driver offer for order' })
  @UsePipes(ValidationPipe)
  @Post(':id/staffs/offers/:offerId/cancel')
  async cancelOffer(
    @Param('id') id: number, 
    @Param('offerId') offerId: number, 
    @Body() dto: CancelOfferDto,
    @Req() req: Request) {
    return this.staffsService.cancelOfferPriceToOrder(id, offerId, dto, req['user'])
  }

  @ApiOperation({ summary: 'Admin reject driver offer for order' })
  @UsePipes(ValidationPipe)
  @Post(':id/staffs/offers/:offerId/reject')
  async rejectOffer(
    @Param('id') id: number, 
    @Param('offerId') offerId: number, 
    @Body() dto: RejectOfferDto,
    @Req() req: Request) {
    return this.staffsService.rejectOfferPriceToOrder(id, offerId, dto, req['user'])
  }

  @ApiOperation({ summary: 'Staff append order to driver' })
  @Post(':id/staffs/assign')
  async assignOrder(
    @Param('id') id: number, 
    @Body() dto: AssignOrderDto, 
    @Req() req: Request) {
    return this.staffsService.assingOrderoDriver(id, dto, req['user']);
  }

  @ApiOperation({ summary: 'Staff append order to driver' })
  @Post(':id/staffs/offers/:offerId/accept')
  async acceptOrder(
    @Param('id') id: number, 
    @Param('offerId') offerId: number, 
    @Body() dto: AssignOrderDto, 
    @Req() req: Request) {
    return this.staffsService.acceptDriverOffer(id, offerId, dto, req['user']);
  }
}
