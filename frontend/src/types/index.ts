export interface Citation {
    filepath: string;
    start_line: number;
    end_line: number;
    snippet: string;
    relevance_score: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    timestamp: number;
}

export interface IndexingJob {
    job_id: string;
    path: string;
    status: 'pending' | 'running' | 'done' | 'error';
    total_files: number;
    processed_files: number;
    total_chunks: number;
    error: string | null;
    started_at: string;
    finished_at: string | null;
}

export interface Collection {
    name: string;
}
