import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS yapılandırması
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Statik dosya sunumu
  app.useStaticAssets('public');

  // Global prefix (örnek: /api)
  app.setGlobalPrefix('api', {
    exclude: ['/api-json', '/swagger.html', '/redoc.html'],
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Dokümantasyonu')
    .setDescription('Muhasebe API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // /api-json endpoint'i
  app
    .getHttpAdapter()
    .getInstance()
    .get('/api-json', (req, res) => {
      res.json(document);
    });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/swagger.html`);
  console.log(`ReDoc: http://localhost:${port}/redoc.html`);
}
bootstrap();
