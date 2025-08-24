import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CartModel, CartTotals } from '../models/Cart.js';
import { ProductModel } from '../models/Product.js';
import { PromoModel } from '../models/Promo.js';
import { HttpError } from '../middleware/error.js';
import { applyDiscount } from '../utils/pricing.js';

export async function createCart(_req: Request, res: Response, next: NextFunction) {
  try {
    const token = uuidv4();
    const cart = await CartModel.create({ token, items: [] });
    res.status(201).json({ data: { cartToken: cart.token } });
  } catch (e) { next(e); }
}

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;
    const cart = await CartModel.findOne({ token, status: 'active' });
    if (!cart) throw new HttpError(404, 'CART_NOT_FOUND', 'Active cart not found');
    res.json({ data: cart });
  } catch (e) { next(e); }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;
    const { productId, variantId, qty } = req.body;
    const product = await ProductModel.findById(productId);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    const variant = product.variants.id(variantId);
    if (!variant) throw new HttpError(404, 'VARIANT_NOT_FOUND', 'Variant not found');

    const cart = await CartModel.findOneAndUpdate(
      { token, status: 'active' },
      { $setOnInsert: { token }, $push: { items: { productId, variantId, qty } } },
      { new: true, upsert: true }
    );
    res.json({ data: cart });
  } catch (e) { next(e); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;
    const itemId = req.params.itemId;
    const { qty } = req.body;
    const cart = await CartModel.findOneAndUpdate(
      { token, status: 'active', 'items._id': itemId },
      { $set: { 'items.$.qty': qty } },
      { new: true }
    );
    if (!cart) throw new HttpError(404, 'ITEM_NOT_FOUND', 'Item not found');
    res.json({ data: cart });
  } catch (e) { next(e); }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;
    const itemId = req.params.itemId;
    const cart = await CartModel.findOneAndUpdate(
      { token, status: 'active' },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
    if (!cart) throw new HttpError(404, 'ITEM_NOT_FOUND', 'Item not found');
    res.status(204).send();
  } catch (e) { next(e); }
}

// Aggregation pipeline to compute line totals + subtotal
export async function getTotals(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;

    const cart = await CartModel.findOne({ token, status: 'active' });
    if (!cart) throw new HttpError(404, 'CART_NOT_FOUND', 'Active cart not found');

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
          lines: { $push: {
            itemId: '$items._id',
            qty: '$qty',
            unitPrice: '$unitPrice',
            lineTotal: '$lineTotal',
            title: '$title',
            sku: '$sku'
          }},
          subtotal: { $sum: '$lineTotal' }
      }}
    ];

    const agg = await CartModel.aggregate(pipeline);
    const base = agg[0] as any;
    const totals = (base ? base : { subtotal: 0, lines: [], currency: 'USD' }) as Partial<CartTotals>;
    const promo = cart.promoCode ? await PromoModel.findOne({ code: cart.promoCode }) : null;

    const { discountTotal, total } = applyDiscount(totals.subtotal || 0, promo || undefined);
    const result: CartTotals = {
      subtotal: totals.subtotal || 0,
      discountTotal,
      total,
      currency: totals.currency || 'USD',
      lines: (totals.lines || []) as any
    };
    res.json({ data: result, appliedPromo: cart.promoCode || null });
  } catch (e) { next(e); }
}

export async function applyPromo(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cartToken as string;
    const code = (req.body.code as string).toUpperCase();
    const promo = await PromoModel.findOne({ code });
    if (!promo) throw new HttpError(404, 'PROMO_NOT_FOUND', 'Promo code not found');
    const now = new Date();
    if (!(promo.active && now >= promo.startsAt && now <= promo.endsAt)) {
      throw new HttpError(400, 'PROMO_INACTIVE', 'Promo not active');
    }
    await CartModel.updateOne({ token, status: 'active' }, { $set: { promoCode: code } });
    res.json({ data: { promo: code } });
  } catch (e) { next(e); }
}
