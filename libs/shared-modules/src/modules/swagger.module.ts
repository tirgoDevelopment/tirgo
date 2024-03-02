import { Module, NestModule, MiddlewareConsumer, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({})
export class CustomSwaggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}

  static async setup(app: INestApplication, api: string, title: string) { // Accept app instance as a parameter
    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription('API description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);

    const swaggerCDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.7.2'
    SwaggerModule.setup(`api/${api}/docs`, app, document, {
        customCssUrl: [`${swaggerCDN}/swagger-ui.css`],
        customJs: [
          `${swaggerCDN}/swagger-ui-bundle.js`,
          `${swaggerCDN}/swagger-ui-standalone-preset.js`
        ]
      });
  }
}
