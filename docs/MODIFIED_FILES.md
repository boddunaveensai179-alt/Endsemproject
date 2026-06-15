# Modified Files Summary

This document explains why each upgraded file exists and how it connects to the full system. Complete source code is in the file paths listed here.

## Spring Boot Backend

| File | Why It Was Added or Modified | Integration |
| --- | --- | --- |
| `backend/pom.xml` | Existing Maven project kept as the authoritative Spring Boot backend. Existing Spring Security, JPA, validation, PostgreSQL, and web dependencies support the upgrade. | Built with `library/mvnw.cmd`; runs on port `8080`. |
| `backend/SETUP.md` | Replaced outdated setup notes with current `library_db`, JWT, and gateway-based instructions. | Helps reviewers run the Spring Boot service correctly. |
| `backend/src/main/resources/application.properties` | Changed database to `library_db`, added JWT secret/expiry config, preserved JPA update and server settings. | Connects Spring Boot to PostgreSQL and JWT signing. |
| `backend/src/main/resources/schema.sql` | Added review-ready SQL schema for `users`, `roles`, `books`, and `borrows`. | Documents and can initialize PostgreSQL schema. |
| `backend/src/main/java/com/example/library/entity/Book.java` | Extended existing Book entity with price, total copies, available copies, validation, and borrow relationship. | Used by Book CRUD and Borrow inventory updates. |
| `backend/src/main/java/com/example/library/entity/User.java` | Added secure user entity with BCrypt-stored password and role relationship. | Used by auth, JWT, RBAC, and borrow ownership. |
| `backend/src/main/java/com/example/library/entity/Role.java` | Added role entity for ADMIN and USER. | Used by Spring Security authorities. |
| `backend/src/main/java/com/example/library/entity/Borrow.java` | Added borrow entity with userId, bookId, borrowDate, returnDate, and status. | Stores PostgreSQL borrow/return records. |
| `backend/src/main/java/com/example/library/repository/BookRepository.java` | Existing repository preserved. | Provides Book CRUD through JPA. |
| `backend/src/main/java/com/example/library/repository/UserRepository.java` | Added user lookup by email. | Used by auth and security filter. |
| `backend/src/main/java/com/example/library/repository/RoleRepository.java` | Added role lookup by name. | Used by role seeding and registration. |
| `backend/src/main/java/com/example/library/repository/BorrowRepository.java` | Added borrow lookup by user and active borrow state. | Used by My Borrows and duplicate borrow prevention. |
| `backend/src/main/java/com/example/library/service/BookService.java` | Tightened validation and update logic while preserving CRUD behavior. | Powers `/books` endpoints. |
| `backend/src/main/java/com/example/library/service/AuthService.java` | Added registration/login with BCrypt and JWT response. | Powers `/auth/register` and `/auth/login`. |
| `backend/src/main/java/com/example/library/service/RoleService.java` | Added role normalization and creation. | Keeps roles consistent as ADMIN or USER. |
| `backend/src/main/java/com/example/library/service/BorrowService.java` | Added borrow CRUD and inventory adjustments. | Powers borrow/return workflow. |
| `backend/src/main/java/com/example/library/controller/AuthController.java` | Added public auth endpoints. | Called by React through FastAPI gateway. |
| `backend/src/main/java/com/example/library/controller/BookController.java` | Updated existing controller with RBAC annotations. | ADMIN manages books; USER views books. |
| `backend/src/main/java/com/example/library/controller/BorrowController.java` | Added protected borrow APIs. | USER borrows/returns own books; ADMIN can manage records. |
| `backend/src/main/java/com/example/library/security/SecurityConfig.java` | Replaced permit-all config with stateless JWT security, CORS, BCrypt, public Swagger, and RBAC rules. | Enforces protected Spring APIs. |
| `backend/src/main/java/com/example/library/security/OpenApiConfig.java` | Added OpenAPI metadata and JWT bearer authorization support. | Keeps Swagger public while allowing protected API testing. |
| `backend/src/main/java/com/example/library/security/JwtUtil.java` | Added JWT creation and validation. | Generates/validates tokens without extra JWT dependency. |
| `backend/src/main/java/com/example/library/security/JwtFilter.java` | Added request filter that authenticates Bearer tokens. | Places authenticated user into Spring Security context. |
| `backend/src/main/java/com/example/library/security/CustomUserDetailsService.java` | Added email-based user loading. | Bridges database users to Spring Security. |
| `backend/src/main/java/com/example/library/security/JwtAuthenticationEntryPoint.java` | Added JSON 401 response. | Gives frontend clean auth errors. |
| `backend/src/main/java/com/example/library/exception/GlobalExceptionHandler.java` | Added centralized API error responses. | Keeps gateway/frontend error handling predictable. |
| `backend/src/main/java/com/example/library/bootstrap/DataInitializer.java` | Added default roles, demo users, and starter books. | Helps reviewers test immediately. |

## FastAPI Gateway

