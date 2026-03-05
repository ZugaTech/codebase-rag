import pytest
from app.services.retriever import retrieve
from unittest.mock import MagicMock, patch

@pytest.mark.asyncio
async def test_retrieve_mock():
    # Mocking chroma and embedder since we don't have a running DB in pure unit tests
    with patch("app.services.retriever.get_chroma_client") as mock_chroma, \
         patch("app.services.retriever.embed_query") as mock_embed:
        
        mock_col = MagicMock()
        mock_chroma.return_value.get_collection.return_value = mock_col
        mock_embed.return_value = [0.1] * 1536
        
        mock_col.query.return_value = {
            'ids': [['1']],
            'distances': [[0.1]],
            'documents': [['content']],
            'metadatas': [[{'filepath': 'test.py', 'start_line': 1, 'end_line': 10, 'language': 'python'}]]
        }
        
        results = await retrieve("test", "test-col", 1)
        assert len(results) == 1
        assert results[0].filepath == "test.py"
        assert results[0].relevance_score > 0
