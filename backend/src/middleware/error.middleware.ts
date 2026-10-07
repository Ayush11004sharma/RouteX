import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Operational AppError
  if (err instanceof AppError) {
    ApiResponse.error(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      ApiResponse.error(
        res,
        `A record with this ${target} already exists.`,
        409,
        'DUPLICATE_ENTRY',
        err.meta
      );
      return;
    }
    if (err.code === 'P2025') {
      ApiResponse.error(res, 'The requested resource was not found.', 404, 'NOT_FOUND');
      return;
    }
  }

  // SyntaxError from invalid JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    ApiResponse.error(res, 'Malformed JSON in request body.', 400, 'INVALID_JSON');
    return;
  }

  // Fallback internal server error
  logger.error({ err }, 'Unhandled server error');
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
}
