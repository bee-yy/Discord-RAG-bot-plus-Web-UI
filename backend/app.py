from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
    StorageContext,
    load_index_from_storage,
)
from llama_index.llms.groq import Groq
from llama_index.embeddings.fastembed import FastEmbedEmbedding  # ✅ Render-friendly
import os
from dotenv import load_dotenv
from typing import Optional, List
from contextlib import asynccontextmanager
import traceback
import logging
import time

# =============================
# Setup logging
# =============================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# =============================
# Paths
# =============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# You can override these on Render via env vars if needed
KNOWLEDGE_DIR = os.getenv("KNOWLEDGE_DIR", os.path.join(BASE_DIR, "knowledge_base"))

# ✅ Render-safe writable default. Use a Render Disk later and set PERSIST_DIR=/var/data/storage
PERSIST_DIR = os.getenv("PERSIST_DIR", "/tmp/storage")

# =============================
# Load environment variables
# =============================
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =============================
# Globals
# =============================
vector_index: Optional[VectorStoreIndex] = None
response_cache = {}  # Simple response cache


def load_knowledge_base() -> bool:
    """Load all .md and .txt files from knowledge_base/ and build/load an index."""
    global vector_index
    try:
        os.makedirs(PERSIST_DIR, exist_ok=True)

        # Try to load existing index
        if os.path.exists(PERSIST_DIR) and os.listdir(PERSIST_DIR):
            logger.info("📂 Loading existing index from storage...")
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            vector_index = load_index_from_storage(storage_context)
            logger.info("✅ Index loaded from storage")
            return True

        # Build new index if not exists
        logger.info("📚 Loading knowledge base...")

        if not os.path.exists(KNOWLEDGE_DIR):
            logger.error(f"❌ knowledge_base directory does not exist: {KNOWLEDGE_DIR}")
            return False

        reader = SimpleDirectoryReader(
            input_dir=KNOWLEDGE_DIR,
            required_exts=[".md", ".txt"],
            recursive=False,
        )
        documents = reader.load_data()

        if not documents:
            logger.warning("⚠️ No documents found in knowledge_base/")
            return False

        logger.info(f"📄 Found {len(documents)} document(s)")
        logger.info("Building vector index...")
        vector_index = VectorStoreIndex.from_documents(documents)

        vector_index.storage_context.persist(persist_dir=PERSIST_DIR)
        logger.info(f"✅ Knowledge base built and saved to: {PERSIST_DIR}")
        return True

    except Exception as e:
        logger.error(f"❌ Error loading KB: {e}")
        logger.error(traceback.format_exc())
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global vector_index

    logger.info("\n" + "=" * 50)
    logger.info("🚀 RAG Backend Starting")
    logger.info("=" * 50)

    # Init models (keep out of top-level import)
    try:
        if not GROQ_API_KEY:
            logger.warning("⚠️ Missing GROQ_API_KEY (service will run, but /ask will fail)")
        else:
            logger.info("Initializing LLM and embedding models...")

            Settings.llm = Groq(model="llama-3.3-70b-versatile", api_key=GROQ_API_KEY)

            # ✅ CPU embeddings, no torch/transformers
            Settings.embed_model = FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")

            Settings.chunk_size = 512
            Settings.chunk_overlap = 50
            logger.info("✅ Models initialized successfully")
    except Exception as e:
        logger.error(f"❌ Error initializing models: {e}")
        logger.error(traceback.format_exc())

    # Load/build KB
    try:
        ok = load_knowledge_base()
        if ok:
            logger.info("✅ Knowledge base ready")
        else:
            logger.warning("⚠️ Knowledge base not loaded (check folder + files)")
    except Exception as e:
        logger.error(f"❌ KB init failed: {e}")
        logger.error(traceback.format_exc())

    logger.info("=" * 50)
    logger.info("✅ Service started (Render uses $PORT)")
    logger.info("=" * 50 + "\n")

    yield
    logger.info("👋 Shutting down...")


app = FastAPI(lifespan=lifespan)

# CORS (defaults to *). You can set CORS_ORIGINS="https://a.com,https://b.com"
cors_origins = os.getenv("CORS_ORIGINS", "*").strip()
allow_origins = ["*"] if cors_origins == "*" else [o.strip() for o in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str

class Source(BaseModel):
    text: str
    document: str
    score: Optional[float]

class AskResponse(BaseModel):
    question: str
    answer: str
    sources: List[Source]
    processing_time: Optional[float] = None


@app.get("/")
def root():
    return {
        "status": "online",
        "knowledge_base": "✅ Loaded" if vector_index else "❌ Not loaded",
        "paths": {"knowledge_dir": KNOWLEDGE_DIR, "storage_dir": PERSIST_DIR},
        "endpoints": ["/ask", "/health", "/reload"],
    }

@app.get("/health")
def health():
    llm_model = getattr(getattr(Settings, "llm", None), "model", None)
    return {
        "groq_api_key": "✅" if GROQ_API_KEY else "❌",
        "knowledge_base": "✅" if vector_index else "❌",
        "llm": llm_model if llm_model else "Not set",
        "embed_model": type(Settings.embed_model).__name__ if Settings.embed_model else "Not set",
        "cached_responses": len(response_cache),
    }

@app.post("/ask", response_model=AskResponse)
def ask_question(request: AskRequest):
    start_time = time.time()
    question = request.question.strip()

    logger.info(f"Received question: {question!r}")

    if not question:
        raise HTTPException(400, "Question is empty")

    if not GROQ_API_KEY or not Settings.llm:
        raise HTTPException(503, "GROQ_API_KEY missing or LLM not initialized")

    if not vector_index:
        raise HTTPException(503, "Knowledge base not loaded")

    # Cache check
    if question in response_cache:
        cached = response_cache[question]
        return cached.model_copy(update={"processing_time": round(time.time() - start_time, 2)})

    try:
        query_engine = vector_index.as_query_engine(similarity_top_k=3)
        response = query_engine.query(question)

        sources: List[Source] = []
        if getattr(response, "source_nodes", None):
            for node in response.source_nodes:
                sources.append(
                    Source(
                        text=node.node.get_content()[:200] + "...",
                        document=node.node.metadata.get("file_name", "unknown"),
                        score=round(float(node.score), 3) if node.score else None,
                    )
                )

        result = AskResponse(
            question=question,
            answer=str(response),
            sources=sources,
            processing_time=round(time.time() - start_time, 2),
        )

        # Cache up to 50 entries
        if len(response_cache) < 50:
            response_cache[question] = result

        return result

    except Exception as e:
        logger.error(f"❌ Error during query: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(500, f"Error querying KB: {str(e)}")


@app.post("/reload")
def reload():
    global response_cache
    response_cache = {}
    if load_knowledge_base():
        return {"message": "Reloaded successfully", "cache_cleared": True}
    raise HTTPException(500, "Reload failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
