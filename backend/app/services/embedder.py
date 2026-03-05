import asyncio
from typing import List
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.logging import logger

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def embed_texts(texts: List[str]) -> List[List[float]]:
    retries = 3
    for attempt in range(retries):
        try:
            response = await client.embeddings.create(
                input=texts,
                model=settings.EMBEDDING_MODEL
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.warning(f"Error embedding texts (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                logger.error(f"Failed to embed texts after {retries} attempts.")
                raise e

async def embed_query(text: str) -> List[float]:
    embeddings = await embed_texts([text])
    return embeddings[0]
