import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Statik dosya sunumu için absolute path kullan
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Global prefix ayarı
  app.setGlobalPrefix('api', {
    exclude: ['/api-json', '/swagger.html', '/redoc.html'],
  });

  // Swagger yapılandırması
  const config = new DocumentBuilder()
    .setTitle('API Dokümantasyonu')
    .setDescription('Muhasebe API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // API JSON endpoint'i
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
