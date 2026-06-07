# Authentication

Base path: `/api`

---

## Login

Authenticate user credentials and return a Sanctum token.

```
POST /api/login
```

**Auth:** None (public)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | yes | User email |
| `password` | string | yes | User password |

### Example

```json
{
  "email": "admin@loondry.com",
  "password": "password"
}
```

### Response `200 OK`

```json
{
  "message": "Login success",
  "access_token": "1|abc123...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin Loondry",
    "email": "admin@loondry.com",
    "role": "admin",
    "birth_date": null,
    "religion": null,
    "gender": null,
    "email_verified_at": "2026-06-07T00:00:00.000000Z",
    "created_at": "2026-06-07T00:00:00.000000Z",
    "updated_at": "2026-06-07T00:00:00.000000Z"
  }
}
```

### Error `422`

```json
{
  "message": "These credentials do not match our records.",
  "errors": {
    "email": ["These credentials do not match our records."]
  }
}
```

---

## Logout

Revoke the current access token.

```
POST /api/logout
```

**Auth:** Bearer token

**Headers:** `Authorization: Bearer {token}`

### Response `200 OK`

```json
{
  "message": "Logout success"
}
```

---

## Get Profile

Get the authenticated user's profile with optional customer relation.

```
GET /api/profile
```

**Auth:** Bearer token

### Response `200 OK` (admin)

```json
{
  "user": {
    "id": 1,
    "name": "Admin Loondry",
    "email": "admin@loondry.com",
    "role": "admin",
    "birth_date": null,
    "religion": null,
    "gender": null,
    "email_verified_at": "2026-06-07T00:00:00.000000Z",
    "created_at": "2026-06-07T00:00:00.000000Z",
    "updated_at": "2026-06-07T00:00:00.000000Z",
    "customer": null
  }
}
```

### Response `200 OK` (customer)

When the user has role `customer`, the `customer` field contains the Customer model record:

```json
{
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
    "updated_at": "2026-05-28T11:50:03.000000Z",
    "customer": {
      "id": 1,
      "user_id": 2,
      "phone": "081234567890",
      "address": "Jl. Keadilan No. 12, Bogor",
      "created_at": "2026-05-28T11:50:03.000000Z",
      "updated_at": "2026-05-28T11:50:03.000000Z"
    }
  }
}
```

---

## Update Profile

Update the authenticated user's name and email.

```
PUT /api/profile
```

**Auth:** Bearer token

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | max 255 |
| `email` | string | yes | valid email, max 255, unique in `users` table |

### Example

```json
{
  "name": "Admin Loondry",
  "email": "admin@loondry.com"
}
```

### Response `200 OK`

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Admin Loondry",
    "email": "admin@loondry.com",
    "role": "admin",
    "email_verified_at": "2026-06-07T00:00:00.000000Z",
    "created_at": "2026-06-07T00:00:00.000000Z",
    "updated_at": "2026-06-07T00:00:00.000000Z"
  }
}
```

> If email changes, `email_verified_at` is set to null and the response includes: `"Profile updated successfully. Please verify your new email."`

---

## Update Password

Update the authenticated user's password. Current password must be verified.

```
PUT /api/profile/password
```

**Auth:** Bearer token

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `current_password` | string | yes | Must match current password |
| `password` | string | yes | min 8 chars |
| `password_confirmation` | string | yes | Must match `password` |

### Example

```json
{
  "current_password": "password",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

### Response `200 OK`

```json
{
  "message": "Password updated successfully"
}
```

### Error `422`

```json
{
  "message": "The provided password does not match your current password.",
  "errors": {
    "current_password": ["The provided password does not match your current password."]
  }
}
```

---

## Update Customer Profile (Customer Self-Service)

Customer can update their own name, phone, and address.

```
PUT /api/profile/customer
```

**Auth:** Bearer token (customer)

### Request Body

All fields are optional (partial update).

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | no | max 255 |
| `phone` | string | no | max 15 |
| `address` | string | no | - |

### Example

```json
{
  "name": "Budi Santoso",
  "phone": "081234567890",
  "address": "Jl. Baru No. 1, Bogor"
}
```

### Response `200 OK`

```json
{
  "message": "Profile updated successfully",
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
    "updated_at": "2026-05-28T11:50:03.000000Z",
    "customer": {
      "id": 1,
      "user_id": 2,
      "phone": "081234567890",
      "address": "Jl. Baru No. 1, Bogor",
      "created_at": "2026-05-28T11:50:03.000000Z",
      "updated_at": "2026-05-28T11:50:03.000000Z"
    }
  }
}
```

### Error `404` (no customer profile)

```json
{
  "message": "Customer profile not found"
}
```
