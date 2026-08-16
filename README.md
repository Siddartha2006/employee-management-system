# Employee Management System

A production-quality, full-stack Employee Management System engineered with a **Python Flask REST API**, **SQLAlchemy ORM**, **React 18**, **Vite**, and **Tailwind CSS**. Built with enterprise patterns, robust validation, centralized error handling, comprehensive pytest automated testing, and zero-downtime deployment pipelines for **Render** (Backend) and **Vercel** (Frontend).

---

## 🚀 Live Demo & Architecture Highlights

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                   |
|   React 18 + Vite + Tailwind CSS + Lucide Icons                         |
|   - Real-time search & department filtering                             |
|   - Interactive summary & payroll analytics cards                       |
|   - Client-side validation + server-side error mapping                  |
|   - Accessible modal CRUD workflows & toast notification system         |
|   - Integrated QA / API Test Matrix dashboard                           |
+-------------------------------------------------------------------------+
                                     |
                                     | HTTPS / JSON REST API
                                     v
+-------------------------------------------------------------------------+
|                              BACKEND                                    |
|   Python Flask + Flask-CORS + Gunicorn WSGI                             |
|   - Application Factory Pattern (create_app)                            |
|   - Centralized JSON error handlers (400, 404, 405, 409, 500)           |
|   - Strict input validation & regex sanitization                        |
|   - Health probe endpoint: GET /api/health                              |
+-------------------------------------------------------------------------+
                                     |
                                     | SQLAlchemy ORM
                                     v
+-------------------------------------------------------------------------+
|                              DATABASE                                   |
|   SQLite (Zero-config local development & Pytest in-memory testing)     |
|   PostgreSQL (Production-ready via DATABASE_URL on Render/AWS/Supabase) |
+-------------------------------------------------------------------------+
```

---

## ✨ Features

- **Employee Directory**: View all employees with department badges, formatted salaries, and creation timestamps.
- **Search & Filtering**: Search in real-time across employee names and emails; filter by department (`IT`, `QA`, `HR`, `Finance`, `Engineering`, `Operations`, `Marketing`).
- **Complete CRUD Operations**:
  - Add new employee with comprehensive validation.
  - Edit existing employee with auto-populated form.
  - View detailed profile card with full metadata.
  - Delete employee with confirmation modal preventing accidental data loss.
- **Robust Multi-Layer Validation**:
  - Rejects empty, whitespace-only, or oversized names.
  - Validates email syntax against RFC 5322 regex.
  - Detects duplicate email registrations (`409 Conflict`).
  - Whitelists department selections.
  - Enforces positive numeric salaries (rejecting negative numbers, strings, and booleans).
- **Centralized Error Handling**: Ensures all errors return structured JSON objects instead of HTML stack traces.
- **Live System Status**: Top header monitors backend connection health via periodic `/api/health` probes.
- **QA & Testing Dashboard**: Embedded QA Test Matrix displaying test coverage categories, live health latency probing, and automated test breakdown.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React 18, Vite | High-performance SPA with fast HMR |
| **Styling** | Tailwind CSS, Lucide React | Modern, responsive enterprise design system |
| **HTTP Client** | Axios | Centralized API client with response interceptors |
| **Backend API** | Python 3.11+, Flask | Lightweight, fast RESTful API |
| **Database ORM** | SQLAlchemy, Flask-SQLAlchemy | Database abstraction & query parameterization |
| **Production WSGI** | Gunicorn | Multi-worker HTTP server for production |
| **Database** | SQLite (Dev/Test), PostgreSQL (Prod) | Relational persistence |
| **Test Automation** | pytest, pytest-flask | Automated unit, integration, and validation tests |
| **CI / CD** | GitHub Actions | Automated test pipeline on push and PR |
| **Deployment** | Render (Backend), Vercel (Frontend) | Cloud hosting with automated continuous deployment |

---

## 📁 Project Structure

```
employee-management-system/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask application factory (create_app)
│   │   ├── config.py             # Configuration classes (Dev, Prod, Test)
│   │   ├── extensions.py         # SQLAlchemy and CORS extension instances
│   │   ├── models.py             # Employee database model & serializer
│   │   ├── routes.py             # REST API routes (/api/employees, /api/health)
│   │   └── validators.py         # Strict input validation & sanitization
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py           # Pytest fixtures with in-memory SQLite DB
│   │   ├── test_employees.py     # Functional CRUD & search/filter tests
│   │   └── test_validation.py    # Negative, conflict, & boundary validation tests
│   │
│   ├── .env.example              # Backend environment template
│   ├── Dockerfile                # Production container definition
│   ├── Procfile                  # Render / Heroku process manager config
│   ├── render.yaml               # Render Blueprint specification
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Server runner & sample data seeder
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Header with live health monitor
│   │   │   ├── SummaryCards.jsx  # Department & payroll metrics cards
│   │   │   ├── EmployeeTable.jsx # Search, filter, sorting, and data rows
│   │   │   ├── EmployeeModal.jsx # Add / Edit employee modal with inline validation
│   │   │   ├── EmployeeDetailModal.jsx # Detailed employee view modal
│   │   │   ├── DeleteConfirmModal.jsx  # Safe deletion confirmation dialog
│   │   │   ├── QADashboard.jsx   # QA Test Matrix & live probe panel
│   │   │   └── Toast.jsx         # Toast notification system
│   │   │
│   │   ├── services/
│   │   │   └── api.js            # Centralized Axios API service layer
│   │   │
│   │   ├── App.jsx               # Main dashboard controller
│   │   ├── index.css             # Tailwind CSS & design tokens
│   │   └── main.jsx              # React DOM root entry
│   │
│   ├── public/                   # Static assets
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # HTML5 entry with SEO metadata
│   ├── package.json              # NPM dependencies & scripts
│   ├── tailwind.config.js        # Tailwind styling config
│   ├── postcss.config.js         # PostCSS config
│   ├── vite.config.js            # Vite build & local dev proxy setup
│   └── vercel.json               # Vercel SPA routing rewrites
│
├── .github/
│   └── workflows/
│       └── backend-tests.yml     # Automated CI pipeline
│
├── .gitignore                    # Git ignore file
├── docker-compose.yml            # Multi-container orchestration (App + PostgreSQL)
├── API_DOCUMENTATION.md          # REST API endpoint reference
├── TESTING.md                    # QA Strategy & 22-item test matrix
└── README.md                     # Project documentation
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Clone and Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Upgrade pip and install dependencies
pip install -r requirements.txt

