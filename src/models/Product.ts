import mongoose, { Schema, InferSchemaType } from 'mongoose';

const VariantSchema = new Schema({
  sku: { type: String, required: true },
  attributes: { type: Map, of: String, default: {} }, // e.g. size, color
  price: { type: Number, required: true, min: 0 }, // cents
  currency: { type: String, default: 'USD' },
  stock: { type: Number, default: 100 },
}, { _id: true });

const ProductSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  variants: { type: [VariantSchema], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type Product = InferSchemaType<typeof ProductSchema>;
export const ProductModel = mongoose.model('Product', ProductSchema);
