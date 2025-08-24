import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/Product.js';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string || '').trim();
    const match: any = { active: true };
    if (q) match.title = { $regex: q, $options: 'i' };

    // Use aggregation to expose min/max price across variants
    const pipeline = [
      { $match: match },
      { $project: {
          title: 1, slug: 1, description: 1, active: 1, variants: 1,
          minPrice: { $min: '$variants.price' },
          maxPrice: { $max: '$variants.price' },
        }
      }
    ];
    const products = await ProductModel.aggregate(pipeline);
    res.json({ data: products });
  } catch (e) { next(e); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    res.json({ data: product });
  } catch (e) { next(e); }
}
