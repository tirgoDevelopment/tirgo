import { Module } from "@nestjs/common";
import { Agent, AwsService, CargoLoadMethod, CargoType, Client, CustomJwtService, Driver, DriverMerchant, DriverPhoneNumber, DriverTransport, DriverOrderOffers, SundryService, Transaction, TransportKind, TransportType, User } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DriversController } from "./contollers/driver.controller";
import { DriversService } from "./services/driver.service";
import { TransportsService } from "./services/driver-transport.service";
import { DriverTransportsController } from "./contollers/driver-transport.controller";
import { DriversRepository } from "./repositories/drivers.repository";
import { DataSource } from "typeorm";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers ]),
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
        TypeOrmModule.forFeature([ Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers ]),
      ]
})
export class DriversModule {

}