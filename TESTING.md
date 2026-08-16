# Quality Assurance & Testing Report

## 1. Test Strategy Overview

This project implements a multi-tier testing strategy ensuring data integrity, strict input validation, security against malformed requests, and seamless frontend-to-backend REST API integration.

### Core Testing Pillars:
1. **Automated Unit & Integration Testing**: Powered by `pytest` and the Flask test client, utilizing an isolated in-memory SQLite database (`sqlite:///:memory:`) for fast, deterministic, repeatable test runs.
2. **Negative & Boundary Value Testing**: Rigorous testing against edge cases (whitespace-only strings, malformed email formats, duplicate email conflicts, negative salaries, non-numeric values, and empty/malformed JSON payloads).
3. **API Contract Verification**: Validating proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`) and uniform JSON response structures.
4. **End-to-End Frontend Validation**: Double-layer validation (client-side form validation + server-side validation error mapping) with interactive toast notifications and responsive UI state handling.
5. **Continuous Integration (CI)**: Automated GitHub Actions pipeline executing the test suite on all branch pushes and pull requests.

---

## 2. Comprehensive Test Matrix (22 Test Cases)

| ID | Test Case | Category | Input / Action | Expected Result | Automated / Manual | Status |
|---|---|---|---|---|---|---|
| **TC-01** | System Health Check | System | `GET /api/health` | HTTP `200 OK`, `{"status": "healthy", "service": "employee-management-api"}` | Automated (`test_employees.py`) | **PASSED** |
| **TC-02** | Fetch Empty Employee List | Functional | `GET /api/employees` (empty DB) | HTTP `200 OK`, `{"count": 0, "employees": []}` | Automated (`test_employees.py`) | **PASSED** |
| **TC-03** | Create Valid Employee | Functional | `POST /api/employees` with valid payload | HTTP `201 Created`, returns created employee with auto-generated ID & timestamps | Automated (`test_employees.py`) | **PASSED** |
| **TC-04** | Retrieve Employee by ID | Functional | `GET /api/employees/1` (existing) | HTTP `200 OK`, returns full employee record | Automated (`test_employees.py`) | **PASSED** |
| **TC-05** | Retrieve Non-Existent Employee | Negative | `GET /api/employees/9999` | HTTP `404 Not Found`, `{"error": "Employee not found with ID 9999"}` | Automated (`test_employees.py`) | **PASSED** |
| **TC-06** | Update Existing Employee | Functional | `PUT /api/employees/1` with updated salary & name | HTTP `200 OK`, `updated_at` refreshed, fields updated | Automated (`test_employees.py`) | **PASSED** |
| **TC-07** | Update Non-Existent Employee | Negative | `PUT /api/employees/9999` with valid payload | HTTP `404 Not Found`, `{"error": "Employee not found with ID 9999"}` | Automated (`test_employees.py`) | **PASSED** |
| **TC-08** | Delete Existing Employee | Functional | `DELETE /api/employees/1` | HTTP `200 OK`, confirmation returned; subsequent `GET` returns `404` | Automated (`test_employees.py`) | **PASSED** |
| **TC-09** | Delete Non-Existent Employee | Negative | `DELETE /api/employees/9999` | HTTP `404 Not Found` error returned | Automated (`test_employees.py`) | **PASSED** |
| **TC-10** | Search by Name Substring | Functional | `GET /api/employees?search=Rahul` | HTTP `200 OK`, returns only records where name contains "Rahul" (case-insensitive) | Automated (`test_employees.py`) | **PASSED** |
| **TC-11** | Search by Email Substring | Functional | `GET /api/employees?search=rahul.s` | HTTP `200 OK`, returns matching records | Automated (`test_employees.py`) | **PASSED** |
| **TC-12** | Filter by Department | Functional | `GET /api/employees?department=Engineering` | HTTP `200 OK`, returns only Engineering department records | Automated (`test_employees.py`) | **PASSED** |
| **TC-13** | Create Missing Name | Negative | `POST /api/employees` without `name` key | HTTP `400 Bad Request`, `errors.name` field present | Automated (`test_validation.py`) | **PASSED** |
| **TC-14** | Create Whitespace-Only Name | Boundary | `POST /api/employees` with `{"name": "   "}` | HTTP `400 Bad Request`, rejected as empty/whitespace | Automated (`test_validation.py`) | **PASSED** |
| **TC-15** | Create Missing Email | Negative | `POST /api/employees` without `email` key | HTTP `400 Bad Request`, `errors.email` field present | Automated (`test_validation.py`) | **PASSED** |
| **TC-16** | Create Malformed Email Format | Boundary | `POST /api/employees` with `not-an-email` or `@missing.com` | HTTP `400 Bad Request`, regex validation fails | Automated (`test_validation.py`) | **PASSED** |
| **TC-17** | Duplicate Email Conflict (POST) | Conflict | `POST /api/employees` with existing email | HTTP `409 Conflict`, message states email already registered | Automated (`test_validation.py`) | **PASSED** |
| **TC-18** | Duplicate Email Conflict (PUT) | Conflict | `PUT /api/employees/2` with Employee 1's email | HTTP `409 Conflict`, prevents cross-employee collision | Automated (`test_validation.py`) | **PASSED** |
| **TC-19** | Self-Email Update (PUT) | Functional | `PUT /api/employees/1` retaining own email | HTTP `200 OK`, allowed because email belongs to same employee | Automated (`test_validation.py`) | **PASSED** |
| **TC-20** | Unapproved Department | Boundary | `POST /api/employees` with `department: "Astronautics"` | HTTP `400 Bad Request`, lists approved departments | Automated (`test_validation.py`) | **PASSED** |
| **TC-21** | Negative Salary Input | Boundary | `POST /api/employees` with `salary: -5000` | HTTP `400 Bad Request`, rejected as negative salary | Automated (`test_validation.py`) | **PASSED** |
| **TC-22** | Non-Numeric Salary / Malformed JSON | Negative | `POST /api/employees` with `"salary": "invalid"` or broken JSON | HTTP `400 Bad Request`, clean JSON error response | Automated (`test_validation.py`) | **PASSED** |

---

## 3. Bugs Discovered & Resolved During Development

### Bug #1: PostgreSQL vs SQLite Dialect Prefix in Production
- **Issue**: Modern SQLAlchemy (1.4+) requires `postgresql://` URI scheme. Render and Heroku environment variables often supply legacy `postgres://` connection strings, resulting in `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres`.
- **Fix**: Added dynamic URL sanitization in `backend/app/config.py` converting `postgres://` to `postgresql://` before passing to SQLAlchemy.

### Bug #2: False Positive Duplicate Email Check During PUT Operations
- **Issue**: Updating an employee's salary or department without changing their email triggered a duplicate email conflict because the query matched the employee's own record.
- **Fix**: Updated `validate_employee_data(data, employee_id=None)` to filter `Employee.id != employee_id` when an `employee_id` is supplied during `PUT` requests.

### Bug #3: Python Boolean Validation for Numeric Fields
- **Issue**: In Python, `isinstance(True, int)` evaluates to `True` because `bool` inherits from `int`. Passing `{"salary": True}` could bypass numeric checks.
- **Fix**: Added explicit `isinstance(salary, bool)` guard in `backend/app/validators.py` to reject boolean inputs with HTTP 400.

### Bug #4: Unhandled Server Errors Leaking Stack Traces
- **Issue**: Default Flask error responses can render HTML stack traces in debug or default handlers.
- **Fix**: Implemented centralized JSON error handlers for `400`, `404`, `405`, and `500` in `backend/app/__init__.py`, guaranteeing that all API responses adhere to standard JSON error structures.

---

## 4. How to Execute the Test Suite

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# 3. Run all tests with pytest
pytest -v --tb=short
```
