# ImpactForge Backend

Modular Python FastAPI backend for **ImpactForge**, integrated with PostgreSQL via SQLAlchemy and Alembic, with CORS enabled for the React frontend.

---

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: PostgreSQL (`impactforge`)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Validation & Settings**: [Pydantic](https://docs.pydantic.dev/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

---

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI application entrypoint with CORS
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py          # App settings & env variable configuration
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py         # SQLAlchemy engine & session dependency
│   │   └── base.py            # DeclarativeBase for models
│   ├── models/
│   │   └── __init__.py        # ORM model registry
│   ├── schemas/
│   │   └── __init__.py        # Pydantic schemas (HealthResponse, etc.)
│   └── api/
│       ├── __init__.py
│       └── routes/
│           ├── __init__.py
│           └── health.py      # Health check endpoint (/api/health)
├── .env.example               # Template environment configuration
├── requirements.txt           # Python dependencies
└── README.md                  # Setup and usage guide
```

---

## Setup Guide

### 1. Create a Python Virtual Environment

Open a terminal in the `backend` directory:

```powershell
cd backend
py -m venv venv
```

*(On Linux / macOS, you can use `python3 -m venv venv`)*

---

### 2. Activate the Virtual Environment

**Windows PowerShell**:
```powershell
.\venv\Scripts\Activate.ps1
```

*(If PowerShell script execution is restricted, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, or use CMD: `venv\Scripts\activate.bat`)*

**Linux / macOS**:
```bash
source venv/bin/activate
```

---

### 3. Install Requirements

With the virtual environment activated, install all dependencies:

```powershell
pip install -r requirements.txt
```

---

### 4. Create the `.env` File

Copy the template from `.env.example`:

**Windows PowerShell**:
```powershell
Copy-Item .env.example .env
```

**CMD / Bash**:
```bash
cp .env.example .env
```

Open `.env` and replace `YOUR_PASSWORD` with your local PostgreSQL password:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/impactforge
```

> [!NOTE]
> The database name `impactforge` has already been created. The backend connects to this database using the `DATABASE_URL` environment variable.

---

### 5. Run the Backend Server

Start the development server with auto-reload:

```powershell
uvicorn app.main:app --reload --port 8000
```

or via the Python module:

```powershell
py -m uvicorn app.main:app --reload --port 8000
```

The backend will start at: `http://localhost:8000`

---

## Available Endpoints

- **Health Check Endpoint**:
  - URL: `http://localhost:8000/api/health`
  - Method: `GET`
  - Expected Response:
    ```json
    {
      "status": "ok",
      "service": "ImpactForge backend"
    }
    ```

- **Problem Reports Endpoints**:
  - **Create Report**:
    - URL: `http://localhost:8000/api/reports`
    - Method: `POST`
    - Status: `201 Created`
    - Returns: Created report with unique Track ID (`IF-JH-2026-XXXX`)
  - **List Reports**:
    - URL: `http://localhost:8000/api/reports`
    - Method: `GET`
    - Query Parameters: `district`, `status`, `category`, `priority`, `skip`, `limit`
  - **Get Single Report**:
    - URL: `http://localhost:8000/api/reports/{track_id}`
    - Method: `GET`
    - Example: `http://localhost:8000/api/reports/IF-JH-2026-0001`
  - **Update Report Status**:
    - URL: `http://localhost:8000/api/reports/{track_id}/status`
    - Method: `PATCH`
    - Allowed statuses: `Open`, `In Progress`, `Resolved`, `Rejected`

- **Interactive API Documentation (Swagger UI)**:
  - URL: `http://localhost:8000/api/docs`

- **Alternative API Documentation (ReDoc)**:
  - URL: `http://localhost:8000/api/redoc`

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured by default for the React frontend running on:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5177`
- `http://127.0.0.1:5177`
