import { NestFactory } from '@nestjs/core';
import { FinanceModule } from './finance.module';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(FinanceModule);
  const corsOptions: any = {
    origin: '*', // replace with your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.setGlobalPrefix('api/v2/finance')
  await app.listen(3003, '192.168.1.218');
}
bootstrap();
