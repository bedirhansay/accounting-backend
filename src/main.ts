import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception/global.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS yapılandırması
  app.enableCors({
    origin: '*', // Prod ortamında domainleri buraya yazmalısın
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id'],
    credentials: true,
  });

  // Global prefix olarak api/v1 versiyonlama
  app.setGlobalPrefix('api/v1');

  // Swagger dokümantasyon konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('API Dokümantasyonu')
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
      'BearerAuth' // Swagger UI’da gösterilecek security scheme adı
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI '/api/v1/docs' endpointinde aktif olur
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Token’ı sayfa yenilense bile saklar
    },
  });

  // Global exception filtresi
  const exceptionFilter = app.get(GlobalExceptionFilter);
  app.useGlobalFilters(exceptionFilter);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
