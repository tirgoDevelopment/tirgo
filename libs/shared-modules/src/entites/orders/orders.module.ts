import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from "./entities/order.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        TypeOrmModule.forFeature([Order]),
    ]
})
export class OrdersModule {

}