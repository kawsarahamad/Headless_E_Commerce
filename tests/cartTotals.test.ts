// This test exercises the pricing utility independently;
// a full integration test would require a running Mongo instance.
import { applyDiscount } from '../src/utils/pricing.js';

test('applyDiscount with percent math and rounding', () => {
  const promo: any = {
    active: true,
    startsAt: new Date(Date.now()-1000),
    endsAt: new Date(Date.now()+1000),
    type: 'percent',
    value: 7,
  };
  const res = applyDiscount(999, promo);
  expect(res.discountTotal).toBe(Math.round(999*0.07));
  expect(res.total).toBe(999 - res.discountTotal);
});
