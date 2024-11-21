import { Module } from '@nestjs/common';
import { CargoLoadMethod, CargoPackage, CargoStatus, CargoType, Client, ClientMerchant, Currency, CustomJwtService, Driver, LocationPlace, Order, DriverOrderOffers, Staff, TransportKind, TransportType, User } from '..';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
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
      DriverOrderOffers,
      CargoStatus,
      CargoPackage,
      TransportKind,
      TransportType,
      ClientMerchant,
      CargoLoadMethod,
      LocationPlace
    ]),
  ],
  controllers: [
    StaffsController
  ],
  providers: [
    StaffsService,
    RabbitMQSenderService
  ],
})
export class StaffsModule { }
