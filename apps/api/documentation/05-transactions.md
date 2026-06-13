# Transactions

Base path: `/api`

---

## Database Schema

### `transactions` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key, auto-increment |
| `invoice_code` | varchar(50) | Unique, format: `LND-NNN` (sequential)|
| `admin_id` | bigint unsigned | Foreign key -> `users.id`, cascade |
| `customer_id` | bigint unsigned | Foreign key -> `customers.id`, cascade |
| `service_id` | bigint unsigned | Foreign key -> `services.id`, cascade |
| `weight` | decimal(8,2) | Required, >= 0.1 |
| `total_price` | decimal(12,2) | Auto-calculated: `service.price * weight` |
| `status` | enum | `antrian`, `dicuci`, `disetrika`, `siap diambil`, `diambil` (default: `antrian`) |
| `payment_method` | enum | `cash`, `transfer`, or `qris` |
| `payment_status` | enum | `pending` or `paid` (default: `pending`) |
| `payment_proof` | varchar(255) | Nullable, stores file path |
| `paid_at` | timestamp | Nullable |
| `points_earned` | integer | Number of points earned for the transaction |
| `discount` | decimal(12,2)| Discount amount applied |
| `voucher_code` | varchar(255) | Nullable, applied voucher code |

### Related Tables

**`transaction_logs`** — Tracks status change history.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key |
| `transaction_id` | bigint unsigned | Foreign key -> `transactions.id`, cascade |
| `status` | varchar(255) | Status value at that point in time |
| `created_at` | timestamp | - |
| `updated_at` | timestamp | - |

**`transaction_images`** — Condition photos uploaded before/during processing.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key |
| `transaction_id` | bigint unsigned | Foreign key -> `transactions.id`, cascade |
| `image_path` | varchar(255) | Storage path |
| `created_at` | timestamp | - |
| `updated_at` | timestamp | - |

---

## Create Transaction (Admin Only)

