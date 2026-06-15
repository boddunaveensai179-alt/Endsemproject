# React Frontend Setup

The existing React app has been upgraded to use the FastAPI gateway as its only API entry point.

## API Base URL

Default:

```text
http://localhost:8000
```

Optional environment override:

```text
REACT_APP_API_URL=http://localhost:8000
```

The frontend no longer calls Spring Boot directly.

## Install

```powershell
cd frontend
npm install
```

## Run

```powershell
npm start
```

Runs on:

```text
http://localhost:3000
```

## Build

```powershell
npm run build
```

## Integrated Features

- Login/register through `React -> FastAPI -> Spring Boot -> PostgreSQL`
- Admin book add/edit/delete through protected Spring Boot APIs
- User borrow/return through protected Spring Boot APIs
- Search history through `React -> FastAPI -> Node.js -> MongoDB`
- Activity logs and recommendations through MongoDB service
- Role-based navigation for ADMIN and USER

See `docs/SETUP_GUIDE.md` and `docs/RUN_GUIDE.md` for full startup order.
