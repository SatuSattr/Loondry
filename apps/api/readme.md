# Loondry API

Laundry in Your Pocket.

**Base URL:** `http://localhost:8000/api`

**Auth Mechanism:** Laravel Sanctum (Bearer token). Include `Authorization: Bearer {token}` header for protected routes.

---

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@loondry.com` |
| Password | `password` |
| Role | admin |

---

## Documentation Index

Each endpoint group is documented in a separate file under the `documentation/` folder.

| # | Category | File |
|---|----------|------|
| 1 | **Authentication** — login, logout, profile, update profile, update password | [`documentation/01-authentication.md`](documentation/01-authentication.md) |
| 2 | **Dashboard & Analytics** — admin dashboard summary | [`documentation/02-dashboard.md`](documentation/02-dashboard.md) |
| 3 | **Services** — CRUD master data for laundry services | [`documentation/03-services.md`](documentation/03-services.md) |
| 4 | **Customers** — CRUD master data for customer management | [`documentation/04-customers.md`](documentation/04-customers.md) |
| 5 | **Transactions** — create, list, detail, status updates, condition images, payment proof, customer's own transactions | [`documentation/05-transactions.md`](documentation/05-transactions.md) |
| 6 | **Reports** — revenue report, statistics report | [`documentation/06-reports.md`](documentation/06-reports.md) |
| 7 | **Error Responses** — standard error formats (401, 403, 422, 404) | [`documentation/07-errors.md`](documentation/07-errors.md) |
| 8 | **Entity Relationship** — database schema summary, relations, eager-loaded data | [`documentation/08-entity-relationship.md`](documentation/08-entity-relationship.md) |
| 9 | **Points & Vouchers** — loyalty points, redeem vouchers, apply discounts | [`documentation/09-points-and-vouchers.md`](documentation/09-points-and-vouchers.md) |
| 10 | **Notifications** — push notifications, device token registration, in-app notifications | [`documentation/10-notifications.md`](documentation/10-notifications.md) |

---

## Quick Route Map

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/login` | Public | - |
| POST | `/api/logout` | Sanctum | - |
| GET | `/api/profile` | Sanctum | - |
| PUT | `/api/profile` | Sanctum | - |
| PUT | `/api/profile/password` | Sanctum | - |
| POST | `/api/profile/device-token` | Sanctum | - |
| PUT | `/api/profile/customer` | Sanctum | customer |
| GET | `/api/dashboard` | Sanctum | admin |
| GET | `/api/services` | Sanctum | admin |
| POST | `/api/services` | Sanctum | admin |
| GET | `/api/services/{service}` | Sanctum | admin |
| PUT | `/api/services/{service}` | Sanctum | admin |
| DELETE | `/api/services/{service}` | Sanctum | admin |
| GET | `/api/customers` | Sanctum | admin |
| POST | `/api/customers` | Sanctum | admin |
| GET | `/api/customers/{customer}` | Sanctum | admin |
| PUT | `/api/customers/{customer}` | Sanctum | admin |
| DELETE | `/api/customers/{customer}` | Sanctum | admin |
| GET | `/api/transactions` | Sanctum | admin |
| POST | `/api/transactions` | Sanctum | admin |
| GET | `/api/transactions/{transaction}` | Sanctum | - |
| PUT | `/api/transactions/{transaction}/status` | Sanctum | admin |
| POST | `/api/transactions/{transaction}/condition-images` | Sanctum | admin |
| POST | `/api/transactions/{transaction}/payment` | Sanctum | - |
| GET | `/api/transactions/{transaction}/receipt` | Sanctum | - |
| GET | `/api/status-laundry` | Sanctum | customer |
| GET | `/api/reports/revenue` | Sanctum | admin |
| GET | `/api/reports/statistics` | Sanctum | admin |
| GET | `/api/points` | Sanctum | - |
| POST | `/api/vouchers/redeem` | Sanctum | - |
| GET | `/api/vouchers` | Sanctum | - |
| GET | `/api/vouchers/check/{voucher_code}` | Sanctum | - |
| POST | `/api/transactions/{transaction}/apply-voucher` | Sanctum | admin |
| GET | `/api/admin/vouchers` | Sanctum | admin |
| GET | `/api/vouchers-templates` | Sanctum | admin |
| POST | `/api/vouchers-templates` | Sanctum | admin |
| GET | `/api/vouchers-templates/{template}` | Sanctum | admin |
| PUT | `/api/vouchers-templates/{template}` | Sanctum | admin |
| DELETE | `/api/vouchers-templates/{template}` | Sanctum | admin |
| POST | `/api/admin/notifications` | Sanctum | admin |
| GET | `/api/notifications` | Sanctum | - |
| POST | `/api/notifications/{notification}/read` | Sanctum | - |
