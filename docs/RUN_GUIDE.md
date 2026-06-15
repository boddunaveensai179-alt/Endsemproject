# Run Guide

Start services in this order.

## 1. PostgreSQL

Ensure PostgreSQL is running and database `library_db` exists.

## 2. MongoDB

Ensure MongoDB is running locally:

```text
mongodb://localhost:27017/library_mongo
```

## 3. Spring Boot Backend

From the project root:

```powershell
.\library\mvnw.cmd -f backend\pom.xml spring-boot:run
```

Runs on:

```text
http://localhost:8080
```

Public Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

## 4. Node.js Backend

```powershell
cd node-backend
npm start
```

Runs on:

```text
http://localhost:5000
```

## 5. FastAPI Gateway

```powershell
cd gateway
uvicorn main:app --reload --port 8000
```

Runs on:

```text
http://localhost:8000
```

Health check:

```text
GET http://localhost:8000/health
```

## 6. React Frontend

```powershell
cd frontend
npm start
```

Runs on:

```text
http://localhost:3000
```

## Integration Flows

```text
LOGIN:
React -> FastAPI Gateway -> Spring Boot -> PostgreSQL

SEARCH:
React -> FastAPI Gateway -> Node.js -> MongoDB

BORROW:
React -> FastAPI Gateway -> Spring Boot -> PostgreSQL

ACTIVITY/RECOMMENDATIONS:
React -> FastAPI Gateway -> Node.js -> MongoDB
```
