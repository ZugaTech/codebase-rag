from dataclasses import dataclass
from typing import List
from app.services.embedder import embed_query
from app.models.db import get_chroma_client
from app.core.logging import logger

@dataclass
class RetrievedChunk:
    chunk_id: str
    filepath: str
    start_line: int
    end_line: int
    content: str
    language: str
    distance: float
    relevance_score: float

async def retrieve(query: str, collection_name: str, top_k: int) -> List[RetrievedChunk]:
    try:
        client = get_chroma_client()
        collection = client.get_collection(name=collection_name)
        
        query_embedding = await embed_query(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        if not results['ids'] or not results['ids'][0]:
            return []
            
        chunks = []
        for i in range(len(results['ids'][0])):
            distance = results['distances'][0][i]
            relevance_score = 1 / (1 + distance)
            
            metadata = results['metadatas'][0][i]
            
            chunks.append(RetrievedChunk(
                chunk_id=results['ids'][0][i],
                filepath=metadata['filepath'],
                start_line=metadata['start_line'],
                end_line=metadata['end_line'],
                content=results['documents'][0][i],
                language=metadata['language'],
                distance=distance,
                relevance_score=relevance_score
            ))
            
        # TODO: Implement re-ranking (e.g., boosting recently accessed files)
        # Deduplicate overlapping chunks could also be done here
            
        return chunks
    except Exception as e:
        logger.error(f"Error during retrieval: {e}")
        raise
