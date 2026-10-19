const path = require("path");
const crypto = require("crypto");

const DEBUG_PREFIX = "[brew-shop]";

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function paginate(items, page, size) {
  const start = page * size;
  return { page, size, total: items.length, items: items.slice(start, start + size) };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { formatMoney, paginate, slugify, deepClone };
