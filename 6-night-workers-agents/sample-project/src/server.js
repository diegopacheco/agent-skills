const path = require("path");
const express = require("express");
const { openDatabase } = require("./db");
const { productsPage, productsByCategory, origins, searchProducts, listProducts } = require("./products");
const { listOrders, getOrder, placeOrder } = require("./orders");
const { register } = require("./customers");
const { topSellers } = require("./reports");
const { formatMoney } = require("./utils");

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.get("/api/products", (req, res) => {
    if (req.query.page) return res.json(productsPage(db, Number(req.query.page), Number(req.query.size || 20)));
    res.json(listProducts(db));
  });

  app.get("/api/products/category/:category", (req, res) => res.json(productsByCategory(db, req.param("category"))));

  app.get("/api/origins", (req, res) => res.json(origins(db)));

  app.get("/api/search", (req, res) => res.json(searchProducts(db, String(req.query.q || ""))));

  app.get("/api/customers/:id/orders", (req, res) => res.json(listOrders(db, Number(req.param("id")))));

  app.get("/api/orders/:id", (req, res) => {
    const order = getOrder(db, Number(req.params.id));
    if (!order) return res.status(404).json({ error: "order not found" });
    res.json({ ...order, totalLabel: formatMoney(order.total) });
  });

  app.post("/api/orders", (req, res) => {
    try {
      const { customerId, items, coupons } = req.body;
      res.status(201).json(placeOrder(db, customerId, items, coupons || []));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/customers", (req, res) => {
    try {
      res.status(201).json(register(db, req.body.name, req.body.email));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reports/top-sellers", (req, res) => res.json(topSellers(db, Number(req.query.limit || 10))));

  app.get("*", (req, res) => res.status(404).json({ error: "not found" }));

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4000);
  createApp(openDatabase({ products: 2000, customers: 300, orders: 6000 })).listen(port, () => console.log(`brew-shop on http://localhost:${port}`));
}

module.exports = { createApp };
