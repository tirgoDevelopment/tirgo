import { Module } from '@nestjs/common';
import { CargoLoadMethod, CargoPackage, CargoStatus, CargoType, Client, ClientMerchant, ClientMerchantUser, Currency, CustomJwtService, Driver, LocationPlace, Order, DriverOrderOffers, Staff, TransportKind, TransportType, User, ClientRepliesOrderOffer } from '..';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Client,
      Currency,
      CargoType,
      CargoStatus,
      CargoPackage,
      TransportKind,
      TransportType,
      ClientMerchant,
      CargoLoadMethod,
      ClientMerchantUser,
      DriverOrderOffers,
      ClientRepliesOrderOffer,
      Driver,
      LocationPlace
    ]),
  ],
  controllers: [
    ClientsController
  ],
  providers: [
    ClientsService,
    RabbitMQSenderService
  ],
})
export class ClientsModule { }
