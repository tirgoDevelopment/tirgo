import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {  AuthModule, AwsService, CustomJwtService, DatabaseModule, Role, SmsService, Staff, SundryService } from '.';
import { ClientsService } from './clients/client.service';
import { DriversService } from './drivers/services/driver.service';
import { StaffsService } from './staffs/staffs.service';
import { ClientMerchantController } from './client-merchant/controllers/client-merchant.controller';
import { ClientMerchantModule } from './client-merchant/client-merchant.module';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './services/login.service';
import { ClientsModule } from './clients/clients.module';
import { DriverMerchantModule } from './driver-merchant/driver-merchant.module';
import { StaffsModule } from './staffs/staffs.module';
import { DriversModule } from './drivers/drivers.module';
import { AgentsModule } from './agents/agents.module';
import { RabbitMQSenderService } from './services/rabbitmq-sender.service';
import { RabbitMQConsumerService } from './services/rabbitmq-consumer.service';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'tirgO_jWt_secre1_k3y', // Replace with your actual secret key
      signOptions: { expiresIn: '1h' }, // Optional: Set expiration time
    }),
    ClientMerchantModule,
    DriverMerchantModule,
    ClientsModule,
    DriversModule,
    StaffsModule,
    AgentsModule,
    AuthModule,
    SseModule
  ],
  controllers: [
    AuthController,
    ClientMerchantController
  ],
  providers: [
    AuthService,
    ClientsService,
    DriversService,
    StaffsService,
    AwsService,
    CustomJwtService,
    SundryService,
    LoginService,
    SmsService,
    RabbitMQSenderService,
    RabbitMQConsumerService
  ],
})
export class UsersModule {}
