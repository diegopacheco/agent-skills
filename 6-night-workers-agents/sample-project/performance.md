# Performance

Measured on a laptop with 10k products and 50k orders.

| Endpoint | p50 | p95 |
|---|---|---|
| `GET /api/products` | 4 ms | 9 ms |
| `GET /api/customers/:id/orders` | 3 ms | 7 ms |
| `GET /api/reports/top-sellers` | 6 ms | 12 ms |

Every foreign key is indexed. The home page loads in under 300 KB.
