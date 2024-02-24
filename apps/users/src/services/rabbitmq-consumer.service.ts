import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { SseGateway } from '../sse/sse.service';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    private sseService: SseGateway
    ) {}

  async onModuleInit() {
    await this.init();
    await this.setupQueueConsumers();
  }

  async init() {
    this.connection = await amqp.connect("amqp://localhost:5672");
    this.channel = await this.connection.createChannel();

    //orders
    await this.channel.assertQueue('orderOfferToClient');
    await this.channel.assertQueue('acceptOfferToClient');
    await this.channel.assertQueue('orderOfferToDriver');
    await this.channel.assertQueue('acceptOfferToDriver');

    //finance
    await this.channel.assertQueue('transactionVerified');
    await this.channel.assertQueue('transactionRejected');
  }

  private async setupQueueConsumers() {
    // Consume order messages from 'message' queue
    this.channel.consume('orderOfferToClient', this.handleOrderOfferToClientMessage.bind(this), { noAck: true });
    this.channel.consume('acceptOfferToClient', this.handleAcceptOfferToClientMessage.bind(this), { noAck: true });
    this.channel.consume('orderOfferToDriver', this.handleOrderOfferToDriverMessage.bind(this), { noAck: true });
    this.channel.consume('acceptOfferToDriver', this.handleAcceptOfferToDriverMessage.bind(this), { noAck: true });

     // Consume finance messages from 'message' queue
    this.channel.consume('transactionVerified', this.handleVerifiedTransactionMessage.bind(this), { noAck: true });
    this.channel.consume('transactionRejected', this.handleRejectedTransactionMessage.bind(this), { noAck: true });
  }

  // order messages
  private async handleOrderOfferToClientMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId.toString(), { type: 'driverOffer', orderId: body.orderId} )
      try {
        const data = body;
        console.log(`Received driverOffer message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing driverOffer message:', error.message);
      }
    }
  }
  
  private async handleAcceptOfferToClientMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId?.toString(), { type: 'driverAcceptOffer', orderId: body.orderId} )
      try {
        const data = body;
        console.log(`Received driverAcceptOffer message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing driverAcceptOffer message:', error);
      }
    }
  }

  private async handleOrderOfferToDriverMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId.toString(), { type: 'clientOffer', orderId: body.orderId} )
      try {
        const data = body;
        console.log(`Received clientOffer message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing clientOffer message:', error);
      }
    }
  }

  private async handleAcceptOfferToDriverMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId.toString(), { type: 'clientAcceptOffer', orderId: body.orderId} )
      try {
        const data = body;
        console.log(`Received clientAcceptOffer message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing clientAcceptOffer message:', error);
      }
    }
  }


  //finance messages
  private async handleVerifiedTransactionMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId.toString(), { type: 'transactionVerified', transactionId: body.transactionId} )
      try {
        const data = body;
        console.log(`Received TransactionVerified message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing TransactionVerified message:', error);
      }
    }
  }

  private async handleRejectedTransactionMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const body = JSON.parse(msg.content.toString());
      this.sseService.sendNotificationToUser(body.userId.toString(), { type: 'transactionRejected', transactionId: body.transactionId} )
      try {
        const data = body;
        console.log(`Received TransactionRejected message: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error('Error parsing TransactionRejected message:', error);
      }
    }
  }
}
