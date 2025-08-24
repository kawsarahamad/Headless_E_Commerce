import { Router, Request, Response, NextFunction } from 'express';
import { createCart, getCart, addItem, updateItem, removeItem, applyPromo, getTotals } from '../controllers/cartController.js';
import { validate, requireCartToken } from '../middleware/validate.js';
import { addItemSchema, updateItemSchema, applyPromoSchema } from '../schemas/cartSchemas.js';

export const cartRouter = Router();

function withCartToken(handler: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try { (req as any).cartToken = requireCartToken(req); }
    catch (e) { return next(e); }
    return handler(req, res, next);
  };
}

cartRouter.post('/', createCart);
cartRouter.get('/me', withCartToken(getCart));
cartRouter.post('/items', withCartToken(validate(addItemSchema)), withCartToken(addItem));
cartRouter.patch('/items/:itemId', withCartToken(validate(updateItemSchema)), withCartToken(updateItem));
cartRouter.delete('/items/:itemId', withCartToken(removeItem));
cartRouter.post('/apply-promo', withCartToken(validate(applyPromoSchema)), withCartToken(applyPromo));
cartRouter.get('/me/totals', withCartToken(getTotals));
