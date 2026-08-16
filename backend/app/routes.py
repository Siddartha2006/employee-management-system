from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Employee
from app.validators import validate_employee_data

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for deployment monitoring and uptime verification.
    """
    return jsonify({
        "status": "healthy",
        "service": "employee-management-api"
    }), 200


@api_bp.route("/employees", methods=["GET"])
def get_employees():
    """
    Retrieve all employees with optional search query and department filter.
    Query params:
      - search: string (matches name or email substring)
      - department: string (matches exact department)
    """
    search_term = request.args.get("search", "").strip()
    department = request.args.get("department", "").strip()

    query = Employee.query

    if department:
        query = query.filter(Employee.department.ilike(department))

    if search_term:
        search_filter = f"%{search_term}%"
        query = query.filter(
            (Employee.name.ilike(search_filter)) | 
            (Employee.email.ilike(search_filter))
        )

    # Order by newest first
    employees = query.order_by(Employee.created_at.desc()).all()

    return jsonify({
        "count": len(employees),
        "employees": [emp.to_dict() for emp in employees]
    }), 200


@api_bp.route("/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    """
    Retrieve a single employee by ID.
    """
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({
            "error": f"Employee not found with ID {employee_id}"
        }), 404

    return jsonify({
        "employee": employee.to_dict()
    }), 200


@api_bp.route("/employees", methods=["POST"])
def create_employee():
    """
    Create a new employee record.
    """
    if not request.is_json:
        return jsonify({
            "error": "Request body must be valid JSON with 'application/json' Content-Type."
        }), 400

    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid or malformed JSON payload."
        }), 400

    errors, sanitized = validate_employee_data(data)
    if errors:
        is_conflict = errors.pop("_conflict", False)
        status_code = 409 if is_conflict else 400
        error_msg = "Duplicate email address detected." if is_conflict else "Validation failed for one or more fields."
        return jsonify({
            "error": error_msg,
            "errors": errors
        }), status_code

    new_employee = Employee(
        name=sanitized["name"],
        email=sanitized["email"],
        department=sanitized["department"],
        salary=sanitized["salary"]
    )

    try:
        db.session.add(new_employee)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to save employee to database."
        }), 500

    return jsonify({
        "message": "Employee created successfully",
        "employee": new_employee.to_dict()
    }), 201


@api_bp.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    """
    Update an existing employee record by ID.
    """
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({
            "error": f"Employee not found with ID {employee_id}"
        }), 404

    if not request.is_json:
        return jsonify({
            "error": "Request body must be valid JSON with 'application/json' Content-Type."
        }), 400

    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid or malformed JSON payload."
        }), 400

    errors, sanitized = validate_employee_data(data, employee_id=employee_id)
    if errors:
        is_conflict = errors.pop("_conflict", False)
        status_code = 409 if is_conflict else 400
        error_msg = "Duplicate email address detected." if is_conflict else "Validation failed for one or more fields."
        return jsonify({
            "error": error_msg,
            "errors": errors
        }), status_code

    employee.name = sanitized["name"]
    employee.email = sanitized["email"]
    employee.department = sanitized["department"]
    employee.salary = sanitized["salary"]

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to update employee in database."
        }), 500

    return jsonify({
        "message": "Employee updated successfully",
        "employee": employee.to_dict()
    }), 200


@api_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    """
    Delete an employee record by ID.
    """
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({
            "error": f"Employee not found with ID {employee_id}"
        }), 404

    try:
        db.session.delete(employee)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to delete employee from database."
        }), 500

    return jsonify({
        "message": "Employee deleted successfully",
        "id": employee_id
    }), 200
