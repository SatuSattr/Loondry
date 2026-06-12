# Points & Vouchers

Loyalty system: earn points on paid transactions, redeem points for discount vouchers.

## Points Rule

| Config | Value | Description |
|--------|-------|-------------|
| `points.earn_rate` | 1 | Points earned per threshold |
| `points.earn_per` | 1000 | IDR threshold per earn |
| `points.redeem_rate` | 100 | Points needed per 1 IDR discount |
| `points.voucher_prefix` | VCH | Prefix for generated voucher codes |

Example: Transaction of **Rp 40.000** earns **40 points**. Redeeming **100 points** gives a voucher worth **Rp 1**.

---

## Endpoints

### `GET /api/points`

View points balance and redemption history.

**Auth:** Sanctum (any role)

**Response `200`:**

```json
{
    "points": 84,
    "redemption_history": [
        {
            "id": 1,
            "voucher_code": "VCHABC123",
            "points_spent": 50,
            "discount_value": 0.50,
            "is_used": false,
            "created_at": "2026-06-09T03:20:00.000000Z"
        }
    ]
}
```

---

### `POST /api/vouchers/redeem`

Redeem customer's loyalty points for a voucher from the catalog.

**Auth:** Sanctum (any role)

**Request:**

```json
{
    "voucher_id": 1,
    "customer_id": 2
}
```
*Note: `customer_id` is optional. If provided, the admin/operator is redeeming on behalf of that customer, deducting points from that customer's user account.*

**Response `201`:**

```json
{
    "message": "Voucher redeemed successfully",
    "data": {
        "id": 1,
        "user_id": 2,
        "voucher_id": 1,
        "voucher_code": "SALE90-ABCXYZ",
        "points_spent": 50,
        "discount_value": 90.00,
        "is_used": false,
        "voucher": {
            "id": 1,
            "code": "SALE90",
            "name": "SALE90 - 90% Off s.d Rp 30k",
            "discount_type": "percentage",
            "discount_value": 90.00,
            "max_discount": 30000.00,
            "points_cost": 50,
            "start_date": "2026-06-11",
            "end_date": "2026-06-20",
            "status": "active"
        }
    }
}
```

**Errors:**

| Code | Condition |
|------|-----------|
| 400 | `Voucher is not active` — the template is disabled |
| 400 | `Voucher period has not started yet` / `Voucher period has expired` — outside date validity range |
| 400 | `Points insufficient` — customer has fewer points than template `points_cost` |

---

### `GET /api/vouchers`

List customer's **unused** vouchers only.

**Auth:** Sanctum (any role)

**Query Parameters (optional, for Admins/Operators only):**
*   `user_id`: List vouchers belonging to a specific User ID.
*   `customer_id`: List vouchers belonging to a specific Customer ID.

**Response `200`:**

```json
{
    "data": [
        {
            "id": 1,
            "user_id": 2,
            "voucher_id": 1,
            "voucher_code": "SALE90-ABCXYZ",
            "points_spent": 50,
            "discount_value": 90.00,
            "is_used": false,
            "voucher": {
                "id": 1,
                "code": "SALE90",
                "name": "SALE90 - 90% Off s.d Rp 30k"
            }
        }
    ]
}
```

---

### `POST /api/transactions/{transaction}/apply-voucher`

Apply a redeemed voucher code to a transaction in the POS. Discount is dynamically calculated and deducted from `total_price`. Marks the coupon code as `is_used = true`.

**Auth:** Sanctum (admin/operator)

**Request:**

```json
{
    "voucher_code": "SALE90-ABCXYZ"
```

**Response `200`:**

```json
{
    "message": "Voucher applied successfully",
    "data": {
        "id": 1,
        "invoice_code": "LND-001",
        "total_price": "80000.00",
        "discount": "30000.00",
        "voucher_code": "SALE90-ABCXYZ"
    }
}
```

**Discount Calculation Rules:**
1.  **Flat Discount**: Deducts the static amount (`discount_value`) from the transaction subtotal.
2.  **Percentage Discount**: Calculates discount as `total_price * (discount_value / 100)`. If `max_discount` is specified, it caps the discount at that amount.
3.  **Min Transaction Check**: If the template requires a `min_transaction` amount, the transaction's subtotal must be greater than or equal to this limit, otherwise it throws a `400` error.
4.  **Expiry Check**: Verifies if the current date is within the `start_date` and `end_date` bounds.

**Errors:**

| Code | Condition |
|------|-----------|
| 400 | `Voucher has expired` or `Voucher is not valid yet` |
| 400 | `Minimum transaction required to use this voucher is Rp X` |
| 403 | `Voucher belongs to another customer` |
| 404 | `Voucher not found or already used` |

---

### `GET /api/admin/vouchers`

Admin-only: list **all** redeemed customer vouchers with user details.

**Auth:** Sanctum (admin)

**Response `200`:**

```json
{
    "data": [
        {
            "id": 1,
            "user_id": 2,
            "voucher_id": 1,
            "voucher_code": "SALE90-ABCXYZ",
            "points_spent": 50,
            "discount_value": 90.00,
            "is_used": true,
            "used_at": "2026-06-11T06:17:27.000000Z",
            "user": {
                "id": 2,
                "name": "Test Customer",
                "email": "customer@test.com"
            },
            "voucher": {
                "id": 1,
                "code": "SALE90",
                "name": "SALE90 - 90% Off s.d Rp 30k"
            }
        }
    ]
}
```

---

## Voucher Templates CRUD

Manage the points-exchange catalog templates.

### `GET /api/vouchers-templates`
List all templates. Pass query param `?status=active` to filter.

### `POST /api/vouchers-templates`
Create a new template.
**Payload:**
```json
{
    "code": "MEGA20",
    "name": "MEGA20 - 20% Off min 300k",
    "description": "Diskon 20% tanpa batas, min transaction 300k",
    "discount_type": "percentage",
    "discount_value": 20,
    "max_discount": null,
    "min_transaction": 300000,
    "points_cost": 100,
    "start_date": "2026-06-11",
    "end_date": "2026-06-30",
    "status": "active"
}
```

### `GET /api/vouchers-templates/{id}`
Show details of a single template.

### `PUT /api/vouchers-templates/{id}`
Update a template.

### `DELETE /api/vouchers-templates/{id}`
Delete a template.

---

## How Points Earned

1. Admin creates transaction via `POST /api/transactions`
2. System calculates `points_earned = floor(total_price / 1000) * 1`
3. When customer uploads payment proof via `POST /api/transactions/{id}/payment`, points are added to customer's user account
4. Points appear in customer's `GET /api/points` response and admin dashboard

## Receipt PDF

When a voucher discount has been applied, the receipt PDF (`GET /api/transactions/{id}/receipt`) shows:
- Original total
- Discount amount (if any)
- Total after discount
