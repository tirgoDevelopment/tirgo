import { NestFactory } from '@nestjs/core';
import { ReferencesModule } from './references.module';
import { config } from 'dotenv';
import { CustomSwaggerModule } from '.'
config();

async function bootstrap() {
  const app = await NestFactory.create(ReferencesModule);
  const corsOptions: any = {
    origin: '*', // replace with your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);
  await CustomSwaggerModule.setup(app, 'references', 'References');
  app.setGlobalPrefix('api/v2/references')
  await app.listen(3002);
}
bootstrap();
