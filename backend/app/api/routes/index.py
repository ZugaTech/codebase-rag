from fastapi import APIRouter, HTTPException
from app.models.schemas import IndexRequest, IndexResponse
from app.services.indexer import start_indexing_job

router = APIRouter()

@router.post("/index", response_model=IndexResponse)
async def index_codebase(req: IndexRequest):
    try:
        job_id = await start_indexing_job(req.path)
        return IndexResponse(job_id=job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
