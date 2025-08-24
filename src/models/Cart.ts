import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  qty: { type: Number, required: true, min: 1 },
}, { _id: true });

const CartSchema = new Schema({
  token: { type: String, required: true, unique: true },
  items: { type: [CartItemSchema], default: [] },
  promoCode: { type: String, default: null }, // uppercase
  status: { type: String, enum: ['active', 'ordered'], default: 'active' },
}, { timestamps: true });

export type Cart = InferSchemaType<typeof CartSchema>;
export type CartItem = InferSchemaType<typeof CartItemSchema>;
export const CartModel = mongoose.model('Cart', CartSchema);

export type CartTotals = {
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  lines: Array<{
    itemId: Types.ObjectId;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    title: string;
    sku: string;
  }>
};
