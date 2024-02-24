import { Module } from "@nestjs/common";
import { ClientMerchantController } from "./controllers/client-merchant.controller";
import { AwsService, ClientBankAccount, ClientMerchant, ClientMerchantUser, Config, Currency, MailService, Role, SmsService, SundryService, Transaction, User } from "..";
import { ClientMerchantsService } from "./services/client-merchant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientMerchantUsersService } from "./services/client-merchant-user.service";
import { ClientMerchantUserController } from "./controllers/client-merchant-user.controller";


@Module({
    imports: [
        TypeOrmModule.forFeature([ ClientMerchant, ClientMerchantUser, User, ClientBankAccount, Role, Config, Transaction, Currency ]),
      ],
      controllers: [
        ClientMerchantController,
        ClientMerchantUserController
      ],
      providers: [
        SundryService,
        AwsService,
        ClientMerchantsService,
        ClientMerchantUsersService,
        SmsService,
        MailService
      ],
      exports: [
        TypeOrmModule.forFeature([ ClientMerchant, ClientMerchantUser, User, ClientBankAccount, Role, Config, Transaction, Currency ]),
        ClientMerchantsService,
        ClientMerchantUsersService
      ]
})
export class ClientMerchantModule {

}