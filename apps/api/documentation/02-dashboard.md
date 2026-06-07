# Dashboard & Analytics

Admin only. Requires role: `admin`.

Base path: `/api`

---

## Dashboard Summary

Get analytics summary for the dashboard.

```
GET /api/dashboard
```

**Auth:** Bearer token (admin)

### Computed Fields

| Field | Description |
|-------|-------------|
| `summary.total_revenue` | Sum of `total_price` where `payment_status = 'paid'` |
| `summary.active_orders` | Count of transactions where `status != 'diambil'` |
| `summary.total_customers` | Count of all customer records |
| `recent_transactions` | Latest 5 transactions with `customer.user` and `service` relations |
| `daily_stats` | Last 7 days grouped by date, with `count` and `revenue` (only paid transactions) |

### Response `200 OK`

```json
{
  "summary": {
    "total_revenue": 500000.00,
    "active_orders": 12,
    "total_customers": 45
  },
  "recent_transactions": [
    {
      "id": 2,
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
      "customer": {
        "id": 2,
        "user_id": 3,
        "phone": "08123456789",
        "address": "Jl. Test",
        "created_at": "2026-06-07T17:05:38.000000Z",
        "updated_at": "2026-06-07T17:05:38.000000Z",
        "user": {
          "id": 3,
          "name": "Test Customer",
          "email": "testcust@example.com",
          "role": "customer",
          "email_verified_at": null,
          "created_at": "2026-06-07T17:05:38.000000Z",
          "updated_at": "2026-06-07T17:05:38.000000Z"
        }
      },
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
  ],
  "daily_stats": [
    {
      "date": "2026-06-07",
      "count": 1,
      "revenue": "0.00"
    }
  ]
}
```
