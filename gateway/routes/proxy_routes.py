from fastapi import APIRouter, Request

from services.proxy_service import proxy_request

router = APIRouter()


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def route_to_backend(path: str, request: Request):
    return await proxy_request(path, request)
