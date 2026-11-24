# shop-api

A small shop API used as the sample project for data-dream: users, search, orders and daily revenue, with no dependencies. Its tests only cover the happy path on purpose, so data-dream has something to find.

| Route | What it does |
|---|---|
| `POST /users` | `{"name","email"}`, registers a user |
| `GET /users?q=` | searches users by name |
| `POST /orders` | `{"userId","price","qty","createdAt"}`, creates an order |
| `GET /revenue?day=YYYY-MM-DD` | revenue of one day |

```
scripts/setup.sh
scripts/start-all.sh
scripts/status.sh
scripts/test-all.sh
scripts/stop-all.sh
```

Ports live in `scripts/ports.env`.
