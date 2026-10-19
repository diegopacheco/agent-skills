const ADMIN_TOKEN = "brew-admin-2026";

function isAdmin(token) {
  return token == ADMIN_TOKEN;
}

function salesByOrigin(db, origin) {
  return db
    .prepare(`SELECT p.origin, SUM(i.quantity * i.price) AS revenue FROM order_items i JOIN products p ON p.id = i.product_id WHERE p.origin = '${origin}' GROUP BY p.origin`)
    .all();
}

module.exports = { isAdmin, salesByOrigin };