| File | Why It Was Added | Integration |
| --- | --- | --- |
| `gateway/requirements.txt` | Lists FastAPI, Uvicorn, HTTPX, and multipart dependencies. | Installs gateway runtime. |
| `gateway/main.py` | Defines gateway app, CORS, health endpoint, and router registration. | Public API entry point on port `8000`. |
| `gateway/routes/proxy_routes.py` | Adds catch-all proxy route. | Forwards frontend requests by path prefix. |
| `gateway/services/proxy_service.py` | Adds routing, logging, header cleanup, error handling, and HTTPX forwarding. | Sends Spring routes to `8080` and Node routes to `5000`. |
| `gateway/routes/__init__.py` | Marks routes as a Python package. | Supports imports. |
| `gateway/services/__init__.py` | Marks services as a Python package. | Supports imports. |

## Node.js Backend

| File | Why It Was Added | Integration |
| --- | --- | --- |
| `node-backend/package.json` | Defines Express, Mongoose, CORS, and scripts. | Runs Mongo service on port `5000`. |
| `node-backend/package-lock.json` | Captures installed dependency versions. | Reproducible Node installs. |
| `node-backend/server.js` | Creates Express app, CORS, health endpoint, routes, and error handler. | Receives gateway-forwarded Mongo APIs. |
| `node-backend/config/db.js` | Connects to `mongodb://localhost:27017/library_mongo`. | Enables MongoDB persistence. |
| `node-backend/models/SearchHistory.js` | Defines `search_history` schema. | Stores frontend search keywords. |
| `node-backend/models/ActivityLog.js` | Defines `activity_logs` schema. | Stores login/search/borrow/return activity. |
| `node-backend/models/Recommendation.js` | Defines `recommendations` schema. | Stores book recommendations. |
| `node-backend/controllers/searchController.js` | Adds CRUD for search history. | Used by `/search`. |
| `node-backend/controllers/activityController.js` | Adds CRUD for activity logs. | Used by `/activity`. |
| `node-backend/controllers/recommendationController.js` | Adds CRUD for recommendations. | Used by `/recommendations`. |
| `node-backend/routes/searchRoutes.js` | Maps search routes. | Connected in `server.js`. |
| `node-backend/routes/activityRoutes.js` | Maps activity routes. | Connected in `server.js`. |
| `node-backend/routes/recommendationRoutes.js` | Maps recommendation routes. | Connected in `server.js`. |
| `node-backend/middleware/errorHandler.js` | Adds consistent JSON errors. | Used by all Node routes. |

## React Frontend

| File | Why It Was Modified | Integration |
| --- | --- | --- |
| `frontend/SETUP.md` | Replaced outdated direct-Spring frontend setup with gateway-based setup. | Documents that React must call `http://localhost:8000`. |
| `frontend/src/services/api.js` | Replaced direct Spring calls and fake token handling with real gateway, JWT, books, borrows, search, activity, and recommendation APIs. | All React traffic goes to `http://localhost:8000`. |
| `frontend/src/App.js` | Added role-aware protected routes. | Prevents USER from Add Book and ADMIN from My Borrows route. |
| `frontend/src/components/Navbar.js` | Tightened role-based navigation. | ADMIN sees Add Book; USER sees Search and My Borrows. |
| `frontend/src/components/BookCard.js` | Added active borrow-aware Borrow/Return actions. | Uses PostgreSQL borrow records instead of localStorage. |
| `frontend/src/pages/Login.js` | Uses real login error handling from gateway response. | Stores JWT and current user through API service. |
| `frontend/src/pages/Signup.js` | Uses real registration without client-controlled role assignment. | Creates secure USER accounts with BCrypt password storage. |
| `frontend/src/pages/Dashboard.js` | Shows books plus Mongo-backed recommendations and activity. | Demonstrates PostgreSQL and MongoDB integration. |
| `frontend/src/pages/BookListing.js` | Connects admin edit/delete and user borrow/return to real APIs. | Writes Spring borrows and Mongo activity/recommendations. |
| `frontend/src/pages/AddBook.js` | Adds admin guard, toast errors, and activity logging. | Writes books to PostgreSQL and activity to MongoDB. |
| `frontend/src/pages/MyBorrows.js` | Replaced localStorage borrows with live API data and return action. | Reads and updates PostgreSQL borrow records. |
| `frontend/src/pages/Search.js` | Saves debounced search history and activity logs to MongoDB. | Reads books from Spring and writes search trail to Node/Mongo. |

## Documentation

| File | Why It Was Added or Modified | Integration |
| --- | --- | --- |
| `README.md` | Replaced outdated direct Spring/React documentation with upgraded architecture and run instructions. | Entry point for reviewers. |
| `docs/PROJECT_REVIEW_AND_PLAN.md` | Captures Phase 1 analysis and implementation plan. | Directly answers the analysis phase. |
| `docs/API_DOCUMENTATION.md` | Documents gateway, auth, books, borrows, and Mongo APIs. | Helps test all services. |
| `docs/SETUP_GUIDE.md` | Documents prerequisites and installation. | Supports first-time setup. |
| `docs/RUN_GUIDE.md` | Documents startup order and service URLs. | Supports demo execution. |
| `docs/Library_Management_Postman_Collection.json` | Adds gateway-based Postman collection. | Supports API testing and review. |
| `docs/MODIFIED_FILES.md` | Explains every changed file and how it integrates. | Supports academic review requirements. |
| `docs/REVIEW_3_COMPLIANCE_REPORT.md` | Final phase-by-phase audit, verification evidence, and complete code for created files. | Supports Review-3 evaluation. |
