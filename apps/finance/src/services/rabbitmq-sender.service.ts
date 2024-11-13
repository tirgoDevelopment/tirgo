// rabbitmq.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQSenderService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    ) {}

  async onModuleInit() {
    // await this.init();
  }
  
  async init() {
    this.connection = await amqp.connect("amqp://localhost:5672");
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('transactionVerified');
    await this.channel.assertQueue('transactionRejected');
  }

  async sendTransactionVerifiedMessage(body: { userId: number, transactionId: number }) {
    await this.channel.sendToQueue('transactionVerified', Buffer.from(JSON.stringify(body)));
  }

  async sendTransactionRejectedMessage(body: { userId: number, transactionId: number }) {
    await this.channel.sendToQueue('transactionRejected', Buffer.from(JSON.stringify(body)));
  }

}
