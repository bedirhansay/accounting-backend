import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { ErrorLoggerService } from './logger.service';
@Module({
  controllers: [LoggerController],
  providers: [ErrorLoggerService],
  exports: [ErrorLoggerService],
})
export class LoggerModule {}
