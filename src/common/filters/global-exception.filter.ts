import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    // Handle NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        error = exception.constructor.name;
      } else {
        message = errorResponse;
        error = exception.constructor.name;
      }
    }
    // Handle TypeORM Database Errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'DatabaseError';

      // Handle specific database constraint errors
      if ((exception as any).code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists with this unique field';
        error = 'ConflictError';
      } else if ((exception as any).code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint violation';
        error = 'ForeignKeyError';
      } else if ((exception as any).code === '23502') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Required field cannot be null';
        error = 'NotNullError';
      } else {
        // Show more detailed error message in development
        message =
          process.env.NODE_ENV === 'production'
            ? 'Database operation failed'
            : `Database operation failed: ${exception.message}`;
      }
    }
    // Handle unexpected errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log unexpected errors for debugging
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Base error response
    const baseErrorResponse = {
      statusCode: status,
      message,
    };

    // Add additional fields for development environment
    const errorResponse =
      process.env.NODE_ENV === 'production'
        ? baseErrorResponse
        : {
            ...baseErrorResponse,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          };

    // Log all errors with context
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
