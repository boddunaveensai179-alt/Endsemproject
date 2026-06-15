# Library Management System Review and Upgrade Plan

## Existing Folder Structure

```text
Endsem_project/
├── backend/                  # Main Spring Boot service used by README and frontend
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/library/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── entity/
│       │   ├── repository/
│       │   ├── service/
│       │   └── LibraryApplication.java
│       └── resources/application.properties
├── frontend/                 # Existing React app
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/api.js
├── library/                  # Older/generated Spring Boot copy with Maven wrapper
├── frontend.worktrees/       # Previous worktree snapshots
├── gateway/                  # Added FastAPI API gateway
├── node-backend/             # Added Express/MongoDB service
└── docs/                     # Added academic review docs and Postman collection
```

## Existing Frontend Features

- React app with login, signup, dashboard, book listing, add book, search, and my borrows pages.
- Reusable components for navbar, book cards, modal dialogs, loader, category filtering, search bar, and toast notifications.
- Role-aware navigation existed visually, but auth tokens and borrow data were previously simulated in localStorage.
- Book CRUD UI existed for admins, but it called Spring Boot directly and did not use a gateway.

## Existing Backend Features

- `backend/` already contained Spring Boot Book entity, repository, service, controller, and PostgreSQL configuration.
- Book CRUD endpoints existed at `/books`.
- Spring Security was present as a dependency, but the configured filter chain allowed every request.
- `library/` contained older auth classes, but passwords were plain text and the folder was not the main backend described by the project README.

## Existing Database Design

- PostgreSQL was configured for one `books` table.
- No production-ready `users`, `roles`, or `borrows` table implementation existed in the main backend.
- No MongoDB service, models, or collections existed.

## Missing Rubric Requirements Before Upgrade

- Full JWT authentication with BCrypt password hashing.
- RBAC enforced by Spring Security for ADMIN and USER permissions.
- Role entity/repository/service.
- Borrow entity/repository/service/controller with PostgreSQL relationships.
- PostgreSQL database name `library_db` and schema for `users`, `roles`, `books`, `borrows`.
- FastAPI gateway with centralized routing, CORS, health, logging, and error handling.
- Node.js backend with Express/Mongoose CRUD APIs.
- MongoDB collections for search history, activity logs, and recommendations.
- Frontend gateway-only API calls.
- Real borrow/return integration.
- Postman collection, API docs, setup guide, and run guide.

## Implementation Plan Applied

1. Keep `backend/` as the authoritative Spring Boot service and preserve Book CRUD.
2. Add secure auth using BCrypt and stateless JWT.
3. Add RBAC with ADMIN and USER roles and protect Book/Borrow endpoints.
4. Add Borrow CRUD and inventory updates in PostgreSQL.
5. Add FastAPI gateway on port `8000`.
6. Add Express/Mongoose service on port `5000` for MongoDB-backed search/activity/recommendations.
7. Change React to call only `http://localhost:8000`.
8. Replace fake localStorage borrow behavior with real API calls.
9. Add documentation and Postman collection for academic review.
