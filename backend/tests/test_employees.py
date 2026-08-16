import json

def test_health_check(client):
    """Test the /api/health endpoint returns 200 and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "employee-management-api"


def test_get_employees_empty(client):
    """Test retrieving employees from an empty database."""
    response = client.get("/api/employees")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 0
    assert data["employees"] == []


def test_create_valid_employee(client):
    """Test creating a valid new employee returns 201."""
    payload = {
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "department": "Engineering",
        "salary": 95000.0
    }
    response = client.post(
        "/api/employees",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "Employee created successfully"
    assert "employee" in data
    assert data["employee"]["name"] == "Priya Patel"
    assert data["employee"]["email"] == "priya.patel@example.com"
    assert data["employee"]["department"] == "Engineering"
    assert data["employee"]["salary"] == 95000.0
    assert data["employee"]["id"] is not None


def test_get_employee_by_id(client, sample_employee):
    """Test retrieving an existing employee by ID."""
    emp_id = sample_employee["id"]
    response = client.get(f"/api/employees/{emp_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert "employee" in data
    assert data["employee"]["id"] == emp_id
    assert data["employee"]["name"] == "Rahul Sharma"


def test_get_non_existent_employee(client):
    """Test retrieving a non-existent employee ID returns 404."""
    response = client.get("/api/employees/9999")
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data
    assert "not found" in data["error"].lower()


def test_update_employee(client, sample_employee):
    """Test updating an existing employee returns 200."""
    emp_id = sample_employee["id"]
    update_payload = {
        "name": "Rahul S. Sharma",
        "email": "rahul.sharma@example.com",
        "department": "IT",
        "salary": 82000.0
    }
    response = client.put(
        f"/api/employees/{emp_id}",
        data=json.dumps(update_payload),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Employee updated successfully"
    assert data["employee"]["name"] == "Rahul S. Sharma"
    assert data["employee"]["salary"] == 82000.0


def test_update_non_existent_employee(client):
    """Test updating a non-existent employee returns 404."""
    update_payload = {
        "name": "Nobody",
        "email": "nobody@example.com",
        "department": "IT",
        "salary": 50000.0
    }
    response = client.put(
        "/api/employees/9999",
        data=json.dumps(update_payload),
        content_type="application/json"
    )
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data


def test_delete_employee(client, sample_employee):
    """Test deleting an existing employee returns 200."""
    emp_id = sample_employee["id"]
    response = client.delete(f"/api/employees/{emp_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Employee deleted successfully"
    assert data["id"] == emp_id

    # Verify subsequent GET returns 404
    get_res = client.get(f"/api/employees/{emp_id}")
    assert get_res.status_code == 404


def test_delete_non_existent_employee(client):
    """Test deleting a non-existent employee returns 404."""
    response = client.delete("/api/employees/9999")
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data


def test_search_employees(client):
    """Test searching employees by name and email."""
    # Seed 3 employees
    employees = [
        {"name": "Amit Verma", "email": "amit.v@example.com", "department": "QA", "salary": 65000},
        {"name": "Neha Gupta", "email": "neha.g@example.com", "department": "HR", "salary": 58000},
        {"name": "Amitabh Roy", "email": "amitabh@example.com", "department": "Operations", "salary": 70000}
    ]
    for emp in employees:
        client.post("/api/employees", data=json.dumps(emp), content_type="application/json")

    # Search for "Amit" -> should find 2
    res = client.get("/api/employees?search=Amit")
    assert res.status_code == 200
    data = res.get_json()
    assert data["count"] == 2
    names = [e["name"] for e in data["employees"]]
    assert "Amit Verma" in names
    assert "Amitabh Roy" in names

    # Search by email snippet
    res_email = client.get("/api/employees?search=neha.g")
    assert res_email.status_code == 200
    data_email = res_email.get_json()
    assert data_email["count"] == 1
    assert data_email["employees"][0]["name"] == "Neha Gupta"


def test_filter_employees_by_department(client):
    """Test filtering employees by department."""
    employees = [
        {"name": "Dev One", "email": "dev1@example.com", "department": "Engineering", "salary": 90000},
        {"name": "Dev Two", "email": "dev2@example.com", "department": "Engineering", "salary": 95000},
        {"name": "QA One", "email": "qa1@example.com", "department": "QA", "salary": 65000}
    ]
    for emp in employees:
        client.post("/api/employees", data=json.dumps(emp), content_type="application/json")

    # Filter Engineering
    res = client.get("/api/employees?department=Engineering")
    assert res.status_code == 200
    data = res.get_json()
    assert data["count"] == 2

    # Filter QA
    res_qa = client.get("/api/employees?department=QA")
    assert res_qa.status_code == 200
    data_qa = res_qa.get_json()
    assert data_qa["count"] == 1
    assert data_qa["employees"][0]["name"] == "QA One"
