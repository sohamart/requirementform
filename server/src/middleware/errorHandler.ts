import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && ENV.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(ENV.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
