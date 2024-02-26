import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, DatabaseModule } from '.';
import { TransactionsModule } from './transaction/transaction.module';
import { RabbitMQSenderService } from './services/rabbitmq-sender.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    TransactionsModule
  ],
  controllers: [FinanceController],
  providers: [
    FinanceService,
    RabbitMQSenderService
  ],
})
export class FinanceModule {}
