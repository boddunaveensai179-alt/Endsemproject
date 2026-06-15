from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.proxy_routes import router as proxy_router

app = FastAPI(
    title="Library Management API Gateway",
    description="Central API gateway for the React frontend, Spring Boot service, and Node.js service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "fastapi-gateway",
        "spring_boot": "http://localhost:8080",
        "node_backend": "http://localhost:5000",
    }


app.include_router(proxy_router)
