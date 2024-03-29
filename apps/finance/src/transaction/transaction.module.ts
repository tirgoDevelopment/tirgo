import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from "./transaction.controller";
import { Agent, Currency, Driver, Transaction, User,Subscription } from "..";
import { TransactionService } from "./transaction.service";
import { RabbitMQSenderService } from "../services/rabbitmq-sender.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, User, Currency, Agent, Subscription, Driver]),
    ],
    controllers: [
        TransactionsController
    ],
    providers: [
        TransactionService,
        RabbitMQSenderService
    ],
    exports: [
        TypeOrmModule.forFeature([Transaction]),
    ]
})
export class TransactionsModule {

}