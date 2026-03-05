# codebase-rag

An intelligent, semantic search engine for your local codebases. Ask questions in natural language and get answers with exact file citations.

## Architecture

```text
Browser (React) 
 │
 ▼
FastAPI Backend ────► OpenAI API (Embeddings & Completion)
 │
 ▼
ChromaDB (Vector Store)
```

## Quickstart

1. **Clone and Setup Environment**
 ```bash
 cp .env.example .env
 # Edit .env and add your OPENAI_API_KEY
 ```

2. **Run with Docker**
 ```bash
 docker-compose up --build
 ```

3. **Access the App**
 - Frontend: [http://localhost:3000](http://localhost:3000)
 - API Docs: [http://localhost:8001/docs](http://localhost:8001/docs)

## How It Works

### 1. Indexing Pipeline
- **Crawl**: Recursively walks the directory, respecting exclusions (`.git`, `node_modules`, etc.).
- **Supported Files**: Processes `.py`, `.js`, `.ts`, `.tsx`, `.java`, `.go`, `.rs`, `.rb`, `.cpp`, `.c`, `.h`, `.cs`, `.md`, `.yaml`, `.json`, `.toml`.
- **Chunking**: Uses `tiktoken` (cl100k_base) for token-aware sliding window chunking to preserve context.
- **Embedding**: Generates vectors using OpenAI's `text-embedding-3-small`.
- **Storage**: Upserts into a dedicated ChromaDB collection.

### 2. RAG Pipeline
- **Retrieval**: Embeds query, performs vector search in ChromaDB and calculates relevance scores.
- **Generation**: Passes top-k chunks to GPT-4o with a strict system prompt to avoid hallucinations and ensure citations.
- **Streaming**: Responses are streamed via Server-Sent Events (SSE) for a low-latency UI experience.

## API Reference

- `POST /api/index`: Index a codebase directory.
- `GET /api/status/{job_id}`: Poll for indexing progress.
- `POST /api/query`: Stream answers for a natural language query.
- `GET /api/collections`: List available codebases.
- `DELETE /api/collections/{name}`: Remove an indexed codebase.

## Limitations & Roadmap

- **Local Paths**: Currently only supports local directory paths accessible to the Docker container (use volumes for external paths).
- **Authentication**: No built-in auth for the UI or API.
- **Future Improvements**:
 - VS Code Extension integration.
 - Support for indexing remote GitHub repositories.
 - Cross-encoder re-ranking for higher precision.
 - Support for more file types (PDF, Office) for documentation.