# Start the Flask API server
python run.py
```

The backend server will start at `http://localhost:5000`. It will automatically initialize an SQLite database (`employees.db`) and seed initial employee records.

Verify backend health in another terminal or browser:
```bash
curl http://localhost:5000/api/health
```

---

### Step 2: Set Up Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

The test suite runs with `pytest` using an isolated in-memory SQLite database (`sqlite:///:memory:`):

```bash
cd backend
pytest -v --tb=short
```

To run a specific test file:
```bash
# Run functional tests
pytest tests/test_employees.py -v

# Run negative & boundary validation tests
pytest tests/test_validation.py -v
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `FLASK_ENV` | `development` | Environment mode (`development` / `production` / `testing`) |
| `PORT` | `5000` | Server listening port |
| `SECRET_KEY` | `dev-secret-key` | Session and token secret |
| `DATABASE_URL` | `sqlite:///employees.db` | Database connection URI (PostgreSQL or SQLite) |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origins (comma-separated list) |

### Frontend (`frontend/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the backend REST API |

---

## 🚢 Production Deployment Guide

### Deploy Backend to Render

1. Create a free account at [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app --bind 0.0.0.0:$PORT --workers 2`
5. Under **Environment Variables**, add:
   - `FLASK_ENV`: `production`
   - `FRONTEND_URL`: `https://your-frontend-app.vercel.app`
   - `DATABASE_URL`: (Optional: connect Render PostgreSQL instance or Supabase URL)
6. Click **Create Web Service**. Note your Render URL (e.g. `https://employee-api-xxxx.onrender.com`).

---

### Deploy Frontend to Vercel

1. Create an account at [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://employee-api-xxxx.onrender.com/api` (your deployed Render API URL)
6. Click **Deploy**.

---

## 🔮 Future Enhancements

- **JWT Authentication & RBAC**: Admin vs Manager vs Employee roles.
- **Pagination & Sorting Controls**: Server-side pagination (`?page=1&limit=20`) for scaling beyond 10,000 records.
- **Audit Logging**: Tracking change history and who modified employee salaries.
- **File Uploads**: Employee profile avatar storage with AWS S3 / Cloudinary.
- **Export to CSV/PDF**: Bulk employee directory reports.
- **Dark Mode**: Seamless theme switching with Tailwind dark mode classes.
