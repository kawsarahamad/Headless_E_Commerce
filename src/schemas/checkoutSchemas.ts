import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
