import { Module } from "@nestjs/common";
import { AwsService, Client, Order, SundryService, User, ClientPhoneNumber } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsController } from "./client.controller";
import { ClientsService } from "./client.service";
import { ClientsRepository } from "./repositories/client.repository";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Client, ClientPhoneNumber, User, Order ]),
      ],
      controllers: [
        ClientsController
      ],
      providers: [
        SundryService,
        AwsService,
        ClientsService,
        ClientsRepository
      ],
      exports: [
        ClientsService,
        ClientsRepository,
        TypeOrmModule.forFeature([ Client, ClientPhoneNumber, User, Order ]),
      ]
})
export class ClientsModule {

}