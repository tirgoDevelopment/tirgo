// src/chat/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { CustomJwtService } from '..';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  logger: false,
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private jwtService: CustomJwtService) {}

  private users: Map<string, string> = new Map();

  afterInit(server: Server) {
    console.log('Initialized');
  }

 async handleConnection(client: Socket) {
    try {
      const token = client.handshake?.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        throw new UnauthorizedException('Token not provided');
      }
      const payload: any = await this.jwtService.verifyTokenAndGetPayload(token);
      client.handshake.auth = { userId: payload.sub };
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      client.disconnect();
      console.log(`Client disconnected: ${client.id} - ${error.message}`);
    }
  }


  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.users.delete(client.id);
    this.server.emit('users', Array.from(this.users.values()));
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, username: string) {
    this.users.set(client.id, username);
    this.server.emit('users', Array.from(this.users.values()));
    console.log(`User registered: ${username} with ID: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { to: string; message: string }) {
    console.log(client.id, client.handshake.auth)
    console.log('message', payload);
    const username = this.users.get(client.id);
    const targetClient = this.server.sockets.sockets.get(payload.to);
    if (targetClient) {
      targetClient.emit('message', { from: username, message: payload.message });
    } else {
      client.emit('error', 'User not found');
    }
  }
}
