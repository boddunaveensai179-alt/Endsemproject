# Spring Boot Backend Setup

This backend is the PostgreSQL service for authentication, RBAC, Book CRUD, and Borrow CRUD.

## Database

Create the PostgreSQL database:

```sql
CREATE DATABASE library_db;
```

Default connection:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/library_db
spring.datasource.username=postgres
spring.datasource.password=admin123
```

Environment overrides:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
```

## Build

From the project root:

```powershell
.\library\mvnw.cmd -q -f backend\pom.xml compile
```

## Run

From the project root:

```powershell
.\library\mvnw.cmd -f backend\pom.xml spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

The React frontend should not call this service directly. It should call the FastAPI gateway:

```text
http://localhost:8000
```

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@library.com` | `password123` |
| USER | `user@library.com` | `password123` |

## Endpoints Behind Gateway

Spring routes forwarded by FastAPI:

```text
/auth/*
/books/*
/borrows/*
```

See `docs/API_DOCUMENTATION.md` and `docs/RUN_GUIDE.md` for complete system instructions.
