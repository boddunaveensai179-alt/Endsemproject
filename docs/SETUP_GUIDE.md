# Setup Guide

## Prerequisites

- Java 17+
- Node.js 18+
- Python 3.10+
- PostgreSQL 12+
- MongoDB 6+

## PostgreSQL Setup

Create the required database:

```sql
CREATE DATABASE library_db;
```

Default backend credentials are configured in `backend/src/main/resources/application.properties`:

```properties
DB_URL=jdbc:postgresql://localhost:5432/library_db
DB_USERNAME=postgres
DB_PASSWORD=admin123
```

You can override them with environment variables.

## MongoDB Setup

Start MongoDB locally. The Node service connects to:

```text
mongodb://localhost:27017/library_mongo
```

Collections are created automatically by Mongoose:

- `search_history`
- `activity_logs`
- `recommendations`

## Spring Boot Setup

The repository has no Maven installed requirement because the existing wrapper in `library/` can build the main backend:

```powershell
.\library\mvnw.cmd -f backend\pom.xml compile
```

Default seeded users:

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@library.com` | `password123` |
| USER | `user@library.com` | `password123` |

## Node Backend Setup

```powershell
cd node-backend
npm install
```

## FastAPI Gateway Setup

```powershell
cd gateway
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## React Frontend Setup

```powershell
cd frontend
npm install
```

The frontend defaults to:

```text
REACT_APP_API_URL=http://localhost:8000
```
