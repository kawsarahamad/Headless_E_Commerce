import mongoose, { Schema, InferSchemaType } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  sku: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
}, { _id: true });

const OrderSchema = new Schema({
  number: { type: String, required: true, unique: true },
  cartToken: { type: String, required: true },
  items: { type: [OrderItemSchema], default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['created', 'paid', 'shipped', 'cancelled'], default: 'created' },
  email: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export type Order = InferSchemaType<typeof OrderSchema>;
export const OrderModel = mongoose.model('Order', OrderSchema);
