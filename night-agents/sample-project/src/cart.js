const COUPONS = {
  SAVE10: { percent: 10, expires: "2027-12-31" },
  WELCOME5: { percent: 5, expires: "2027-06-30" },
  SUMMER20: { percent: 20, expires: "2026-08-31" },
};

const FREE_SHIPPING_FROM = 50;
const SHIPPING_FEE = 6.5;

function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function isExpired(coupon, now) {
  return new Date(coupon.expires) < now;
}

function discountPercent(codes, now) {
  let percent = 0;
  for (const code of codes) {
    const coupon = COUPONS[code];
    if (!coupon) throw new Error(`unknown coupon ${code}`);
    if (isExpired(coupon, now)) throw new Error(`coupon ${code} expired`);
    percent += coupon.percent;
  }
  return percent;
}

function shipping(amount) {
  return amount > FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

function checkout(items, codes = [], now = new Date()) {
  if (!items.length) throw new Error("cart is empty");
  const gross = subtotal(items);
  const discount = (gross * discountPercent(codes, now)) / 100;
  const net = gross - discount;
  return { subtotal: gross, discount, shipping: shipping(net), total: net + shipping(net) };
}

module.exports = { checkout, subtotal, shipping, COUPONS };
