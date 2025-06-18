import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception/global.exception';

// ✅ main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Dokümantasyonu')
    .setDescription('NestJS için Swagger API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth() // JWT varsa
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const exceptionFilter = app.get(GlobalExceptionFilter);
  app.useGlobalFilters(exceptionFilter);

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
