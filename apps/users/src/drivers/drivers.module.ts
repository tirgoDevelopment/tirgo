import { Module } from "@nestjs/common";
import {
  DriversServicesRequests, Agent, AwsService, CargoLoadMethod, CargoType,
  Client, CustomJwtService, Driver, DriverMerchant,
  DriverPhoneNumber, DriverTransport, DriverOrderOffers, SundryService,
  DriversServices, DriversServicesRequestsStatuses,
  Transaction, TransportKind, TransportType, User
} from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DriversController } from "./contollers/driver.controller";
import { DriversService } from "./services/driver.service";
import { TransportsService } from "./services/driver-transport.service";
import { DriverTransportsController } from "./contollers/driver-transport.controller";
import { DriversRepository } from "./repositories/drivers.repository";
import { JwtService } from "@nestjs/jwt";
import { ServicesRequestsController } from "./contollers/services-requests.controller";
import { ServicesRequestsService } from "./services/services-requests.service";
import { SseModule } from "../sse/sse.module";


@Module({
  imports: [
    SseModule,
    TypeOrmModule.forFeature([Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers, DriversServices, DriversServicesRequests, DriversServicesRequestsStatuses]),
  ],
  controllers: [
    DriversController,
    DriverTransportsController,
    ServicesRequestsController
  ],
  providers: [
    SundryService,
    AwsService,
    DriversService,
    TransportsService,
    DriversRepository,
    CustomJwtService,
    JwtService,
    ServicesRequestsService
  ],
  exports: [
    DriversRepository,
    TypeOrmModule.forFeature([Driver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers, DriversServices, DriversServicesRequests, DriversServicesRequestsStatuses]),
  ]
})
export class DriversModule {

}