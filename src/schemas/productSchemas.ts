import { z } from 'zod';
export const getProductsQuery = z.object({
  q: z.string().optional()
});
