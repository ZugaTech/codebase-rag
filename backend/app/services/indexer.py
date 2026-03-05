import os
import uuid
import asyncio
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, Optional, List
import tiktoken
from app.core.config import settings
from app.core.logging import logger
from app.services.embedder import embed_texts
from app.models.db import get_chroma_client
import re

@dataclass
class IndexingJob:
    job_id: str
    path: str
    status: str  # "pending"|"running"|"done"|"error"
    total_files: int
    processed_files: int
    total_chunks: int
    error: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]

@dataclass
class CodeChunk:
    chunk_id: str
    filepath: str
    start_line: int
    end_line: int
    content: str
    language: str

# In-memory job store
actve_jobs: Dict[str, IndexingJob] = {}

def get_job_status(job_id: str) -> Optional[IndexingJob]:
    return actve_jobs.get(job_id)

def get_ext(filepath: str) -> str:
    _, ext = os.path.splitext(filepath)
    return ext.lower()

def is_supported(filepath: str) -> bool:
    return get_ext(filepath) in settings.SUPPORTED_EXTENSIONS

def slugify(text: str) -> str:
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def chunk_file(filepath: str) -> List[CodeChunk]:
    chunks = []
    try:
        size_kb = os.path.getsize(filepath) / 1024
        if size_kb > settings.MAX_FILE_SIZE_KB:
            logger.info(f"Skipping {filepath}: too large ({size_kb} KB)")
            return []

        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        content = "".join(lines)
        enc = tiktoken.get_encoding("cl100k_base")
        tokens = enc.encode(content)
        
        chunk_size = settings.CHUNK_SIZE
        overlap = settings.CHUNK_OVERLAP
        
        start_idx = 0
        while start_idx < len(tokens):
            end_idx = min(start_idx + chunk_size, len(tokens))
            chunk_tokens = tokens[start_idx:end_idx]
            chunk_text = enc.decode(chunk_tokens)
            
            # Simple line estimation (not perfectly accurate but sufficient)
            start_line = content[:content.find(chunk_text)].count('\n') + 1
            end_line = start_line + chunk_text.count('\n')
            
            chunks.append(CodeChunk(
                chunk_id=str(uuid.uuid4()),
                filepath=filepath,
                start_line=start_line,
                end_line=end_line,
                content=chunk_text,
                language=get_ext(filepath)[1:]
            ))
            
            start_idx += (chunk_size - overlap)
            
    except Exception as e:
        logger.warning(f"Error reading/chunking {filepath}: {e}")
    return chunks

async def process_indexing(job_id: str):
    job = actve_jobs[job_id]
    job.status = "running"
    try:
        all_filepaths = []
        for root, dirs, files in os.walk(job.path):
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'dist', 'build'] and not d.startswith('.')]
            for file in files:
                if is_supported(file):
                    all_filepaths.append(os.path.join(root, file))
        
        job.total_files = len(all_filepaths)
        
        all_chunks = []
        for filepath in all_filepaths:
            chunks = chunk_file(filepath)
            all_chunks.extend(chunks)
            job.processed_files += 1
            job.total_chunks = len(all_chunks)
            await asyncio.sleep(0) # Yield control
            
        client = get_chroma_client()
        collection_name = slugify(job.path)
        if not collection_name:
            collection_name = "default-collection"
        
        # Ensure name satisfies Chroma requirements (3-63 chars, alphanumeric or hyphen/underscore)
        collection_name = re.sub(r'[^a-zA-Z0-9_-]', '', collection_name)
        if len(collection_name) < 3: collection_name = "col-" + collection_name.ljust(3, '0')
        collection_name = collection_name[:63]
            
        try:
            client.delete_collection(collection_name)
        except Exception:
            pass
            
        collection = client.create_collection(name=collection_name)
        
        # Batch embedding and upsert
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i+batch_size]
            texts = [c.content for c in batch]
            embeddings = await embed_texts(texts)
            
            collection.add(
                ids=[c.chunk_id for c in batch],
                embeddings=embeddings,
                documents=texts,
                metadatas=[{
                    "filepath": c.filepath,
                    "start_line": c.start_line,
                    "end_line": c.end_line,
                    "language": c.language
                } for c in batch]
            )
            
        job.status = "done"
        job.finished_at = datetime.utcnow()
        logger.info(f"Job {job_id} finished successfully. Collection: {collection_name}")
            
    except Exception as e:
        job.status = "error"
        job.error = str(e)
        job.finished_at = datetime.utcnow()
        logger.error(f"Job {job_id} failed: {e}")

async def start_indexing_job(path: str) -> str:
    if not os.path.exists(path) or not os.path.isdir(path):
        raise ValueError(f"Invalid path: {path}")
        
    job_id = str(uuid.uuid4())
    actve_jobs[job_id] = IndexingJob(
        job_id=job_id,
        path=path,
        status="pending",
        total_files=0,
        processed_files=0,
        total_chunks=0,
        error=None,
        started_at=datetime.utcnow(),
        finished_at=None
    )
    
    asyncio.create_task(process_indexing(job_id))
    return job_id
