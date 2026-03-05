from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4o"
    CHUNK_SIZE: int = 400
    CHUNK_OVERLAP: int = 80
    TOP_K: int = 8
    MAX_FILE_SIZE_KB: int = 500
    SUPPORTED_EXTENSIONS: list[str] = [
        ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", 
        ".rs", ".rb", ".cpp", ".c", ".h", ".cs", ".md", 
        ".yaml", ".json", ".toml"
    ]

    class Config:
        env_file = ".env"

settings = Settings()
