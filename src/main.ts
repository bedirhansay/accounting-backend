import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception/global.exception';
import { ErrorLoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.enableCors({
  //   origin: true, // veya origin: ['http://localhost:5173', 'https://senin-frontend-domainin']
  //   credentials: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id'],
  //   exposedHeaders: ['Authorization', 'X-Company-Id'],
  // });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setGlobalPrefix('api', {
    exclude: ['/api-json', '/swagger', '/redoc'],
  });

  const config = new DocumentBuilder()
    .setTitle('API Dokümantasyonu')
    .setDescription('Muhasebe API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'Bearer'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-company-id',
        in: 'header',
      },
      'x-company-id'
    )
    .addServer(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const errorLogger = app.get(ErrorLoggerService);
  app.useGlobalFilters(new GlobalExceptionFilter(errorLogger));

  app
    .getHttpAdapter()
    .getInstance()
    .get('/api-json', (req, res) => {
      res.json(document);
    });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
