# Employee Management System — REST API Documentation

Comprehensive reference documentation for the Employee Management System REST API.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://<YOUR-RENDER-APP>.onrender.com/api`
- **Default Format**: `application/json`

---

## 1. System Health Endpoint

### `GET /api/health`
Check the operational status of the API server and database connectivity.

#### Response: `200 OK`
```json
{
  "status": "healthy",
  "service": "employee-management-api"
}
```

#### Example cURL
```bash
curl -X GET http://localhost:5000/api/health
```

---

## 2. Employee Endpoints

### `GET /api/employees`
Retrieve a list of employees with optional search query and department filter. Ordered by newest first.

#### Query Parameters:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `search` | string | No | Case-insensitive substring search matching employee `name` or `email`. |
| `department` | string | No | Filter by exact department (`IT`, `QA`, `HR`, `Finance`, `Engineering`, `Operations`, `Marketing`). |

#### Response: `200 OK`
```json
{
  "count": 2,
  "employees": [
    {
      "id": 1,
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "department": "IT",
      "salary": 75000.0,
      "created_at": "2026-08-16T14:20:00.000000+00:00",
      "updated_at": "2026-08-16T14:20:00.000000+00:00"
    },
    {
      "id": 2,
      "name": "Priya Patel",
      "email": "priya.patel@example.com",
      "department": "Engineering",
      "salary": 92000.0,
      "created_at": "2026-08-16T14:21:00.000000+00:00",
      "updated_at": "2026-08-16T14:21:00.000000+00:00"
    }
  ]
}
```

#### Example cURL
```bash
# Get all employees
curl -X GET http://localhost:5000/api/employees

# Search and filter
curl -X GET "http://localhost:5000/api/employees?search=Rahul&department=IT"
```

---

### `GET /api/employees/<id>`
Retrieve complete profile details for a single employee.

#### Parameters:
- `id` (integer, required): Unique identifier of the employee.

#### Response: `200 OK`
```json
{
  "employee": {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "department": "IT",
    "salary": 75000.0,
    "created_at": "2026-08-16T14:20:00.000000+00:00",
    "updated_at": "2026-08-16T14:20:00.000000+00:00"
  }
}
```

#### Error Response: `404 Not Found`
```json
{
  "error": "Employee not found with ID 9999"
}
```

#### Example cURL
```bash
curl -X GET http://localhost:5000/api/employees/1
```

---

### `POST /api/employees`
Create a new employee record.

#### Request Headers:
`Content-Type: application/json`

#### Request Body Schema:
| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | 1-100 characters, non-whitespace |
| `email` | string | Yes | Valid RFC 5322 email regex, unique |
| `department` | string | Yes | One of: `IT`, `QA`, `HR`, `Finance`, `Engineering`, `Operations`, `Marketing` |
| `salary` | number | Yes | Positive numeric value (>= 0) |

#### Example Request:
```json
{
  "name": "Amit Verma",
  "email": "amit.verma@example.com",
  "department": "QA",
  "salary": 65000
}
```

#### Response: `201 Created`
```json
{
  "message": "Employee created successfully",
  "employee": {
    "id": 3,
    "name": "Amit Verma",
    "email": "amit.verma@example.com",
    "department": "QA",
    "salary": 65000.0,
    "created_at": "2026-08-16T14:25:00.000000+00:00",
    "updated_at": "2026-08-16T14:25:00.000000+00:00"
  }
}
```

#### Error Response: `400 Bad Request` (Validation Failure)
```json
{
  "error": "Validation failed for one or more fields.",
  "errors": {
    "name": "Name is required.",
    "email": "Invalid email format. Provide a valid email address.",
    "salary": "Salary cannot be negative."
  }
}
```

#### Error Response: `409 Conflict` (Duplicate Email)
```json
{
  "error": "Duplicate email address detected.",
  "errors": {
    "email": "Email 'amit.verma@example.com' is already registered to another employee."
  }
}
```

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amit Verma",
    "email": "amit.verma@example.com",
    "department": "QA",
    "salary": 65000
  }'
```

---

### `PUT /api/employees/<id>`
Update an existing employee record.

#### Parameters:
- `id` (integer, required): Unique identifier of employee to update.

#### Request Body Schema:
Same as `POST /api/employees`.

#### Example Request:
```json
{
  "name": "Amit S. Verma",
  "email": "amit.verma@example.com",
  "department": "QA",
  "salary": 72000
}
```

#### Response: `200 OK`
```json
{
  "message": "Employee updated successfully",
  "employee": {
    "id": 3,
    "name": "Amit S. Verma",
    "email": "amit.verma@example.com",
    "department": "QA",
    "salary": 72000.0,
    "created_at": "2026-08-16T14:25:00.000000+00:00",
    "updated_at": "2026-08-16T14:30:00.000000+00:00"
  }
}
```

#### Error Response: `404 Not Found`
```json
{
  "error": "Employee not found with ID 9999"
}
```

#### Example cURL
```bash
curl -X PUT http://localhost:5000/api/employees/3 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amit S. Verma",
    "email": "amit.verma@example.com",
    "department": "QA",
    "salary": 72000
  }'
```

---

### `DELETE /api/employees/<id>`
Delete an employee record from the database.

#### Parameters:
- `id` (integer, required): Unique identifier of employee to remove.

#### Response: `200 OK`
```json
{
  "message": "Employee deleted successfully",
  "id": 3
}
```

#### Error Response: `404 Not Found`
```json
{
  "error": "Employee not found with ID 9999"
}
```

#### Example cURL
```bash
curl -X DELETE http://localhost:5000/api/employees/3
```

---

## 3. Centralized HTTP Status Codes Summary

| Status Code | Reason | Meaning |
|---|---|---|
| `200 OK` | Success | Request succeeded (GET, PUT, DELETE). |
| `201 Created` | Created | New employee record successfully created (POST). |
| `400 Bad Request` | Client Error | Missing required fields, invalid types, or malformed JSON. |
| `404 Not Found` | Not Found | Resource ID does not exist in database. |
| `405 Method Not Allowed` | Method Error | HTTP verb not supported on route. |
| `409 Conflict` | Conflict | Email already registered to another employee. |
| `500 Internal Server Error` | Server Error | Unhandled server exception (stack trace concealed). |
