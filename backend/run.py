import os
from app import create_app
from app.extensions import db
from app.models import Employee

app = create_app()

def seed_sample_data():
    """Seed initial sample data if the database is empty in local development."""
    with app.app_context():
        try:
            if Employee.query.count() == 0:
                samples = [
                    Employee(name="Rahul Sharma", email="rahul.sharma@example.com", department="IT", salary=75000.0),
                    Employee(name="Priya Patel", email="priya.patel@example.com", department="Engineering", salary=92000.0),
                    Employee(name="Amit Verma", email="amit.verma@example.com", department="QA", salary=65000.0),
                    Employee(name="Neha Gupta", email="neha.gupta@example.com", department="HR", salary=58000.0),
                    Employee(name="Vikram Singh", email="vikram.singh@example.com", department="Finance", salary=84000.0),
                    Employee(name="Ananya Roy", email="ananya.roy@example.com", department="Marketing", salary=62000.0),
                    Employee(name="Rajesh Kumar", email="rajesh.kumar@example.com", department="Operations", salary=54000.0)
                ]
                db.session.bulk_save_objects(samples)
                db.session.commit()
                print(">> [SEED] Successfully populated database with sample employee records.")
        except Exception as e:
            db.session.rollback()
            print(f">> [SEED INFO] Skipped seeding or tables not ready: {e}")

# Seed on startup if in development mode
if os.getenv("FLASK_ENV", "development").lower() == "development":
    seed_sample_data()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1")
    print(f"Starting Employee Management System API on port {port} (debug={debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
