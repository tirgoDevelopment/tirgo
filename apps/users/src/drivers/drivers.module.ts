import { Module } from "@nestjs/common";
import {
  DriversServicesRequests, Agent, AwsService, CargoLoadMethod, CargoType,
  Client, CustomJwtService, Driver, DriverMerchant,
  DriverPhoneNumber, DriverTransport, DriverOrderOffers, SundryService,
  DriversServices, DriversServicesRequestsStatuses,
  DriversServicesRequestsMessages,
  Transaction, TransportKind, TransportType, User,
  DriversServicesRequestsStatusesChangesHistory,
  TmsReqestToDriver
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
import { DriversServicesRequestsRepository } from "./repositories/services-requests.repository";
import { DriversServicesRequestsMessagesRepository } from "./repositories/services-requests-messages.repository";


@Module({
  imports: [
    SseModule,
    TypeOrmModule.forFeature([Driver, TmsReqestToDriver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers, DriversServices, DriversServicesRequests, DriversServicesRequestsStatuses, DriversServicesRequestsMessages, DriversServicesRequestsStatusesChangesHistory]),
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
    ServicesRequestsService,
    DriversServicesRequestsRepository,
    DriversServicesRequestsMessagesRepository
  ],
  exports: [
    DriversRepository,
    TypeOrmModule.forFeature([Driver, TmsReqestToDriver, DriverPhoneNumber, DriverMerchant, User, Client, DriverTransport, TransportKind, TransportType, CargoType, CargoLoadMethod, Agent, Transaction, DriverOrderOffers, DriversServices, DriversServicesRequests, DriversServicesRequestsStatuses, DriversServicesRequestsMessages, DriversServicesRequestsStatusesChangesHistory]),
  ]
})
export class DriversModule {

}