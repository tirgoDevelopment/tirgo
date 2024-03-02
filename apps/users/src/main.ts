import { NestFactory } from '@nestjs/core';
import { UsersModule } from './auth.module';
import { config } from 'dotenv';
import { CustomSwaggerModule } from '@app/shared-modules';
config();
async function bootstrap() {
  const app = await NestFactory.create(UsersModule);

  const corsOptions: any = {
    origin: '*', // replace with your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);
  await CustomSwaggerModule.setup(app, 'users', 'Users'); 
  app.setGlobalPrefix('api/v2/users')
  await app.listen(3000);
}
bootstrap();
