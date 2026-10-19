const { DatabaseSync } = require("node:sqlite");

const CATEGORIES = ["espresso", "filter", "decaf", "single-origin", "blend"];
const ORIGINS = ["Brazil", "Colombia", "Ethiopia", "Kenya", "Guatemala", "Peru", "Rwanda", "Honduras"];

function createSchema(db) {
  db.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      origin TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    );
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      created_at TEXT NOT NULL,
      total REAL NOT NULL
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);
}

function seed(db, size) {
  const products = size.products;
  const insertProduct = db.prepare("INSERT INTO products (name, category, origin, price, stock) VALUES (?, ?, ?, ?, ?)");
  for (let i = 1; i <= products; i++) {
    insertProduct.run(`Bean ${i}`, CATEGORIES[i % CATEGORIES.length], ORIGINS[i % ORIGINS.length], 8 + (i % 17) + 0.99, 10 + (i % 40));
  }
  const insertCustomer = db.prepare("INSERT INTO customers (name, email) VALUES (?, ?)");
  for (let i = 1; i <= size.customers; i++) insertCustomer.run(`Customer ${i}`, `customer${i}@brew.shop`);
  const insertOrder = db.prepare("INSERT INTO orders (customer_id, created_at, total) VALUES (?, ?, ?)");
  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
  db.exec("BEGIN");
  for (let i = 1; i <= size.orders; i++) {
    const { lastInsertRowid } = insertOrder.run(1 + (i % size.customers), new Date(Date.UTC(2026, 0, 1 + (i % 280))).toISOString(), 0);
    for (let k = 0; k < 3; k++) {
      const productId = 1 + ((i * 7 + k * 13) % products);
      insertItem.run(lastInsertRowid, productId, 1 + (k % 2), 9.99);
    }
  }
  db.exec("COMMIT");
}

function openDatabase(size = { products: 200, customers: 50, orders: 500 }) {
  const db = new DatabaseSync(":memory:");
  createSchema(db);
  seed(db, size);
  return db;
}

module.exports = { openDatabase };
