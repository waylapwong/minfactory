import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as packageJson from '../package.json';

import { AppModule } from './app.module';
import { MinApp } from './shared/enums/minapp.enum';

async function bootstrap() {
  const application = await NestFactory.create(AppModule);

  // OPENAPI
  const SWAGGER_CONFIG = new DocumentBuilder()
    .setTitle(MinApp.MinFactory)
    .setVersion(`v${packageJson.version}`)
    .setDescription(
      `${MinApp.MinFactory} OpenAPI specification. <br/> <a href="http://localhost:3000/openapi-json/" target="_blank">JSON specification</a>`,
    )
    .setContact(MinApp.MinFactory, 'https://minFactory.com', '')
    .build();
  const SWAGGER_DOCUMENT = SwaggerModule.createDocument(application, SWAGGER_CONFIG);
  SwaggerModule.setup('openapi', application, SWAGGER_DOCUMENT);

  // PORT
  await application.listen(process.env.PORT ?? 3000);
}

bootstrap();