```
POST /api/transactions
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `customer_id` | integer | yes | Must reference an existing customer |
| `service_id` | integer | yes | Must reference an existing service |
| `weight` | number | yes | Minimum 0.1 |
| `payment_method` | string | conditional | Required if `payment_status` is `paid`. Optional/nullable if `payment_status` is `pending`. Must be `cash`, `transfer`, or `qris` |
| `payment_status` | string | yes | Must be `pending` or `paid` |
| `payment_proof` | file | no | Proof image required if `payment_status` is `paid` and method is `transfer` or `qris` |
| `voucher_code` | string | no | Redeemed voucher code to apply discount (only allowed when `payment_status` is `paid`) |

**Invoice code format:** `LND-NNN` (auto-generated, sequential, e.g. `LND-001`, `LND-002`)

**Total price:** `service.price * weight` (auto-calculated)

> [!IMPORTANT]
> Voucher code **cannot** be applied during creation if the `payment_status` is `pending` (returns `422`). Vouchers must be applied during payment/pelunasan (`POST /api/transactions/{id}/payment`).

### Example

```json
{
  "customer_id": 1,
  "service_id": 1,
  "weight": 2.5,
  "payment_method": "qris",
  "payment_status": "paid",
  "voucher_code": "SALE90-2-X1Y2Z3"
}
```

### Response `201 Created`

```json
{
  "message": "Transaction created successfully",
  "data": {
    "id": 1,
    "invoice_code": "LND-001",
    "admin_id": 1,
    "customer_id": 1,
    "service_id": 1,
    "weight": "2.50",
    "total_price": "20000.00",
    "status": "antrian",
    "payment_method": "qris",
    "payment_status": "paid",
    "points_earned": 20,
    "discount": "0.00",
    "voucher_code": null,
    "created_at": "2026-06-07T17:06:04.000000Z",
    "updated_at": "2026-06-07T17:06:04.000000Z",
    "customer": {
      "id": 1,
      "user_id": 2,
      "phone": "081234567890",
      "address": "Jl. Merdeka",
      "created_at": "2026-05-28T11:50:03.000000Z",
      "updated_at": "2026-05-28T11:50:03.000000Z",
      "user": { "id": 2, "name": "Budi Santoso", "email": "budi@example.com", "role": "customer" }
    },
    "service": {
      "id": 1,
      "service_name": "kiloan",
      "price": "8000.00",
      "unit": "kiloan",
      "status": "active"
    }
  }
}
```

> An initial `transaction_logs` entry with status `antrian` is automatically created.

---

## List All Transactions (Admin Only)

```
GET /api/transactions
```

**Auth:** Bearer token (admin)

### Response `200 OK`

Array of transactions with `customer.user`, `admin`, `service`, `logs`, and `images` relations loaded.

```json
{
  "data": [
    {
      "id": 1,
      "invoice_code": "LND-20260607-001",
      "admin_id": 1,
      "customer_id": 1,
      "service_id": 1,
      "weight": "2.50",
      "total_price": "20000.00",
      "status": "dicuci",
      "payment_method": "cash",
      "payment_status": "paid",
      "payment_proof": "payment_proofs/abc123.jpg",
      "paid_at": "2026-06-07T17:07:15.000000Z",
      "created_at": "2026-06-07T17:06:04.000000Z",
      "updated_at": "2026-06-07T17:07:15.000000Z",
      "customer": { "id": 1, "user_id": 2, "phone": "081234567890", "address": "...", "user": { ... } },
      "admin": { "id": 1, "name": "Admin Loondry", "email": "admin@loondry.com", "role": "admin" },
      "service": { "id": 1, "service_name": "kiloan", "price": "8000.00", "unit": "kiloan", "status": "active" },
      "logs": [
        { "id": 1, "transaction_id": 1, "status": "antrian", "created_at": "...", "updated_at": "..." },
        { "id": 2, "transaction_id": 1, "status": "dicuci", "created_at": "...", "updated_at": "..." }
      ],
      "images": [
        { "id": 1, "transaction_id": 1, "image_path": "transaction_conditions/abc.jpg", "created_at": "...", "updated_at": "..." }
      ]
    }
  ]
}
```

---

## Transaction Detail

```
GET /api/transactions/{transaction}
```

**Auth:** Bearer token (admin or the transaction's customer)

This route is outside `role:admin` middleware but inside `auth:sanctum`. Accessible by both admin and the customer who owns the transaction.

### Response `200 OK`

Same structure as a single item in the list, with `customer.user`, `admin`, `service`, `logs`, and `images` relations.

---

## My Transactions (Customer Only)

Get the authenticated customer's own transactions.

```
GET /api/status-laundry
```

**Auth:** Bearer token (customer)

Only loads the `service` relation. Returns only transactions belonging to the authenticated user's customer record.

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "invoice_code": "LND-20260607-001",
      "admin_id": 1,
      "customer_id": 2,
      "service_id": 1,
      "weight": "2.50",
      "total_price": "20000.00",
      "status": "dicuci",
      "payment_method": "cash",
      "payment_status": "pending",
      "payment_proof": null,
      "paid_at": null,
      "created_at": "2026-06-07T17:06:04.000000Z",
      "updated_at": "2026-06-07T17:06:12.000000Z",
      "service": {
        "id": 1,
        "service_name": "kiloan",
        "price": "8000.00",
        "unit": "kiloan",
        "status": "active",
        "created_at": "2026-05-12T04:54:02.000000Z",
        "updated_at": "2026-05-12T04:54:02.000000Z"
      }
    }
  ]
}
```

### Error `404`

Returned when the authenticated user has no customer profile:

```json
{
  "message": "Customer profile not found"
}
```

---

## Update Transaction Status (Admin Only)

