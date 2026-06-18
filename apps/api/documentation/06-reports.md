# Reports

Admin only. Requires role: `admin`.

Base path: `/api/reports`

---

## Revenue Report

Get total revenue from all paid transactions.

```
GET /api/reports/revenue
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "total_revenue": 500000.00
}
```

> Calculated as sum of `total_price` where `payment_status = 'paid'`.

---

## Statistics Report

Get transaction counts grouped by creation date.

```
GET /api/reports/statistics
```

**Auth:** Bearer token (admin)

### Response `200 OK`

```json
{
  "statistics": [
    {
      "date": "2026-06-07",
      "count": 1
    },
    {
      "date": "2026-06-06",
      "count": 3
    }
  ]
}
```

> Groups all transactions by `DATE(created_at)`. Includes all transactions regardless of payment status. Ordered by date descending.

---

## Transactions Report

Get total transaction count from all transactions, optionally filtered by range or specific dates.

```
GET /api/reports/transactions
```

**Auth:** Bearer token (admin)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | No | Time range filter. Allowed values: `today`, `7days`, `month`, `all` (default). |
| `start_date` | string (YYYY-MM-DD) | No | Custom start date. Requires `end_date` to be specified as well. |
| `end_date` | string (YYYY-MM-DD) | No | Custom end date. Requires `start_date` to be specified as well. |

### Response `200 OK`

```json
{
  "total_transactions": 25
}
```
