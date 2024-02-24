import { Module } from '@nestjs/common';
import { CargoLoadMethod, CargoPackage, CargoStatus, CargoType, Client, ClientMerchant, Currency, CustomJwtService, Driver, Order, OrderOffer, OrderOfferReply, Staff, TransportKind, TransportType, User } from '..';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Client,
      Driver,
      Currency,
      CargoType,
      CargoStatus,
      CargoPackage,
      TransportKind, 
      TransportType,
      ClientMerchant,
      CargoLoadMethod,
      OrderOffer,
      OrderOfferReply
    ]),
  ],
  controllers: [
    DriversController
  ],
  providers: [
    DriversService,
    RabbitMQSenderService
  ],
})
export class DriversModule { }
