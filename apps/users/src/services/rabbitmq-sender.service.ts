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
    await this.init();
  }
  
  async init() {
    this.connection = await amqp.connect("amqp://localhost:5672");
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('message');
  }

  async sendMessage(message: string) {
    await this.channel.sendToQueue('message', Buffer.from(JSON.stringify(message)));
  }

}
