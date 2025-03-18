import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { LogLevel } from '@nestjs/common';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

import { AppConfigService } from './app-config/app-config.service';
import { Environment } from './core/enums/environment.enum';
import { ExceptionsFilter } from './core/filters/exceptions.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const minimumLoggerLevels: LogLevel[] = ['log', 'error', 'warn'];

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.ENVIRONMENT === Environment.PROD
        ? minimumLoggerLevels
        : [...minimumLoggerLevels, 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsFilter(httpAdapter));

  const appConfigService = app.get(AppConfigService);
  app.use(
    helmet({
      contentSecurityPolicy:
        appConfigService.environment === (Environment.DEV as string)
          ? false
          : undefined,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  const API_VERSION = 'v1';
  app.setGlobalPrefix(API_VERSION);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableShutdownHooks();

  const ONE_MINUTE = 60 * 1000;
  const CONNECTIONS_LIMIT = 500;
  app.use(
    rateLimit({
      windowMs: ONE_MINUTE,
      limit: CONNECTIONS_LIMIT,
    }),
  );

  app.use(compression());

  if (appConfigService.isSwaggerEnabled) {
    const options = new DocumentBuilder()
      .setTitle(appConfigService.name)
      .setDescription(appConfigService.swaggerDescription)
      .setVersion(appConfigService.swaggerVersion)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(appConfigService.swaggerPath, app, document);
  }

  const port = String(appConfigService.port);
  await app.listen(port);
  logger.log(`Application is listening on port ${port}`);
}
bootstrap();
