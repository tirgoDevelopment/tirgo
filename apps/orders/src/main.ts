import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  const corsOptions: any = {
    origin: '*', // replace with your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.setGlobalPrefix('api/v2/orders')
  await app.listen(3001, '192.168.1.218');
}
bootstrap();
