const { paginate } = require("./utils");

let cacheHits = 0;

function listProducts(db) {
  return db.prepare("SELECT * FROM products ORDER BY id").all();
}

function productsPage(db, page, size) {
  return paginate(listProducts(db), page, size);
}

function productsByCategory(db, category) {
  return db.prepare("SELECT * FROM products WHERE category = ?").all(category);
}

function origins(db) {
  const all = listProducts(db);
  const unique = [];
  for (const product of all) {
    if (!unique.includes(product.origin)) unique.push(product.origin);
  }
  return unique;
}

function searchProducts(db, term) {
  const needle = term.toLowerCase();
  const matches = listProducts(db).filter((p) => p.name.toLowerCase().includes(needle) || p.origin.toLowerCase().includes(needle));
  const result = [];
  for (const product of matches) {
    if (!result.some((r) => r.id === product.id)) result.push(product);
  }
  return result;
}

module.exports = { listProducts, productsPage, productsByCategory, origins, searchProducts };
