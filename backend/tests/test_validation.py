import json
import pytest

def test_create_employee_missing_name(client):
    """Test creating an employee without a name returns 400 Bad Request."""
    payload = {
        "email": "noname@example.com",
        "department": "IT",
        "salary": 50000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "errors" in data
    assert "name" in data["errors"]


def test_create_employee_whitespace_only_name(client):
    """Test creating an employee with whitespace-only name returns 400."""
    payload = {
        "name": "   ",
        "email": "spaces@example.com",
        "department": "IT",
        "salary": 50000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "name" in data["errors"]


def test_create_employee_missing_email(client):
    """Test creating an employee without an email returns 400."""
    payload = {
        "name": "John Doe",
        "department": "IT",
        "salary": 50000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "email" in data["errors"]


def test_create_employee_invalid_email_format(client):
    """Test creating an employee with malformed email formats returns 400."""
    invalid_emails = [
        "not-an-email",
        "@example.com",
        "user@",
        "user@example",
        "user space@example.com"
    ]
    for bad_email in invalid_emails:
        payload = {
            "name": "Test User",
            "email": bad_email,
            "department": "IT",
            "salary": 50000
        }
        response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
        assert response.status_code == 400
        data = response.get_json()
        assert "email" in data["errors"]


def test_create_employee_duplicate_email(client, sample_employee):
    """Test creating an employee with an existing email returns 409 Conflict."""
    payload = {
        "name": "Duplicate User",
        "email": sample_employee["email"],  # Same as sample_employee fixture
        "department": "HR",
        "salary": 60000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 409
    data = response.get_json()
    assert "errors" in data
    assert "already registered" in data["errors"]["email"].lower()


def test_update_employee_duplicate_email_conflict(client, sample_employee):
    """Test updating employee A with employee B's email returns 409 Conflict."""
    # Create second employee
    emp2_payload = {
        "name": "Second Person",
        "email": "second@example.com",
        "department": "Finance",
        "salary": 70000
    }
    create_res = client.post("/api/employees", data=json.dumps(emp2_payload), content_type="application/json")
    emp2_id = create_res.get_json()["employee"]["id"]

    # Try updating second employee with first employee's email
    update_payload = {
        "name": "Second Person Updated",
        "email": sample_employee["email"],
        "department": "Finance",
        "salary": 70000
    }
    response = client.put(f"/api/employees/{emp2_id}", data=json.dumps(update_payload), content_type="application/json")
    assert response.status_code == 409
    data = response.get_json()
    assert "already registered" in data["errors"]["email"].lower()


def test_update_employee_own_email_allowed(client, sample_employee):
    """Test updating employee's salary/name while keeping their own email returns 200 OK."""
    emp_id = sample_employee["id"]
    update_payload = {
        "name": "Rahul Updated Name",
        "email": sample_employee["email"],  # Own email is fine
        "department": "IT",
        "salary": 80000
    }
    response = client.put(f"/api/employees/{emp_id}", data=json.dumps(update_payload), content_type="application/json")
    assert response.status_code == 200
    data = response.get_json()
    assert data["employee"]["name"] == "Rahul Updated Name"


def test_create_employee_missing_department(client):
    """Test creating an employee without a department returns 400."""
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "salary": 50000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "department" in data["errors"]


def test_create_employee_invalid_department(client):
    """Test creating an employee with an unapproved department returns 400."""
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "department": "Astronautics",  # Not in whitelist
        "salary": 50000
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "department" in data["errors"]


def test_create_employee_missing_salary(client):
    """Test creating an employee without salary returns 400."""
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "department": "IT"
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "salary" in data["errors"]


def test_create_employee_negative_salary(client):
    """Test creating an employee with negative salary returns 400."""
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "department": "IT",
        "salary": -500.0
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "negative" in data["errors"]["salary"].lower()


def test_create_employee_invalid_salary_type(client):
    """Test creating an employee with string or boolean salary returns 400."""
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "department": "IT",
        "salary": "not-a-number"
    }
    response = client.post("/api/employees", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "salary" in data["errors"]


def test_empty_request_body(client):
    """Test sending empty body returns 400."""
    response = client.post("/api/employees", data="", content_type="application/json")
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_non_json_content_type(client):
    """Test sending raw text content type returns 400."""
    response = client.post("/api/employees", data="raw string", content_type="text/plain")
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_invalid_url_id_parameter(client):
    """Test accessing employee endpoint with a non-integer ID returns 404."""
    response = client.get("/api/employees/abc")
    assert response.status_code == 404
