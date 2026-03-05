import { useState, useCallback } from 'react';
import { Message, Citation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const useRAG = (collectionName: string) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitQuery = useCallback(async (query: string, onUpdate: (text: string) => void, onDone: (citations: Citation[]) => void) => {
        setIsStreaming(true);
        setError(null);
        let fullText = "";

        try {
            const response = await fetch(`${API_URL}/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, collection_name: collectionName }),
            });

            if (!response.ok) throw new Error(await response.text());
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            // Extract citations from the accumulated JSON if needed or wait for separate event
                            // In this simplified version, the backend sends tokens and we parse the final JSON.
                            // Re-parsing the whole thing because of SSE format
                            try {
                                const parsed = JSON.parse(fullText);
                                onDone(parsed.citations || []);
                            } catch (e) {
                                // Not complete JSON yet
                            }
                            continue;
                        }

                        try {
                            // If it's just a token string
                            fullText += data;
                            onUpdate(fullText);
                        } catch (e) { }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsStreaming(false);
        }
    }, [collectionName]);

    return { isStreaming, error, submitQuery };
};
