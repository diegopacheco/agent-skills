# Brew Shop

A coffee bean shop API: products, carts with coupons, customers and orders, backed by Postgres.

## Features

* Product catalog with pagination (`?page=0&size=20`, first page is 0)
* Product search by name
* Coupons: `SAVE10`, `WELCOME5`, `SUMMER20`, `FREESHIP`
* Free shipping on orders over $40
* Customer registration with unique emails
* Order history per customer

## How to Run

```bash
npm install
npm run dev
```

The API listens on http://localhost:3000.

## How to Test

```bash
npm run test:unit
```

## REST Endpoints

| Method | Path | What |
|---|---|---|
| GET | `/health` | health check |
| GET | `/api/products` | list products |
| GET | `/api/products/search?q=` | search products |
| GET | `/api/customers/:id/orders` | orders of a customer |
| POST | `/api/orders` | place an order |
| DELETE | `/api/orders/:id` | cancel an order |
