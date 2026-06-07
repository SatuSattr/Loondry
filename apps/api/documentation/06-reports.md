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
