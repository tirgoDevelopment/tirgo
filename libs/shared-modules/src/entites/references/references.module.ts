import { Module } from "@nestjs/common";
import { TransportType } from "./entities/transport-type.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CargoType } from "./entities/cargo-type.entity";
import { CargoTypeGroup } from "./entities/cargo-type-group.entity";
import { Currency } from "./entities/currency.entity";
import { Subscription } from "./entities/subscription.entity";
import { CargoLoadMethod } from "./entities/cargo-load-method.entity";
import { CargoPackage } from "./entities/cargo-package.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([TransportType, CargoType, CargoTypeGroup, Currency, Subscription, CargoLoadMethod, CargoPackage])
  ],
  controllers: [
  ],
  providers: [
  ],
  exports: [
    TypeOrmModule.forFeature([TransportType, CargoType, CargoTypeGroup, Currency, Subscription, CargoLoadMethod, CargoPackage])
  ]
})
export class ReferencesModule {

}