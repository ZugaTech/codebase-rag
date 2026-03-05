import { useState, useCallback, useRef } from 'react';
import { IndexingJob } from '../types';
import { apiClient } from '../api/client';

export const useIndexer = () => {
    const [status, setStatus] = useState<IndexingJob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pollInterval = useRef<number | null>(null);

    const startIndexing = async (path: string) => {
        setError(null);
        try {
            const { job_id } = await apiClient.index(path);
            pollStatus(job_id);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const pollStatus = useCallback((jobId: string) => {
        if (pollInterval.current) window.clearInterval(pollInterval.current);

        pollInterval.current = window.setInterval(async () => {
            try {
                const job = await apiClient.getStatus(jobId);
                setStatus(job);
                if (job.status === 'done' || job.status === 'error') {
                    if (pollInterval.current) window.clearInterval(pollInterval.current);
                    if (job.status === 'error') setError(job.error);
                }
            } catch (err: any) {
                setError(err.message);
                if (pollInterval.current) window.clearInterval(pollInterval.current);
            }
        }, 1500);
    }, []);

    return { status, error, startIndexing };
};
