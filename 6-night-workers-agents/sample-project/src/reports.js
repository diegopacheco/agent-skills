function topSellers(db, limit) {
  const products = db.prepare("SELECT * FROM products").all();
  const items = db.prepare("SELECT * FROM order_items").all();
  const ranking = [];
  for (const product of products) {
    let sold = 0;
    for (const item of items) {
      if (item.product_id === product.id) sold += item.quantity;
    }
    ranking.push({ id: product.id, name: product.name, sold });
  }
  ranking.sort((a, b) => b.sold - a.sold);
  return ranking.slice(0, limit);
}

module.exports = { topSellers };
