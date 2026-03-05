from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import QueryRequest
from app.services.retriever import retrieve
from app.services.generator import generate_answer
from app.core.config import settings

router = APIRouter()

@router.post("/query")
async def query_codebase(req: QueryRequest):
    top_k = req.top_k or settings.TOP_K
    try:
        chunks = await retrieve(req.query, req.collection_name, top_k)
        
        async def event_generator():
            try:
                # Assuming `generate_answer` yields JSON string chunks directly 
                # that we want to stream back to the client.
                full_json = ""
                async for chunk in generate_answer(req.query, chunks, settings.CHAT_MODEL):
                    full_json += chunk
                    yield f"data: {chunk}\n\n"
                
                # We could alternatively parse the final JSON and send it in a specific format
                yield f"data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
