import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PromoSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 }, // percent e.g. 10 for 10%, or fixed amount in cents
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export type Promo = InferSchemaType<typeof PromoSchema>;
export const PromoModel = mongoose.model('Promo', PromoSchema);
