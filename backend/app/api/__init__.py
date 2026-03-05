from fastapi import APIRouter
from app.api.routes import index, query, status
from app.models.db import get_chroma_client

api_router = APIRouter()
api_router.include_router(index.router, tags=["index"])
api_router.include_router(query.router, tags=["query"])
api_router.include_router(status.router, tags=["status"])

@api_router.get("/collections")
async def list_collections():
    client = get_chroma_client()
    cols = client.list_collections()
    return [{"name": c.name} for c in cols] # simplified

@api_router.delete("/collections/{name}")
async def delete_collection(name: str):
    client = get_chroma_client()
    client.delete_collection(name)
    return {"status": "ok"}

