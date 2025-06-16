import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception/global.exception';
import { JwtAuthGuard } from './common/guards/jwt-quard';
import { ErrorLoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new JwtAuthGuard(app.get(JwtService)));
  const errorLogger = app.get(ErrorLoggerService);
  app.useGlobalFilters(new GlobalExceptionFilter(errorLogger));
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 App running on http://localhost:${port}`);
}

bootstrap();