```
PUT /api/transactions/{transaction}/status
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | yes | Must be one of: `antrian`, `dicuci`, `disetrika`, `siap diambil`, `diambil` |

### Example

```json
{
  "status": "dicuci"
}
```

### Response `200 OK`

```json
{
  "message": "Transaction status updated successfully",
  "data": {
    "id": 1,
    "invoice_code": "LND-20260607-001",
    "status": "dicuci",
    "updated_at": "2026-06-07T17:06:12.000000Z",
    "logs": [
      { "id": 1, "transaction_id": 1, "status": "antrian", "created_at": "...", "updated_at": "..." },
      { "id": 2, "transaction_id": 1, "status": "dicuci", "created_at": "...", "updated_at": "..." }
    ]
  }
}
```

> [!IMPORTANT]
> **Status Transition Rules:**
> 1. Transaksi yang sudah selesai (`status` = `diambil`) tidak dapat diubah statusnya lagi (returns `422`).
> 2. Transaksi tidak dapat diubah ke status `diambil` jika pembayaran masih tertunda (`payment_status` = `pending`) (returns `422`).
> 
> A new `transaction_logs` entry is created on each status change. If the new status equals the current status, no change is made.

---

## Upload Condition Images (Admin Only)

Upload photos showing the condition of laundry items before processing.

```
POST /api/transactions/{transaction}/condition-images
```

**Auth:** Bearer token (admin)

**Content-Type:** `multipart/form-data`

### Form Data

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `images[]` | file array | yes | Each file: image (jpg, jpeg, png), max 5MB (5120 KB) |

### Response `200 OK`

```json
{
  "message": "Condition images uploaded successfully",
  "data": [
    {
      "id": 1,
      "image_path": "transaction_conditions/abc123.jpg",
      "transaction_id": 1,
      "created_at": "2026-06-07T17:07:29.000000Z",
      "updated_at": "2026-06-07T17:07:29.000000Z"
    }
  ]
}
```

---

## Upload Payment Proof (Customer or Admin)

Upload payment proof image. Also marks the transaction as paid and sends a PDF receipt via email to the customer.

```
POST /api/transactions/{transaction}/payment
```

**Auth:** Bearer token (any authenticated user — no admin restriction)

**Content-Type:** `multipart/form-data`

### Form Data

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `payment_method` | string | conditional | Required if the transaction does not have a payment method saved yet. Must be one of `cash`, `transfer`, or `qris`. |
| `payment_proof` | file | conditional | Required if the chosen payment method is `transfer` or `qris`. Optional/nullable only if `payment_method` is `cash`. Image (jpg, jpeg, png), max 2MB (2048 KB). |
| `voucher_code` | string | no | Redeemed voucher code to apply discount during payment pelunasan. |

### Response `200 OK`

```json
{
  "message": "Payment proof uploaded, points awarded, and receipt sent to email successfully",
  "data": {
    "id": 1,
    "invoice_code": "LND-001",
    "payment_proof": "payment_proofs/abc123.jpg",
    "payment_status": "paid",
    "points_earned": 20,
    "discount": "0.00",
    "voucher_code": null,
    "paid_at": "2026-06-07T17:07:15.000000Z",
    "updated_at": "2026-06-07T17:07:15.000000Z",
    "customer": { ... },
    "admin": { ... },
    "service": { ... }
  }
}
```

> When payment is uploaded:
> 1. `payment_proof` is stored to `storage/app/public/payment_proofs/` (if uploaded).
> 2. `payment_status` is set to `paid`.
> 3. `paid_at` is set to current timestamp.
> 4. If `voucher_code` is provided and valid, discount is calculated and applied to the transaction. If the transaction has already applied a voucher, returns `422`.
> 5. Points are recalculated based on the actual paid amount after discount and awarded to the customer's user account.
> 6. A PDF receipt is generated and sent via `TransactionReceiptMail` to the customer's email.
> 7. If a previous payment proof exists, it is deleted.

---

## Print Receipt (PDF Download)

Download a PDF receipt for a transaction.

```
GET /api/transactions/{transaction}/receipt
```

**Auth:** Bearer token (admin or customer)

### Response `200 OK`

Returns a PDF file download with `Content-Type: application/pdf`.

The receipt includes:
- Invoice number, date, admin name
- Customer name, phone, payment method
- Service description, weight/quantity, unit price, subtotal
- Total amount (LUNAS status)

### Example

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/transactions/1/receipt \
  --output receipt-LND-001.pdf
```
