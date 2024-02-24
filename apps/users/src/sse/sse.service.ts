import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

interface SseEvent {
    data: string;
    type: string;
}

@WebSocketGateway()
export class SseGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connections: Map<string, any> = new Map(); // Map to store connections based on userId

  @WebSocketServer()
  server: Server;

  handleSseConnection(req: any, res: any): void {
    const userId = req.user.id.toString(); // Assuming user id is available in req.user.id

    // Set up SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    this.connections.set(userId, res); // Store the connection
    console.log('User ' + userId + ' connected')
  }

  sendNotificationToUser(userId: string, notification: any): void {
    try {
      console.log(userId, notification)
    const connection = this.connections.get(userId);
    if (connection) {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    } catch(err: any) {
      
    }
  }

  sendNotificationToAllUsers(notification: SseEvent): void {
    this.connections.forEach((connection) => {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
  }

  handleConnection(client: any, ...args: any[]): any {
    console.log('client', client)
    // Handle new SSE connection
  }

  handleDisconnect(client: any): any {
    // Handle SSE disconnection
  }
}
