# 10. Notifications API

Manage push notifications, device tokens, and in-app notifications history for customers.

---

## 1. Register/Update Device Token

Update the Expo Push Token of the user's mobile device to receive push notifications.

- **URL:** `/api/profile/device-token`
- **Method:** `POST`
- **Auth:** Sanctum (Bearer Token)
- **Content-Type:** `application/json`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `device_token` | `string` | Yes (nullable) | The Expo Push Token fetched on the device. Send `null` to clear. |

### Request Example
```json
{
  "device_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Response Example (200 OK)
```json
{
  "message": "Device token updated successfully."
}
```

---

## 2. Get Notification History

Retrieve the list of all notifications sent to the authenticated customer.

- **URL:** `/api/notifications`
- **Method:** `GET`
- **Auth:** Sanctum (Bearer Token)

### Response Example (200 OK)
```json
{
  "data": [
    {
      "id": 5,
      "user_id": 3,
      "title": "Order Ready for Pickup!",
      "content": "Your Dry Cleaning order of 3 kg (Invoice: INV-20260614001) is ready for pickup!",
      "image_path": null,
      "is_read": false,
      "created_at": "2026-06-14T17:03:00.000000Z",
      "updated_at": "2026-06-14T17:03:00.000000Z"
    }
  ]
}
```

---

## 3. Mark Notification as Read

Mark a specific in-app notification as read.

- **URL:** `/api/notifications/{notification}/read`
- **Method:** `POST`
- **Auth:** Sanctum (Bearer Token)

### Response Example (200 OK)
```json
{
  "message": "Notification marked as read.",
  "data": {
    "id": 5,
    "user_id": 3,
    "is_read": true,
    ...
  }
}
```

---

## 4. Admin: Send Targeted Broadcasts

Broadcast targeted push notifications and/or in-app notifications to custom audience segments based on demographic criteria.

- **URL:** `/api/admin/notifications`
- **Method:** `POST`
- **Auth:** Sanctum (Bearer Token)
- **Role:** `admin`
- **Content-Type:** `multipart/form-data` (since it supports optional image uploads)

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Title of the notification. |
| `content` | `string` | Yes | Message body. |
| `image` | `file` | No | Banner image (PNG, JPG, WEBP. Max 2MB). |
| `is_in_app` | `boolean`/`string` | No | Defaults to `true`. Set to `false` to disable saving in app inbox history. |
| `is_push` | `boolean`/`string` | No | Defaults to `true`. Set to `false` to disable push notification alerts. |
| `genders` | `array` | No | Array of targeted genders (`L` or `P`). |
| `religions` | `array` | No | Array of targeted religions (case-insensitive). |
| `min_age` | `integer` | No | Minimum age of targeted customers. |
| `max_age` | `integer` | No | Maximum age of targeted customers. |

*Note: At least one of `is_in_app` or `is_push` must be active.*

### Response Example (201 Created)
```json
{
  "message": "Notification sent successfully to 12 customer(s).",
  "recipients_count": 12
}
```

---

## 5. Automatic Trigger: Order Ready Notification

Whenever an order status changes to `'siap diambil'` (ready for pickup) in the backend:
- The system automatically creates an **In-App Notification** record.
- If the customer has registered a `device_token`, a **Push Notification** is automatically dispatched to the customer's phone through the Expo Push API.
