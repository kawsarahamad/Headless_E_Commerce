# B5 Headless E‑Commerce Backend (Node.js + TypeScript + MongoDB)

A compact, readable headless e‑commerce API featuring catalog, guest-first carts, promos, checkout to orders, input validation (Zod), consistent errors, request logging, OpenAPI docs, tests, and a seeder.

## Quickstart

```bash
# 1) Install
npm i

# 2) Configure
cp .env.example .env
# edit MONGODB_URI if needed

# 3) Seed sample data
npm run seed

# 4) Run in dev
npm run dev
# or build + start
npm run build && npm start
```

- API base: `http://localhost:${PORT||3000}`
- Docs: `GET /docs` (Swagger UI)
- Health: `GET /health`

## Design Highlights
- **Guest-first cart** via a `cartToken` (UUID). Clients store it and send `Authorization: Bearer <cartToken>` or `?cartToken=`.
- **Validation** with Zod. Consistent error shape: `{ error: { code, message, details? } }`.
- **Promos** support percent or fixed and validity window. Correct discount math w/ rounding.
- **Totals** computed using a **MongoDB aggregation pipeline** for line totals and subtotal; discount applied after aggregation.
- **Small structure**: `src/controllers`, `src/routes`, `src/models`, `src/schemas`, `src/middleware`, `src/utils`.

## Endpoints (summary)
- `GET /products` – list products (+min/max price aggregation)
- `GET /products/:id`
- `POST /carts` – create guest cart (returns `cartToken`)
- `GET /carts/me` – fetch by token
- `POST /carts/items` – add item
- `PATCH /carts/items/:itemId` – update qty
- `DELETE /carts/items/:itemId` – remove
- `POST /carts/apply-promo` – attach promo code
- `GET /carts/me/totals` – totals via aggregation
- `POST /checkout` – create order from cart
- `GET /orders/:id`
- `GET /orders` (basic management, filter by status)

See full OpenAPI at `/docs`.

## Tests
- `promoMath.test.ts` verifies percent/fixed discount math and rounding.
- `cartTotals.test.ts` checks aggregation-driven subtotal and discount application.

## Seeder
`npm run seed` inserts:
- 3 products with variants (size/color) and prices
- 2 promos (percent + fixed) with validity windows

## Notes
- This is intentionally compact; add auth/payment/shipping integrations as needed.
- Uses modern ESM build (`moduleResolution: bundler`). If using older tooling, adapt accordingly.
