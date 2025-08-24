import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { ProductModel } from '../src/models/Product.js';
import { PromoModel } from '../src/models/Promo.js';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  await mongoose.connect(uri);

  await ProductModel.deleteMany({});
  await PromoModel.deleteMany({});

  const tee = await ProductModel.create({
    title: 'Basic Tee',
    slug: 'basic-tee',
    description: 'Soft cotton tee',
    variants: [
      { sku: 'TEE-BLK-S', attributes: { color: 'black', size: 'S' }, price: 1500, currency: 'USD', stock: 50 },
      { sku: 'TEE-BLK-M', attributes: { color: 'black', size: 'M' }, price: 1500, currency: 'USD', stock: 50 },
      { sku: 'TEE-WHT-M', attributes: { color: 'white', size: 'M' }, price: 1400, currency: 'USD', stock: 50 },
    ]
  });

  const hoodie = await ProductModel.create({
    title: 'Cozy Hoodie',
    slug: 'cozy-hoodie',
    description: 'Fleece-lined comfort',
    variants: [
      { sku: 'HD-BLU-M', attributes: { color: 'blue', size: 'M' }, price: 4500, currency: 'USD', stock: 30 },
      { sku: 'HD-BLU-L', attributes: { color: 'blue', size: 'L' }, price: 4500, currency: 'USD', stock: 30 },
    ]
  });

  const cap = await ProductModel.create({
    title: 'Classic Cap',
    slug: 'classic-cap',
    description: 'Adjustable brim',
    variants: [
      { sku: 'CAP-NVY-OS', attributes: { color: 'navy', size: 'OS' }, price: 2000, currency: 'USD', stock: 100 },
    ]
  });

  await PromoModel.create({
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    startsAt: new Date(Date.now() - 24*3600*1000),
    endsAt: new Date(Date.now() + 14*24*3600*1000),
    active: true
  });

  await PromoModel.create({
    code: 'TAKE500',
    type: 'fixed',
    value: 500,
    startsAt: new Date(Date.now() - 24*3600*1000),
    endsAt: new Date(Date.now() + 14*24*3600*1000),
    active: true
  });

  console.log('Seeded products and promos');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
