# REST API (base: `http://localhost:5000`)

## Public
- `GET /api/health`
- `GET /api/settings/business`
- `GET /api/plans`, `GET /api/plans/:id`, `GET /api/plans/addons`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/otp/request`
- `POST /api/support/contact`

## Customer (Bearer token)
- `/api/auth/me`, addresses, subscriptions, payments, orders, holidays, support tickets, notifications

## Admin (Bearer token, role `admin`)
- `/api/admin/dashboard`, customers, plans, addons, orders, payments, kitchen, settings, support

## Mock payments (development)
1. `POST /api/payments/initiate` with `idempotencyKey`
2. `POST /api/payments/mock/confirm` with `simulateSuccess: true|false`

Subscriptions activate only after **verified** successful advance payment on the server.
