import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { CargoType, CargoTypeGroup, Currency, Subscription, SubscriptionPayment, TransportType, TransportKind, CargoStatus, User, CargoPackage, CargoLoadMethod, AuthModule, AwsService } from '.';
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

@Module({
    imports: [
      AuthModule,
      TypeOrmModule.forFeature([TransportType, CargoType, CargoTypeGroup, Currency, Subscription, SubscriptionPayment, TransportKind, CargoStatus, User, CargoPackage, CargoLoadMethod]),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        password: 'postgres',
        username: 'postgres',
        entities: entities,
        database: 'tirgo', 
        synchronize: true,
      }),
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
      FilesController
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
      AwsService
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
export class ReferencesModule {}
