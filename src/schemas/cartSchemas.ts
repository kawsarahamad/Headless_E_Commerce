import { z } from 'zod';

export const createCartSchema = z.object({
  // no body needed for guest cart
}).strict().optional();

export const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  qty: z.number().int().min(1),
});

export const updateItemSchema = z.object({
  qty: z.number().int().min(1),
});

export const applyPromoSchema = z.object({
  code: z.string().min(1),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>;
