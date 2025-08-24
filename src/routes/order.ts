import { Router, Request, Response, NextFunction } from 'express';
import { listOrders, getOrder } from '../controllers/orderController.js';
import { checkout } from '../controllers/checkoutController.js';
import { validate, requireCartToken } from '../middleware/validate.js';
import { checkoutSchema } from '../schemas/checkoutSchemas.js';

export const orderRouter = Router();

function withCartToken(handler: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try { (req as any).cartToken = requireCartToken(req); }
    catch (e) { return next(e); }
    return handler(req, res, next);
  };
}

orderRouter.get('/', listOrders);
orderRouter.get('/:id', getOrder);
orderRouter.post('/checkout', withCartToken(validate(checkoutSchema)), withCartToken(checkout));
