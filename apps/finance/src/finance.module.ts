import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { AuthModule } from '.';
import { TransactionsModule } from './transaction/transaction.module';
import { RabbitMQSenderService } from './services/rabbitmq-sender.service';

@Module({
  imports: [
    AuthModule,
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
    TransactionsModule
  ],
  controllers: [FinanceController],
  providers: [
    FinanceService,
    RabbitMQSenderService
  ],
})
export class FinanceModule {}
