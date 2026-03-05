from pydantic import BaseModel
from typing import List, Optional

class IndexRequest(BaseModel):
    path: str

class IndexResponse(BaseModel):
    job_id: str

class QueryRequest(BaseModel):
    query: str
    collection_name: str
    top_k: Optional[int] = None

class Citation(BaseModel):
    filepath: str
    start_line: int
    end_line: int
    snippet: str
    relevance_score: float

class GeneratedAnswer(BaseModel):
    answer: str
    citations: List[Citation]
    model: str
    prompt_tokens: int
    completion_tokens: int
