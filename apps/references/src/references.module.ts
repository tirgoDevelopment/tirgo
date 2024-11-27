import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoType, CargoTypeGroup, Currency, Role, Permission, Subscription, SubscriptionPayment, TransportType, TransportKind, CargoStatus, User, CargoPackage, CargoLoadMethod, AuthModule, AwsService, DatabaseModule, DriverService } from '.';
import { TransportTypesController } from './references/controllers/transport-types.controller';
import { CargoTypesController } from './references/controllers/cargo-type.controller';
import { CargoTypeGroupsController } from './references/controllers/cargo-type-groups.controller';
import { CurrenciesController } from './references/controllers/currencies.controller';
import { SubscriptionsController } from './references/controllers/subscriptions.controller';
import { TransportKindsController } from './references/controllers/transport-kinds.controller';
import { CargoStatusesController } from './references/controllers/cargo-status.controller';
import { TransportTypesService } from './references/services/transport-type.service';
import { CargoTypesService } from './references/services/cargo-type.service';
import { CargoTypeGroupsService } from './references/services/cargo-type-group.service';
import { CurrenciesService } from './references/services/currency.service';
import { SubscriptionsService } from './references/services/subscription.service';
import { TransportKindsService } from './references/services/transport-kind.service';
import { CargoStatusesService } from './references/services/cargo-status.service';
import { CargoPackagesController } from './references/controllers/cargo-package.controller';
import { CargoLoadingMethodesController } from './references/controllers/cargo-loading-method.controller';
import { CargoLoadingMethodsService } from './references/services/cargo-loading-method.service';
import { CargoPackagesService } from './references/services/cargo-package.service';
import { FilesController } from './references/controllers/files.controller';
import { CitiesController } from './references/controllers/cities.controller';
import { CitiesService } from './references/services/cities.service';
import { HttpService, HttpModule } from '@nestjs/axios';
import { RolesController } from './references/controllers/roles.controller';
import { RolesService } from './references/services/roles.service';
import { DriverServicesController } from './references/controllers/driver-service.controller';
import { DriverServicesService } from './references/services/driver-services.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TypeOrmModule.forFeature([Role, DriverService, Permission, TransportType, CargoType, CargoTypeGroup, Currency, Subscription, SubscriptionPayment, TransportKind, CargoStatus, User, CargoPackage, CargoLoadMethod]),
    HttpModule
  ],
  controllers: [
    TransportTypesController,
    CargoTypesController,
    CargoTypeGroupsController,
    CurrenciesController,
    SubscriptionsController,
    TransportKindsController,
    CargoStatusesController,
    CargoPackagesController,
    CargoLoadingMethodesController,
    FilesController,
    CitiesController,
    RolesController,
    DriverServicesController
  ],
  providers: [
    TransportTypesService,
    CargoTypesService,
    CargoTypeGroupsService,
    CurrenciesService,
    SubscriptionsService,
    TransportKindsService,
    CargoStatusesService,
    CargoPackagesService,
    CargoLoadingMethodsService,
    AwsService,
    CitiesService,
    RolesService,
    DriverServicesService
  ],
  exports: [
    TypeOrmModule.forFeature([TransportType, CargoType, CargoTypeGroup, Currency, Subscription, SubscriptionPayment, TransportKind, CargoStatus, User, CargoPackage, CargoLoadMethod]),
    TransportTypesService,
    CargoTypesService,
    CargoTypeGroupsService,
    CurrenciesService,
    SubscriptionsService,
    TransportKindsService
  ]
})
export class ReferencesModule { }
