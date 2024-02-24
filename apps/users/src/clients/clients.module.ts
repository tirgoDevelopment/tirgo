import { Module } from "@nestjs/common";
import { AwsService, Client, SundryService, User } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsController } from "./client.controller";
import { ClientsService } from "./client.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Client, User ]),
      ],
      controllers: [
        ClientsController
      ],
      providers: [
        SundryService,
        AwsService,
        ClientsService
      ],
      exports: [
        ClientsService,
        TypeOrmModule.forFeature([ Client, User ]),
      ]
})
export class ClientsModule {

}