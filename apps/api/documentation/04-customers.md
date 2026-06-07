# Customers (Master Data)

Admin only. Requires role: `admin`.

Base path: `/api/customers`

---

## Database Schema

A customer is represented by two tables: `users` (shared auth) + `customers` (profile).

### `users` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key, auto-increment |
| `name` | varchar(255) | Required |
| `email` | varchar(255) | Required, unique |
| `password` | varchar(255) | Required, hashed |
| `role` | enum('admin','customer') | Default: 'customer' |
| `birth_date` | date | Nullable |
| `religion` | varchar(50) | Nullable |
| `gender` | enum('L','P') | Nullable (L = Male, P = Female) |
| `email_verified_at` | timestamp | Nullable |
| `verification_code` | varchar(6) | Nullable |

### `customers` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key, auto-increment |
| `user_id` | bigint unsigned | Foreign key -> `users.id`, on delete cascade |
| `phone` | varchar(15) | Required |
| `address` | text | Required |

**Relationship:** `User hasOne Customer`, `Customer belongsTo User`

---

## List & Search Customers

```
GET /api/customers
```

**Auth:** Bearer token (admin)

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | no | Searches by `name`, `email` (User), or `phone` (Customer) |

### Example

```
GET /api/customers?q=budi
```

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "phone": "081234567890",
      "address": "Jl. Keadilan No. 12, Bogor",
      "created_at": "2026-05-28T11:50:03.000000Z",
      "updated_at": "2026-05-28T11:50:03.000000Z",
      "user": {
        "id": 2,
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "role": "customer",
        "birth_date": "1990-01-01T00:00:00.000000Z",
        "religion": "Islam",
        "gender": "L",
        "email_verified_at": null,
        "created_at": "2026-05-28T11:50:03.000000Z",
        "updated_at": "2026-05-28T11:50:03.000000Z"
      }
    }
  ]
}
```

---

## Create Customer

Creates both a `User` (role: customer) and a `Customer` record in a single transaction. An 8-character password is auto-generated and sent to the customer's email.

```
POST /api/customers
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | max 255 |
| `email` | string | yes | valid email, max 255, unique in `users` |
| `phone` | string | yes | max 15 |
| `address` | string | yes | - |
| `birth_date` | string (date) | no | Format: `Y-m-d` |
| `religion` | string | no | max 50 |
| `gender` | string | no | Must be `L` (Male) or `P` (Female) |
| `password` | string | no | min 8. If omitted, system generates random 8-char password |

### Example

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "address": "Jl. Merdeka",
  "birth_date": "1990-01-01",
  "religion": "Islam",
  "gender": "L"
}
```

### Response `201 Created`

```json
{
  "message": "Customer created successfully and credentials sent to email.",
  "data": {
    "id": 2,
    "user_id": 3,
    "phone": "08123456789",
    "address": "Jl. Merdeka",
    "created_at": "2026-06-07T17:05:38.000000Z",
    "updated_at": "2026-06-07T17:05:38.000000Z",
    "user": {
      "id": 3,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "birth_date": "1990-01-01T00:00:00.000000Z",
      "religion": "Islam",
      "gender": "L",
      "email_verified_at": "2026-06-07T17:05:38.000000Z",
      "created_at": "2026-06-07T17:05:38.000000Z",
      "updated_at": "2026-06-07T17:05:38.000000Z"
    }
  },
  "debug_password": "xqpaxZCC"
}
```

> `debug_password` is always included for admin convenience. The password is also sent to the customer's email via `CustomerCredentialMail`.

---

## Show Customer

```
GET /api/customers/{customer}
```

**Auth:** Bearer token (admin)

### Response `200 OK`

Same structure as a single item in the list response, with `user` relation loaded.

---

## Update Customer

```
PUT /api/customers/{customer}
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

Partial update allowed — all fields are optional.

### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | no | - |
| `email` | string | no | Must be unique, ignores current customer's email |
| `phone` | string | no | - |
| `address` | string | no | - |
| `birth_date` | string (date) | no | - |
| `religion` | string | no | - |
| `gender` | string | no | `L` or `P` |
| `password` | string | no | min 8. If provided, user password is updated. |

### Response `200 OK`

```json
{
  "message": "Customer updated successfully",
  "data": { ... }
}
```

---

## Delete Customer

Deletes both the `Customer` and `User` records.

```
DELETE /api/customers/{customer}
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "message": "Customer deleted successfully"
}
```
