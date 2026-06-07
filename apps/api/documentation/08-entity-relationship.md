# Entity Relationship Summary

```
User (1) ──── hasOne ──── Customer (1)
  │                           │
  │                           │ hasMany
  │                           ▼
  │ ── hasMany ──> Transaction ──── belongsTo ──── Service
  │                    │
  │                    │ hasMany
  │                    ├── TransactionLog
  │                    └── TransactionImage
  │
  └── role: 'admin' or 'customer'
```

---

## Entity Descriptions

### User

- Can be either `admin` or `customer` (determined by `role` column)
- Admin users have no corresponding `Customer` record
- Customer users must have exactly one linked `Customer` record

### Customer

- Profile extension for users with role `customer`
- Stores `phone` and `address` specific to laundry service
- Linked to `User` via `user_id` foreign key

### Service

- Laundry service types with pricing
- Examples: Kiloan (per Kg), Satuan (per piece)
- Independent entity not directly tied to User/Customer

### Transaction

- Core business entity representing a laundry order
- Always created by an `admin` on behalf of a `customer`
- References exactly one `Service` for pricing
- Has a computed `total_price = service.price * weight`

### TransactionLog

- Audit trail for every status change on a transaction
- Each time status changes, a new log entry is created
- Allows tracking the full history: antrian -> dicuci -> disetrika -> siap diambil -> diambil

### TransactionImage

- Condition photos uploaded by admin when receiving laundry
- Multiple images per transaction allowed
- Stored in `storage/app/public/transaction_conditions/`

---

## Invoice Code

Format: `LND-YYYYMMDD-NNN`

- `LND` — Prefix (Loondry)
- `YYYYMMDD` — Date of creation
- `NNN` — Zero-padded sequential ID (001, 002, ...)

Example: `LND-20260607-001`

---

## Eager-Loaded Relations by Endpoint

| Endpoint | Relations Loaded |
|----------|-----------------|
| `GET /api/profile` | `user` + `customer` (if role = customer) |
| `GET /api/dashboard` | `transaction` + `customer.user` + `service` |
| `GET /api/customers` | `customer` + `user` |
| `GET /api/customers/{id}` | `customer` + `user` |
| `GET /api/transactions` | `transaction` + `customer.user` + `admin` + `service` + `logs` + `images` |
| `GET /api/transactions/{id}` | `transaction` + `customer.user` + `admin` + `service` + `logs` + `images` |
| `GET /api/status-laundry` | `transaction` + `service` (only) |
