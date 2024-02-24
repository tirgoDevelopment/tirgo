import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../../../libs/shared-modules/src/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import entities, { AuthModule, CargoLoadMethod, CargoPackage, CargoStatus, CargoType, ClientMerchant, Currency, Order, Staff, TransportKind, TransportType, User } from '.';
import { UsersService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './clients/clients.module';
import { DriversModule } from './drivers/drivers.module';
import { StaffsModule } from './staffs/staffs.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User, 
      Staff,
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'postgres',
      username: 'postgres',
      entities: entities,
      database: 'tirgo', 
      synchronize: true,
    }),
    ClientsModule,
    DriversModule,
    StaffsModule
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    UsersService,
  ],
})
export class OrdersModule {}
