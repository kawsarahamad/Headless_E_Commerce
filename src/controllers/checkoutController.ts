import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CartModel } from '../models/Cart.js';
import { OrderModel } from '../models/Order.js';
import { PromoModel } from '../models/Promo.js';
import { HttpError } from '../middleware/error.js';
import { applyDiscount } from '../utils/pricing.js';

function randomOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${n}`;
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;

    const cart = await CartModel.findOne({ token, status: 'active' });
    if (!cart) throw new HttpError(404, 'CART_NOT_FOUND', 'Active cart not found');

    // Rebuild the same aggregation as /carts/me/totals to compute items + subtotal
    const pipeline: any[] = [
      { $match: { token, status: 'active' } },
      { $unwind: '$items' },
      { $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
      }},
      { $unwind: '$product' },
      { $addFields: {
          variant: { $first: { $filter: { input: '$product.variants', as: 'v', cond: { $eq: ['$$v._id', '$items.variantId'] } } } }
      }},
      { $addFields: {
          unitPrice: '$variant.price',
          sku: '$variant.sku',
          title: '$product.title',
          currency: '$variant.currency',
          qty: '$items.qty',
          lineTotal: { $multiply: ['$items.qty', '$variant.price'] }
      }},
      { $group: {
          _id: '$token',
          currency: { $first: '$currency' },
          items: { $push: {
            productId: '$product._id',
            variantId: '$variant._id',
            title: '$title',
            sku: '$sku',
            qty: '$qty',
            unitPrice: '$unitPrice',
            lineTotal: '$lineTotal',
            currency: '$currency'
          }},
          subtotal: { $sum: '$lineTotal' }
      }}
    ];

    const agg = await CartModel.aggregate(pipeline);
    const base = agg[0] || { subtotal: 0, items: [], currency: 'USD' };

    const promo = cart.promoCode ? await PromoModel.findOne({ code: cart.promoCode }) : null;
    const { discountTotal, total } = applyDiscount(base.subtotal || 0, promo || undefined);

    const order = await OrderModel.create({
      number: randomOrderNumber(),
      cartToken: token,
      items: base.items,
      subtotal: base.subtotal || 0,
      discountTotal,
      total,
      currency: base.currency || 'USD',
      email: req.body.email || '',
      status: 'created',
    });

    await CartModel.updateOne({ token }, { $set: { status: 'ordered' } });
    res.status(201).json({ data: order });
  } catch (e) { next(e); }
}
