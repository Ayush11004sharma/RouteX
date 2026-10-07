import { Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode = 400, errorCode = 'BAD_REQUEST', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiResponse {
  public static success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  public static error(
    res: Response,
    message: string,
    statusCode = 400,
    errorCode = 'ERROR',
    details?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
    });
  }
}
