import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggerService } from '../../modules/logger/logger.service';

interface ErrorDetail {
  field?: string;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogger: ErrorLoggerService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getErrorMessage(exception);
    const errors = this.getErrorDetails(exception);
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
      errors: errors.length > 0 ? errors : undefined,
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

  private getErrorDetails(exception: any): ErrorDetail[] {
    const details: ErrorDetail[] = [];

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const res = response as Record<string, any>;

        // class-validator hataları
        if (Array.isArray(res.message)) {
          for (const msg of res.message) {
            const [field, ...msgParts] = msg.split(' ');
            details.push({
              field,
              message: msgParts.join(' ') || msg,
            });
          }
        }

        if (Array.isArray(res.errors)) {
          return res.errors;
        }
      }
    }

    return details;
  }
}
