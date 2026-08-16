import pytest
from app import create_app
from app.extensions import db
from app.config import TestingConfig
from app.models import Employee

@pytest.fixture
def app():
    """Create and configure a Flask application for testing."""
    test_app = create_app(TestingConfig)

    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()


@pytest.fixture
def sample_employee(app):
    """Insert and return a sample employee fixture."""
    with app.app_context():
        emp = Employee(
            name="Rahul Sharma",
            email="rahul.sharma@example.com",
            department="IT",
            salary=75000.0
        )
        db.session.add(emp)
        db.session.commit()
        # Refresh object to bind data
        db.session.refresh(emp)
        return emp.to_dict()
