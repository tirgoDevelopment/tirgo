import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from '../services/subscription.service';
import { SubscriptionDto } from '../..';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createSubscription(@Body() createSubscriptionDto: SubscriptionDto) {
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Post('payment')
  @UsePipes(ValidationPipe)
  async createSubscriptionPayment(@Body() createSubscriptionDto: SubscriptionDto) {
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateSubscription(@Body() updateSubscriptionDto: SubscriptionDto) {
    return this.subscriptionsService.updateSubscription(updateSubscriptionDto);
  }

  @Get()
  async getSubscription(@Query('id') id: number) {
    return this.subscriptionsService.getSubscriptionById(id);
  }

  @Get('all')
  async getAllSubscription() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Get('active')
  async getAllActiveSubscription() {
    return this.subscriptionsService.getAllActiveSubscriptions();
  }

  @Get('non-active')
  async getAllNonActiveSubscription() {
    return this.subscriptionsService.getAllNonActiveSubscriptions();
  }

  @Get('deleted')
  async getAllDeletedSubscription() {
    return this.subscriptionsService.getAllDeletedSubscriptions();
  }

  @Patch('delete')
  async deleteSubscription(@Query('id') id: number) {
    return this.subscriptionsService.deleteSubscription(id);
  }

  @Patch('block')
  async blockSubscription(@Query('id') id: number) {
    return this.subscriptionsService.blockSubscription(id);
  }

  @Patch('activate')
  async activateSubscription(@Query('id') id: number) {
    return this.subscriptionsService.activateSubscription(id);
  }
}