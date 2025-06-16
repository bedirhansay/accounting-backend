import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ErrorLog, ErrorLogSchema } from './error.log-schema';
import { ErrorLoggerService } from './logger.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: ErrorLog.name, schema: ErrorLogSchema }])],
  providers: [ErrorLoggerService],
  exports: [ErrorLoggerService],
})
export class LoggerModule {}
