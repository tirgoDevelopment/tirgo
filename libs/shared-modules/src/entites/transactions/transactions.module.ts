import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./transaction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [
  ],
  providers: [
  ],
  exports: [
    TypeOrmModule.forFeature([Transaction]),
  ]
})
export class TransactionsModule {

}