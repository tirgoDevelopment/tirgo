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
    await this.channel.assertQueue('users');
    await this.channel.assertQueue('orderOfferToClient');
    await this.channel.assertQueue('orderOfferToDriver');
    await this.channel.assertQueue('acceptOfferToDriver');
    await this.channel.assertQueue('acceptOfferToClient');
  }

  async sendMessage(message: string) {
    await this.channel.sendToQueue('users', Buffer.from(JSON.stringify(message)));
  }

  async sendAcceptOfferMessageToClient(body: { userId: number, orderId: number }) {
    await this.channel.sendToQueue('acceptOfferToClient', Buffer.from(JSON.stringify(body)));
  }

  async sendOrderOfferMessageToClient(body: { userId: number, orderId: number }) {
    await this.channel.sendToQueue('orderOfferToClient', Buffer.from(JSON.stringify(body)));
  }

  async sendOrderOfferMessageToDriver(body: { userId: number, orderId: number }) {
    await this.channel.sendToQueue('orderOfferToDriver', Buffer.from(JSON.stringify(body)));
  }

  async sendAcceptOfferMessageToDriver(body: { userId: number, orderId: number }) {
    await this.channel.sendToQueue('acceptOfferToDriver', Buffer.from(JSON.stringify(body)));
  }

}
