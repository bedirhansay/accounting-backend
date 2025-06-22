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

    const timestamp = new Date().toISOString();
    const path = req.url;
    const method = req.method;

    const message = this.getErrorMessage(exception);
    const error = exception?.name ?? 'InternalServerError';
    const stack = exception?.stack ?? '';

    await this.errorLogger.logError({
      message,
      stack,
      context: error,
      path,
      method,
      companyId: req['companyId'],
    });

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      path,
      timestamp,
    });
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') return response;

      if (typeof response === 'object') {
        const msg = (response as any)?.message;
        if (typeof msg === 'string') return msg;
        if (Array.isArray(msg)) return msg.join(', ');
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
