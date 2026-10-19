class LegacyPriceFormatter {
  constructor(currency) {
    this.currency = currency;
  }

  format(amount) {
    return `${this.currency} ${Math.round(amount * 100) / 100}`;
  }
}

function legacyDiscount(price) {
  return price * 0.95;
}

module.exports = { LegacyPriceFormatter, legacyDiscount };
