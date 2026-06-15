# Production Deployment Guide (Render + MongoDB Atlas + PostgreSQL)

This guide provides step-by-step instructions to deploy the entire library management system to production.

---

## 1. PostgreSQL Cloud Database Setup

You can use any cloud PostgreSQL provider (such as Neon, Supabase, or Aiven).

1. Create a PostgreSQL instance on your preferred cloud provider.
2. Create a database named `library_db` (or `digital_library`).
3. Obtain your database credentials:
   - **JDBC URL** (e.g. `jdbc:postgresql://<host>:<port>/<dbname>`)
   - **Username**
   - **Password**
4. Keep these values handy for the Spring Boot configuration.

---

## 2. MongoDB Atlas Setup

1. Create a free account at [mongodb.com](https://www.mongodb.com/).
2. Create a new Shared Cluster (M0 - Free).
3. Under **Database Access**, create a user (e.g., `db_user`) with read/write permissions.
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Render's free tier IP addresses rotate.
5. Click **Connect** ➡️ **Drivers** and copy your **connection string**:
   - `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/library_mongo?retryWrites=true&w=majority`
6. Keep this value handy for the Node.js configuration.

---

## 3. Deplaying to Render

You can deploy all services automatically using the Blueprint file (`render.yaml`) or set them up manually.

### Option A: Automatic Blueprint Deployment (Recommended)
1. Commit all files (including `render.yaml` and `library/Dockerfile`) and push them to your GitHub repository.
2. In the Render Dashboard, click **New +** ➡️ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/boddunaveensai179-alt/Endsemproject.git`
4. Render will parse the `render.yaml` file and create all 4 services.
5. Input the required environment variables (e.g. `DB_URL`, `MONGO_URI`) when prompted in the UI.

---

### Option B: Manual Service Deployment

If you prefer to create the services manually, use these configurations:

#### Service 1: Spring Boot Backend
- **Service Type:** Web Service
- **Runtime:** `Docker`
- **Docker Build Context:** `library` (or root context with Dockerfile path `library/Dockerfile`)
- **Docker Command:** *Leave empty* (uses CMD from Dockerfile)
- **Environment Variables:** Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DDL_AUTO`, and `JWT_SECRET`.

#### Service 2: Node.js Backend
- **Service Type:** Web Service
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Root Directory:** `node-backend`
- **Environment Variables:** Set `MONGO_URI`.

#### Service 3: FastAPI Gateway
- **Service Type:** Web Service
- **Runtime:** `Python`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `gateway`
- **Environment Variables:** 
  - `SPRING_BOOT_URL` (Public URL of Spring Boot Service, e.g., `https://library-spring-backend.onrender.com`)
  - `NODE_BACKEND_URL` (Public URL of Node.js Service, e.g., `https://library-node-backend.onrender.com`)

#### Service 4: React Frontend
- **Service Type:** Static Site
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`
- **Root Directory:** `frontend`
- **Environment Variables:**
  - `REACT_APP_API_URL` (Public URL of FastAPI Gateway Service, e.g., `https://library-fastapi-gateway.onrender.com`)

---

## 4. Post-Deployment Verification Checklist

Once all services show a green status (Deployed) in Render, verify the integration:

1. **Gateway Health Check:**
   - Open `<your-fastapi-gateway-url>/health` in your browser.
   - Verify that it returns `status: UP` and lists the correct internal/external URLs of Spring Boot and Node.js.
2. **Login Test:**
   - Open your deployed React frontend URL.
   - Navigate to the login page.
   - Click the Admin tab and log in (`admin` / `123456`).
   - If successful, you will be routed to the dashboard.
3. **Database Transactions:**
   - Register a new standard user in the UI.
   - Search for a book (this logs the keyword in MongoDB Atlas).
   - Borrow a book (this creates a transaction in PostgreSQL and decrements the book count).
   - Return the book (verifies PostgreSQL updates).
