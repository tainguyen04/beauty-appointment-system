from pydantic import BaseModel


class KnowledgeRequest(BaseModel):
    document_id: int
    content: str


class KnowledgeUpdateRequest(BaseModel):
    content: str


class RagRequest(BaseModel):
    question: str
