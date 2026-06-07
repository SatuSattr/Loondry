# Error Responses

Standard error response formats across all API endpoints.

---

## 401 Unauthenticated

Returned when a request requires authentication but no valid Bearer token is provided.

```json
{
  "message": "Unauthenticated."
}
```

---

## 403 Forbidden

Returned when the authenticated user does not have the required role (e.g., non-admin accessing admin routes).

```json
{
  "message": "Unauthorized. You do not have the required role."
}
```

---

## 422 Validation Error

Returned when request body fails validation rules.

```json
{
  "message": "The email field is required. (and X more errors)",
  "errors": {
    "email": ["The email field is required."],
    "name": ["The name field must be a string."]
  }
}
```

The `errors` object maps each field name to an array of error messages.

---

## 404 Not Found

Returned when a route parameter references a non-existent resource (e.g., invalid ID).

```json
{
  "message": "No query results for model [App\\Models\\Transaction] 999"
}
```

The message contains the model class and the requested identifier.
