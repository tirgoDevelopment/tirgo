import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from "./entities/driver.entity";
import { DriverTransport } from "./entities/driver-transport.entity";
import { TransportVerification } from "./entities/transport-verification.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Driver, DriverTransport, TransportVerification]),
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        TypeOrmModule.forFeature([Driver, DriverTransport, TransportVerification]),
    ]
})
export class DriversModule {

}