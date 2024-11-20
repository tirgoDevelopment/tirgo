import { Module } from "@nestjs/common";
import { AwsService, Client, Order, SundryService, User, ClientPhoneNumber, CustomJwtService } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsController } from "./client.controller";
import { ClientsService } from "./client.service";
import { ClientsRepository } from "./repositories/client.repository";
import { JwtService } from "@nestjs/jwt";


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
        ClientsRepository,
        CustomJwtService,
        JwtService
      ],
      exports: [
        ClientsService,
        ClientsRepository,
        TypeOrmModule.forFeature([ Client, ClientPhoneNumber, User, Order ]),
      ]
})
export class ClientsModule {

}