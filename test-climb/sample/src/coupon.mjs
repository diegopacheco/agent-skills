export function parseCoupon(code) {
  const match = /^([A-Z]+)(\d{1,2})$/.exec(code.trim().toUpperCase());
  if (!match) {
    return null;
  }
  return { name: match[1], percent: Number(match[2]) };
}

export function isExpired(coupon, today) {
  return today > coupon.expiresAt;
}

export function applyCoupon(amount, coupon, today) {
  if (!coupon || isExpired(coupon, today)) {
    return amount;
  }
  return amount - amount * coupon.percent / 100;
}
