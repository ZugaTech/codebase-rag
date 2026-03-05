const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const apiClient = {
    async index(path: string) {
        const res = await fetch(`${API_URL}/api/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async getStatus(jobId: string) {
        const res = await fetch(`${API_URL}/api/status/${jobId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async listCollections() {
        const res = await fetch(`${API_URL}/api/collections`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async deleteCollection(name: string) {
        const res = await fetch(`${API_URL}/api/collections/${name}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};
