from unittest import result

from fastapi import FastAPI
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
from langchain_chroma import Chroma


from app.services.gemini_service import GeminiService
from app.services.gemini_embeddings_service import GeminiEmbeddingsService
from app.services.rag_service import RAGService
from app.services.ingestion_service import IngestionService
from app.models.knowledge_request import (
    KnowledgeRequest,
    KnowledgeUpdateRequest,
    RagRequest,
)

app = FastAPI()
api_key = os.getenv("GEMINI_API_KEY")
gemini_service = GeminiService(api_key=api_key)
gemini_embeddings_service = GeminiEmbeddingsService(api_key=api_key)

vector_store = Chroma(
    collection_name="beauty_booking",
    embedding_function=gemini_embeddings_service.client,
    persist_directory=".data/chroma",
)
retriever = vector_store.as_retriever(search_kwargs={"k": 2})
rag_service = RAGService(retriever, client=gemini_service.client)
ingestion_service = IngestionService(vector_store=vector_store)


@app.get("/gemini/debug-retriever")
async def debug_retriever(question: str):
    docs = await retriever.ainvoke(question)

    return [
        {
            "content": doc.page_content,
            "metadata": doc.metadata,
        }
        for doc in docs
    ]


@app.post("/gemini/knowledge/ingest")
async def ingest_knowledge(request: KnowledgeRequest):
    chunks = await ingestion_service.ingest_document(
        document_id=request.document_id, content=request.content
    )
    return {
        "message": f"Knowledge from document {request.document_id} ingested successfully.",
        "chunks": len(chunks),
    }


@app.delete("/gemini/knowledge/{document_id}")
async def delete_knowledge(document_id: int):
    await ingestion_service.delete_by_document_id(document_id)
    return {"message": f"Knowledge from document {document_id} deleted successfully."}


@app.put("/gemini/knowledge/{document_id}")
async def update_knowledge(document_id: int, request: KnowledgeUpdateRequest):
    chunks = await ingestion_service.update_knowledge(
        document_id=document_id, content=request.content
    )
    return {
        "message": f"Knowledge from document {document_id} updated successfully.",
        "chunks": len(chunks),
    }


@app.post("/gemini/ingest")
async def ingest():
    chunks = await ingestion_service.ingest_txt(
        ".data/knowledge/cancellation-policy.txt"
    )
    return {"message": "Documents ingested successfully.", "chunks": len(chunks)}


@app.post("/gemini/rag")
async def rag(request: RagRequest):
    response = await rag_service.ask(request.question)
    return {"response": response}


@app.post("/gemini/embeddings")
async def generate_embeddings(text: str):
    vector = await gemini_embeddings_service.generate_embeddings(text)
    return {"dimensions": len(vector), "first_values": vector[:5]}


@app.post("/gemini/chat")
async def gemini_response(prompt: str):
    response = await gemini_service.generate_response(prompt)
    return {"response": response}


@app.get("/gemini/health")
async def health_check():
    return {"status": "ok"}
