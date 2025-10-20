import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';

import * as packageJson from '../package.json';

import { AppModule } from './app.module';
import { MinApp } from './shared/enums/minapp.enum';

async function bootstrap() {
  // APPLICATION
  const application = await NestFactory.create(AppModule);

  // HELMET
  application.use(helmet());

  // CORS
  application.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // REQUEST VALIDATION
  application.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // RESPONSE SERIALIZATION
  application.useGlobalInterceptors(new ClassSerializerInterceptor(application.get(Reflector)));

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

  // SHUTDOWN HOOK
  application.enableShutdownHooks();

  // PORT
  await application.listen(process.env.PORT ?? 3000);
}

bootstrap();
