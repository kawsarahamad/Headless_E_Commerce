import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order.js';

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json({ data: order });
  } catch (e) { next(e); }
}

export async function listOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(50);
    res.json({ data: orders });
  } catch (e) { next(e); }
}
