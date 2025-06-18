import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS ayarları
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id'],
    credentials: true,
  });

  // ✅ Swagger konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('Accounting API')
    .setDescription('NestJS için Swagger API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Bearer'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use('/swagger-static', express.static(join(__dirname, '..', 'swagger-static')));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    const serverUrl = `http://localhost:${port}`;

    const filesToDownload = [
      'swagger-ui-bundle.js',
      'swagger-ui-init.js',
      'swagger-ui-standalone-preset.js',
      'swagger-ui.css',
    ];

    filesToDownload.forEach((filename) => {
      const fileUrl = `${serverUrl}/api/${filename}`;
      const localPath = join(__dirname, '..', '..', 'public', 'swagger-ui', filename);

      get(fileUrl, (res) => {
        res.pipe(createWriteStream(localPath));
        console.log(
          `✅ ${filename} ----------------------dosyası indirildi ve kaydedildi -> /public/swagger-ui/${filename}`
        );
      });
    });
  }
}

bootstrap();
