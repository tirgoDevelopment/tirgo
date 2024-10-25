import { Module } from "@nestjs/common";
import { Agent, AwsService, CargoLoadMethod, CargoType, Client, CustomJwtService, Driver, DriverMerchant, DriverPhoneNumber, DriverTransport, OrderOffer, SundryService, Transaction, TransportKind, TransportType, User } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DriversController } from "./contollers/driver.controller";
import { DriversService } from "./services/driver.service";
import { TransportsService } from "./services/transport.service";
import { DriverTransportsController } from "./contollers/transport.controller";
import { DriversRepository } from "./repositories/drivers.repository";
import { DataSource } from "typeorm";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, OrderOffer ]),
      ],
      controllers: [
        DriversController,
        DriverTransportsController
      ],
      providers: [
        SundryService,
        AwsService,
        DriversService,
        TransportsService,
        DriversRepository,
        CustomJwtService,
        JwtService
      ],
      exports: [
        DriversRepository,
        TypeOrmModule.forFeature([ Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, OrderOffer ]),
      ]
})
export class DriversModule {

}