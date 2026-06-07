# Services (Master Data)

Admin only. Requires role: `admin`.

Base path: `/api/services`

---

## Database Schema: `services`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigint unsigned | Primary key, auto-increment |
| `service_name` | varchar(255) | Required |
| `price` | decimal(10,2) | Required, >= 0 |
| `unit` | varchar(20) | Required, values: `Kg`, `Pcs` |
| `status` | enum('active', 'inactive') | Default: 'active' |

---

## List Services

```
GET /api/services
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
    "service_name": "Cuci Kering Setrika",
    "price": "8000.00",
    "unit": "Kg",
      "status": "active",
      "created_at": "2026-05-12T04:54:02.000000Z",
      "updated_at": "2026-05-12T04:54:02.000000Z"
    },
    {
      "id": 2,
      "service_name": "Jas / Blazer",
      "price": "25000.00",
      "unit": "Pcs",
      "status": "active",
      "created_at": "2026-05-12T04:54:02.000000Z",
      "updated_at": "2026-05-12T04:54:02.000000Z"
    }
  ]
}
```

---

## Create Service

```
POST /api/services
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `service_name` | string | yes | max 255 |
| `price` | number | yes | >= 0 |
| `unit` | string | yes | Must be `Kg` or `Pcs` |
| `status` | string | no | Must be `active` or `inactive` (default: `active`) |

### Example

```json
{
  "service_name": "Cuci Kering Setrika",
  "price": 8000,
  "unit": "Kg",
  "status": "active"
}
```

### Response `201 Created`

```json
{
  "message": "Service created successfully",
  "data": {
    "id": 3,
    "service_name": "kiloan",
    "price": "8000.00",
    "unit": "kiloan",
    "status": "active",
    "created_at": "2026-06-07T17:06:04.000000Z",
    "updated_at": "2026-06-07T17:06:04.000000Z"
  }
}
```

---

## Show Service

```
GET /api/services/{service}
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "service_name": "kiloan",
    "price": "8000.00",
    "unit": "kiloan",
    "status": "active",
    "created_at": "2026-05-12T04:54:02.000000Z",
    "updated_at": "2026-05-12T04:54:02.000000Z"
  }
}
```

---

## Update Service

```
PUT /api/services/{service}
```

**Auth:** Bearer token (admin)

**Content-Type:** `application/json`

Partial update allowed — all fields are optional.

### Request Body

Same fields as Create, all optional.

### Example

```json
{
  "price": 10000
}
```

### Response `200 OK`

```json
{
  "message": "Service updated successfully",
  "data": {
    "id": 1,
    "service_name": "kiloan",
    "price": "10000.00",
    "unit": "kiloan",
    "status": "active",
    "created_at": "2026-05-12T04:54:02.000000Z",
    "updated_at": "2026-06-07T17:08:16.000000Z"
  }
}
```

---

## Delete Service

```
DELETE /api/services/{service}
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "message": "Service deleted successfully"
}
```
