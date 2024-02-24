import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from "./client.entity";
import { ClientPhoneNumber } from "./client-phonenumber.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Client, ClientPhoneNumber]),
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        TypeOrmModule.forFeature([Client, ClientPhoneNumber]),
    ]
})
export class ClientsModule {

}