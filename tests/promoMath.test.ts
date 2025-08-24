import { applyDiscount } from '../src/utils/pricing.js';
import type { Promo } from '../src/models/Promo.js';

const now = new Date();
const makePromo = (t: 'percent'|'fixed', v: number): Promo => ({
  _id: undefined as any,
  code: 'X',
  type: t,
  value: v,
  startsAt: new Date(now.getTime() - 1000),
  endsAt: new Date(now.getTime() + 1000),
  active: true,
  createdAt: now,
  updatedAt: now,
  __v: 0
});

test('percent discount', () => {
  const { discountTotal, total } = applyDiscount(10000, makePromo('percent', 10));
  expect(discountTotal).toBe(1000);
  expect(total).toBe(9000);
});

test('fixed discount clamps to subtotal', () => {
  const { discountTotal, total } = applyDiscount(400, makePromo('fixed', 500));
  expect(discountTotal).toBe(400);
  expect(total).toBe(0);
});

test('no promo yields zero discount', () => {
  const { discountTotal, total } = applyDiscount(12345, null as any);
  expect(discountTotal).toBe(0);
  expect(total).toBe(12345);
});
