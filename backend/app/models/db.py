import chromadb
from app.core.config import settings

class ChromaClientSingleton:
    _instance = None

    @classmethod
    def get_client(cls):
        if cls._instance is None:
            cls._instance = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        return cls._instance

def get_chroma_client():
    return ChromaClientSingleton.get_client()
