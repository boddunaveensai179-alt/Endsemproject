# Library Management System

Full-stack Library Management System upgraded for the six-part academic rubric:

- React frontend with role-based UI
- FastAPI API Gateway
- Spring Boot backend with JWT, BCrypt, RBAC, Book CRUD, and Borrow CRUD
- Node.js/Express backend with MongoDB CRUD APIs
- PostgreSQL database for core library data
- MongoDB database for search history, activity logs, and recommendations
- Public Swagger UI with JWT bearer authorization

## Architecture

```text
React Frontend
    |
    v
FastAPI Gateway :8000
    |
    +--> Spring Boot :8080 --> PostgreSQL library_db
    |
    +--> Node.js :5000 -----> MongoDB library_mongo
```

## Main Folders

```text
backend/       Spring Boot service for auth, RBAC, books, and borrows
frontend/      Existing React app upgraded to call the FastAPI gateway
gateway/       FastAPI centralized API gateway
node-backend/  Express/Mongoose MongoDB service
docs/          Analysis, API docs, setup guide, run guide, and Postman collection
library/       Existing Maven wrapper used to build backend/
```

## Startup Order

1. PostgreSQL
2. MongoDB
3. Spring Boot backend
4. Node.js backend
5. FastAPI gateway
6. React frontend

## Quick Run

Create PostgreSQL database:

```sql
CREATE DATABASE library_db;
```

Run Spring Boot:

```powershell
.\library\mvnw.cmd -f backend\pom.xml spring-boot:run
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

Run Node.js backend:

```powershell
cd node-backend
npm install
npm start
```

Run FastAPI gateway:

```powershell
cd gateway
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Run React:

```powershell
cd frontend
npm install
npm start
```

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@library.com` | `password123` |
| USER | `user@library.com` | `password123` |

## Review Documents

- [Project review and implementation plan](docs/PROJECT_REVIEW_AND_PLAN.md)
- [API documentation](docs/API_DOCUMENTATION.md)
- [Setup guide](docs/SETUP_GUIDE.md)
- [Run guide](docs/RUN_GUIDE.md)
- [Modified files summary](docs/MODIFIED_FILES.md)
- [Postman collection](docs/Library_Management_Postman_Collection.json)

## Verification Commands

```powershell
.\library\mvnw.cmd -q -f backend\pom.xml compile
cd frontend
npm run build
cd ..\node-backend
node --check server.js
cd ..
python -m py_compile gateway\main.py
```

See [Review-3 compliance report](docs/REVIEW_3_COMPLIANCE_REPORT.md) for the final requirement audit and verification evidence.
