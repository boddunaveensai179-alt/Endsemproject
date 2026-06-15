import logging
import os
from typing import Iterable

import httpx
from fastapi import HTTPException, Request, Response

logger = logging.getLogger("library-gateway")
logging.basicConfig(level=logging.INFO)

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

SPRING_PREFIXES = ("auth", "books", "borrows", "notifications", "users")
NODE_PREFIXES = ("search", "activity", "recommendations")

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def target_for_path(path: str) -> str:
    root = path.split("/", 1)[0]
    if root in SPRING_PREFIXES:
        return SPRING_BOOT_URL
    if root in NODE_PREFIXES:
        return NODE_BACKEND_URL
    raise HTTPException(status_code=404, detail=f"No gateway route configured for /{path}")


async def proxy_request(path: str, request: Request) -> Response:
    base_url = target_for_path(path)
    target_url = f"{base_url}/{path}"

    headers = filter_headers(request.headers.items())
    body = await request.body()

    logger.info("%s %s -> %s", request.method, request.url.path, target_url)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream_response = await client.request(
                method=request.method,
                url=target_url,
                params=request.query_params,
                content=body,
                headers=headers,
            )
    except httpx.RequestError as exc:
        logger.exception("Gateway upstream error for %s", target_url)
        raise HTTPException(
            status_code=502,
            detail=f"Upstream service unavailable: {exc.__class__.__name__}",
        ) from exc

    response_headers = filter_headers(upstream_response.headers.items())
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=dict(response_headers),
        media_type=upstream_response.headers.get("content-type"),
    )


def filter_headers(headers: Iterable[tuple[str, str]]) -> dict[str, str]:
    return {
        key: value
        for key, value in headers
        if key.lower() not in HOP_BY_HOP_HEADERS
    }
