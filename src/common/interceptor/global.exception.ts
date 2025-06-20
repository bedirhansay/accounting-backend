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
    const message = this.getErrorMessage(exception);
    const stack = exception?.stack ?? '';

    await this.errorLogger.logError({
      message,
      stack,
      context: exception?.name ?? 'UnknownException',
      path: req.url,
      method: req.method,
      companyId: req['companyId'],
    });

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors: this.getErrorDetails(exception),
    });
  }

  private getErrorMessage(exception: any): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (typeof response === 'object') {
        if (Array.isArray((response as any).message)) {
          return 'Validation failed';
        }
        return (response as any).message;
      }
    }
    return 'Internal server error';
  }

  private getErrorDetails(exception: any): string[] | null {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message = (res as any)?.message;
      if (Array.isArray(message)) return message;
      const errors = (res as any)?.errors;
      if (Array.isArray(errors)) return errors;
    }
    return null;
  }
}
