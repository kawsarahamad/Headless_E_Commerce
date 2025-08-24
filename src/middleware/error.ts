import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'NOT_FOUND', 'Route not found'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = err as HttpError;
  const status = e.status || 500;
  return res.status(status).json({
    error: {
      code: e.code || 'INTERNAL_ERROR',
      message: e.message || 'Something went wrong',
      details: e.details,
    }
  });
}
