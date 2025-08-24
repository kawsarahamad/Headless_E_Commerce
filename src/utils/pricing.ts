import { Promo } from '../models/Promo.js';

export function isPromoActive(promo: Promo, at: Date = new Date()): boolean {
  return promo.active && at >= promo.startsAt && at <= promo.endsAt;
}

export function applyDiscount(subtotal: number, promo?: Promo | null): { discountTotal: number, total: number } {
  if (!promo) return { discountTotal: 0, total: subtotal };
  if (!isPromoActive(promo)) return { discountTotal: 0, total: subtotal };
  let discount = 0;
  if (promo.type === 'percent') {
    discount = Math.round(subtotal * (promo.value / 100));
  } else {
    discount = Math.min(Math.round(promo.value), subtotal);
  }
  return { discountTotal: discount, total: subtotal - discount };
}
