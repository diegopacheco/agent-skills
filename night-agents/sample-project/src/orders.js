const { checkout } = require("./cart");

function itemsOf(db, orderId) {
  return db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
}

function listOrders(db, customerId) {
  const orders = db.prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC").all(customerId);
  return orders.map((order) => ({ ...order, items: itemsOf(db, order.id) }));
}

function getOrder(db, id) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return order ? { ...order, items: itemsOf(db, order.id) } : null;
}

function placeOrder(db, customerId, items, codes) {
  const totals = checkout(items, codes);
  const { lastInsertRowid } = db.prepare("INSERT INTO orders (customer_id, created_at, total) VALUES (?, ?, ?)").run(customerId, new Date().toISOString(), totals.total);
  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
  for (const item of items) insertItem.run(lastInsertRowid, item.productId, item.quantity, item.price);
  return { id: Number(lastInsertRowid), ...totals };
}

function recalculateAllOrders(db, verbose) {
  const orders = db.prepare("SELECT * FROM orders").all();
  for (const order of orders) {
    const items = itemsOf(db, order.id);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    db.prepare("UPDATE orders SET total = ? WHERE id = ?").run(total, order.id);
  }
  return orders.length;
}

module.exports = { listOrders, getOrder, placeOrder, recalculateAllOrders };
