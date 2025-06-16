// src/common/filters/global-exception.filter.ts

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggerService } from '../../modules/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogger: ErrorLoggerService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    const stack = exception?.stack ?? '';

    const companyId = req['companyId'];

    await this.errorLogger.logError({
      message,
      stack,
      context: exception?.name ?? 'UnknownException',
      path: req.url,
      method: req.method,
      companyId,
    });

    res.status(status).json({
      statusCode: status,
      message,
      error: message,
    });
  }
}
