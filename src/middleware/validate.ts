import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.js';

export function validate(schema?: AnyZodObject, location: 'body'|'query'='body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!schema) return next();
    const data = location === 'body' ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      return next(new HttpError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten()));
    }
    if (location === 'body') req.body = result.data;
    else req.query = result.data as any;
    next();
  };
}

export function requireCartToken(req: Request): string {
  const hdr = req.header('Authorization');
  const queryToken = req.query.cartToken as string | undefined;
  let token = '';
  if (hdr?.startsWith('Bearer ')) token = hdr.slice(7);
  else if (queryToken) token = queryToken;
  if (!token) throw new HttpError(401, 'NO_CART_TOKEN', 'Provide cart token via Authorization Bearer or ?cartToken=');
  return token;
}
