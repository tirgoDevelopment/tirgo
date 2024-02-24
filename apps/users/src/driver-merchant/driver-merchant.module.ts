import { Module } from "@nestjs/common";
import { DriverMerchantController } from "./driver-merchant.controller";
import { AwsService, DriverBankAccount, DriverMerchant, DriverMerchantUser, Role, SundryService, User } from "..";
import { DriverMerchantsService } from "./driver-merchant.service";
import { TypeOrmModule } from "@nestjs/typeorm";


@Module({
    imports: [
        TypeOrmModule.forFeature([ DriverMerchant, DriverMerchantUser, User, DriverBankAccount, Role ]),
      ],
      controllers: [
        DriverMerchantController
      ],
      providers: [
        SundryService,
        AwsService,
        DriverMerchantsService
      ],
      exports: [
        TypeOrmModule.forFeature([ DriverMerchant, DriverMerchantUser, User, DriverBankAccount, Role ]),
        DriverMerchantsService
      ]
})
export class DriverMerchantModule {

}