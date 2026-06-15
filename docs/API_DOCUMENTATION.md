# API Documentation

All frontend calls should use the gateway base URL:

```text
http://localhost:8000
```

The gateway forwards Spring Boot routes to `http://localhost:8080` and Node/Mongo routes to `http://localhost:5000`.

## Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Gateway health check |

## Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a USER account |
| POST | `/auth/login` | Public | Login and receive JWT |

### Register Body

```json
{
  "name": "Library User",
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response

```json
{
  "token": "jwt-token",
  "type": "Bearer",
  "id": 1,
  "name": "Library User",
  "username": "user@example.com",
  "email": "user@example.com",
  "role": "USER"
}
```

Public registration always assigns `USER`. ADMIN accounts are seeded or must be provisioned administratively; clients cannot self-assign `ADMIN`.

## Swagger

Swagger UI and OpenAPI are public and do not redirect to login:

```text
http://localhost:8080/swagger-ui/index.html
http://localhost:8080/v3/api-docs
```

Use Swagger's **Authorize** button with the JWT returned by `/auth/login`.

## Spring Boot PostgreSQL APIs

Send `Authorization: Bearer <token>` for every endpoint below.

### Books

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/books` | ADMIN, USER | View all books |
| GET | `/books/{id}` | ADMIN, USER | View one book |
| POST | `/books` | ADMIN | Add book |
| PUT | `/books/{id}` | ADMIN | Update book |
| DELETE | `/books/{id}` | ADMIN | Delete book |

### Book Body

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "price": 650,
  "totalCopies": 4,
  "availableCount": 4
}
```

### Borrows

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/borrows` | ADMIN, USER | Admin sees all; user sees own records |
| GET | `/borrows/{id}` | ADMIN, USER | View borrow record |
| POST | `/borrows` | USER | Borrow a book |
| PUT | `/borrows/{id}` | ADMIN, USER | Update/return a borrow |
| DELETE | `/borrows/{id}` | ADMIN | Delete borrow record |

### Borrow Body

```json
{
  "bookId": 1
}
```

### Return Body

```json
{
  "status": "RETURNED"
}
```

## Node.js MongoDB APIs

These routes store data in MongoDB database `library_mongo`.

### Search History

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/search` | Create search history |
| GET | `/search` | List search history |
| PUT | `/search/{id}` | Update search history |
| DELETE | `/search/{id}` | Delete search history |

```json
{
  "userId": "1",
  "keyword": "clean code"
}
```

### Activity Logs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/activity` | Create activity log |
| GET | `/activity` | List activity logs |
| PUT | `/activity/{id}` | Update activity log |
| DELETE | `/activity/{id}` | Delete activity log |

```json
{
  "userId": "1",
  "action": "BORROW_BOOK",
  "description": "Borrowed Clean Code"
}
```

### Recommendations

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/recommendations` | Create recommendation |
| GET | `/recommendations` | List recommendations |
| PUT | `/recommendations/{id}` | Update recommendation |
| DELETE | `/recommendations/{id}` | Delete recommendation |

```json
{
  "userId": "1",
  "bookId": "1",
  "reason": "Recommended because you borrowed a Programming book"
}
```
