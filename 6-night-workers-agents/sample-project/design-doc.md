# Design Doc

## Architecture Principles

* Stateless HTTP API, one process.
* Postgres is the only datastore, accessed with the `pg` driver.
* Prices are stored in cents as integers to avoid floating point errors.

## Modules

| Module | Responsibility |
|---|---|
| `src/server.js` | routes |
| `src/cart.js` | totals, coupons, shipping |
| `src/inventory.js` | stock reservation when an order is placed |
| `src/db.js` | connection pool |

## Decisions

* Coupons stack: a cart may use more than one coupon, but each coupon only once.
* Coupon expiry dates are inclusive, in the shop's local time.
* The client never sends prices, the server reads them from the catalog.

## TradeOffs

* No caching layer yet, every request reads Postgres.
