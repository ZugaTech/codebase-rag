import pytest
from app.services.indexer import chunk_file
import os
import tempfile

def test_chunk_file():
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as tf:
        tf.write("line1\nline2\nline3\n" * 100) # Ensure it's large enough to chunk
        tf_path = tf.name
    
    try:
        chunks = chunk_file(tf_path)
        assert len(chunks) > 0
        assert chunks[0].filepath == tf_path
        assert ".py" in tf_path
    finally:
        os.remove(tf_path)
