# Production Environment Variables Templates

This document lists all environment variables required for deploying each service to production.

---

## 1. Spring Boot Backend (`library-spring-backend`)

Configure these environment variables in your Render Web Service settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DB_URL` | JDBC URL for PostgreSQL cloud instance | `jdbc:postgresql://ep-example.us-east-1.aws.neon.tech/library_db?sslmode=require` |
| `DB_USERNAME` | Username for cloud PostgreSQL | `postgres_user` |
| `DB_PASSWORD` | Password for cloud PostgreSQL | `super_secure_password_123` |
| `DDL_AUTO` | Hibernate ddl-auto strategy (use `update` or `validate`) | `update` |
| `JWT_SECRET` | Secret key used to sign JWT authorization tokens | `my-extremely-long-super-secure-production-jwt-signing-key-minimum-256-bits` |

---

## 2. Node.js Backend (`library-node-backend`)

Configure these environment variables in your Render Web Service settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGO_URI` | Connection URI for MongoDB Atlas cluster | `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/library_mongo?retryWrites=true&w=majority` |

---

## 3. FastAPI Gateway (`library-fastapi-gateway`)

Configure these environment variables in your Render Web Service settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `SPRING_BOOT_URL` | Deployed Spring Boot service public URL | `https://library-spring-backend.onrender.com` |
| `NODE_BACKEND_URL` | Deployed Node.js service public URL | `https://library-node-backend.onrender.com` |

---

## 4. React Frontend (`library-react-frontend`)

Configure these environment variables in your Render Static Site settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Deployed FastAPI Gateway public URL | `https://library-fastapi-gateway.onrender.com` |
