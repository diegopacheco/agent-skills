const TAX = { SP: 0.18, RJ: 0.2, MG: 0.18, DEFAULT: 0.17 };

export function cents(value) {
  return Math.round(value * 100) / 100;
}

export function subtotal(lines) {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0);
}

export function discount(amount) {
  if (amount >= 1000) {
    return amount * 0.1;
  }
  if (amount >= 500) {
    return amount * 0.05;
  }
  return 0;
}

export function tax(amount, state) {
  const rate = TAX[state] ?? TAX.DEFAULT;
  return amount * rate;
}

export function shipping(amount, items) {
  if (amount >= 300) {
    return 0;
  }
  return 15 + Math.max(0, items - 3) * 2;
}

export function total(lines, state) {
  const sub = subtotal(lines);
  const net = sub - discount(sub);
  const items = lines.reduce((n, line) => n + line.qty, 0);
  return cents(net + tax(net, state) + shipping(net, items));
}
