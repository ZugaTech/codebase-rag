import json
from typing import List, AsyncGenerator
from openai import AsyncOpenAI
from app.core.config import settings
from app.services.retriever import RetrievedChunk
from app.models.schemas import GeneratedAnswer, Citation
from app.core.logging import logger

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_answer(query: str, chunks: List[RetrievedChunk], model: str) -> AsyncGenerator[str, None]:
    system_prompt = """You are an expert code analyst. Answer questions about the codebase using ONLY the provided context. Always cite specific files and line numbers. If the answer is not in the context, say so explicitly.
You must return the response in JSON format.
The JSON should have the following schema:
{
    "answer": "Your detailed answer here, with markdown...",
    "citations": [
        {
            "filepath": "path/to/file.py",
            "start_line": 10,
            "end_line": 20,
            "snippet": "def foo():...",
            "relevance_score": 0.95
        }
    ]
}"""

    context_str = ""
    for c in chunks:
        context_str += f"[File: {c.filepath}, Lines {c.start_line}-{c.end_line}]\n```{c.language}\n{c.content}\n```\n\n"

    user_prompt = f"Context:\n{context_str}\n\nQuestion: {query}"

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            stream=True
        )

        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        yield json.dumps({"error": str(e)})

# Non-streaming fallback for full object processing if needed
async def generate_answer_full(query: str, chunks: List[RetrievedChunk], model: str) -> GeneratedAnswer:
    # Build complete string from stream, parse and return GeneratedAnswer
    full_content = ""
    async for chunk in generate_answer(query, chunks, model):
        full_content += chunk
    
    data = json.loads(full_content)
    citations = [Citation(**c) for c in data.get("citations", [])]
    
    return GeneratedAnswer(
        answer=data.get("answer", ""),
        citations=citations,
        model=model,
        prompt_tokens=0, # Optional: track token usage
        completion_tokens=0
    )
