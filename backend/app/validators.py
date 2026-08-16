import re
from app.models import Employee

# Whitelist of approved departments
VALID_DEPARTMENTS = [
    "IT",
    "QA",
    "HR",
    "Finance",
    "Engineering",
    "Operations",
    "Marketing"
]

# Standard RFC 5322 compatible email pattern
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

def validate_employee_data(data, employee_id=None):
    """
    Validate employee payload for POST and PUT operations.
    Returns (errors, sanitized_data) tuple.
    errors is a dict of {field: message}, or None if completely valid.
    """
    if not isinstance(data, dict):
        return {"error": "Invalid request body. Expected a JSON object."}, None

    errors = {}
    sanitized = {}

    # --- Name Validation ---
    name = data.get("name")
    if name is None:
        errors["name"] = "Name is required."
    elif not isinstance(name, str):
        errors["name"] = "Name must be a string."
    else:
        stripped_name = name.strip()
        if len(stripped_name) == 0:
            errors["name"] = "Name cannot be empty or only whitespace."
        elif len(stripped_name) > 100:
            errors["name"] = "Name cannot exceed 100 characters."
        else:
            sanitized["name"] = stripped_name

    # --- Email Validation ---
    email = data.get("email")
    if email is None:
        errors["email"] = "Email is required."
    elif not isinstance(email, str):
        errors["email"] = "Email must be a string."
    else:
        stripped_email = email.strip().lower()
        if len(stripped_email) == 0:
            errors["email"] = "Email cannot be empty."
        elif not EMAIL_REGEX.match(stripped_email) or len(stripped_email) > 120:
            errors["email"] = "Invalid email format. Provide a valid email address (e.g. user@example.com)."
        else:
            # Check duplicate email in database
            query = Employee.query.filter(Employee.email == stripped_email)
            if employee_id is not None:
                query = query.filter(Employee.id != employee_id)
            existing = query.first()
            if existing:
                errors["email"] = f"Email '{stripped_email}' is already registered to another employee."
                # Flag duplicate email specifically
                errors["_conflict"] = True
            else:
                sanitized["email"] = stripped_email

    # --- Department Validation ---
    department = data.get("department")
    if department is None:
        errors["department"] = "Department is required."
    elif not isinstance(department, str):
        errors["department"] = "Department must be a string."
    else:
        stripped_dept = department.strip()
        if stripped_dept not in VALID_DEPARTMENTS:
            errors["department"] = f"Invalid department. Must be one of: {', '.join(VALID_DEPARTMENTS)}."
        else:
            sanitized["department"] = stripped_dept

    # --- Salary Validation ---
    salary = data.get("salary")
    if salary is None:
        errors["salary"] = "Salary is required."
    elif isinstance(salary, bool):  # In Python, bool is subclass of int, so False/True must be rejected
        errors["salary"] = "Salary must be a valid positive number."
    elif not isinstance(salary, (int, float)):
        # If it's a string, try converting or reject
        try:
            val = float(salary)
            if val < 0:
                errors["salary"] = "Salary cannot be negative."
            elif val > 1_000_000_000:
                errors["salary"] = "Salary exceeds maximum allowed threshold."
            else:
                sanitized["salary"] = round(val, 2)
        except (ValueError, TypeError):
            errors["salary"] = "Salary must be a numeric value."
    else:
        if salary < 0:
            errors["salary"] = "Salary cannot be negative."
        elif salary > 1_000_000_000:
            errors["salary"] = "Salary exceeds maximum allowed threshold."
        else:
            sanitized["salary"] = round(float(salary), 2)

    if errors:
        return errors, None

    return None, sanitized
