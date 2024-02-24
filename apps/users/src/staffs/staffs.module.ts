import { Module } from "@nestjs/common";
import { AwsService, Role, Staff, SundryService, User } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StaffsController } from "./staffs.controller";
import { StaffsService } from "./staffs.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Staff, User, Role ]),
      ],
      controllers: [
        StaffsController
      ],
      providers: [
        SundryService,
        AwsService,
        StaffsService
      ],
      exports: [
        TypeOrmModule.forFeature([ Staff, User, Role ]),
      ]
})
export class StaffsModule {

}