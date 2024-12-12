import { Module } from "@nestjs/common";
import { DriverMerchantController } from "./controllers/driver-merchant.controller";
import { AwsService, Config, Driver, DriverBankAccount, DriverMerchant, DriverMerchantUser, MailService, Role, SmsService, SundryService, TmsReqestToDriver, Transaction, User } from "..";
import { DriverMerchantsService } from "./services/driver-merchant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DriverMerchantUserController } from "./controllers/client-merchant-user.controller";
import { DriverMerchantUsersService } from "./services/driver-merchant-user.service";
import { SseModule } from "../sse/sse.module";


@Module({
    imports: [
      SseModule,
        TypeOrmModule.forFeature([ DriverMerchant, TmsReqestToDriver, DriverMerchantUser, User, DriverBankAccount, Role, Driver, Transaction, Config ]),
      ],
      controllers: [
        DriverMerchantController,
        DriverMerchantUserController
      ],
      providers: [
        SundryService,
        AwsService,
        DriverMerchantsService,
        DriverMerchantUsersService,
        SundryService,
        SmsService,
        MailService
      ],
      exports: [
        TypeOrmModule.forFeature([ DriverMerchant, TmsReqestToDriver, DriverMerchantUser, User, DriverBankAccount, Role, Driver, Transaction ]),
        DriverMerchantsService
      ]
})
export class DriverMerchantModule {

}