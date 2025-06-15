import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-quard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new JwtAuthGuard(app.get(JwtService)));

  await app.listen(3000);
}

bootstrap();
