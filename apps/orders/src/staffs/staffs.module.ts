import { Module } from '@nestjs/common';
import { CargoLoadMethod, CargoPackage, CargoStatus, CargoType, Client, ClientMerchant, Currency, CustomJwtService, LocationPlace, Order, Staff, TransportKind, TransportType, User } from '..';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';

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
      LocationPlace
    ]),
  ],
  controllers: [
    StaffsController
  ],
  providers: [
    StaffsService
  ],
})
export class StaffsModule { }
