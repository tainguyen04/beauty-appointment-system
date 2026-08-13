from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
import hashlib


class IngestionService:
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=80,
            chunk_overlap=20,
        )

    async def ingest_txt(self, file_path: str):
        loader = TextLoader(file_path=file_path, encoding="utf-8")
        documents = loader.load()
        result = []
        for doc in documents:
            chunks = await self.ingest_document(doc)
            result.extend(chunks)
        return result

    async def ingest_document(self, document_id: int, content: str):
        document = Document(page_content=content, metadata={"document_id": document_id})
        chunks = self.text_splitter.split_documents([document])
        ids = []
        for index, chunk in enumerate(chunks):
            chunk_id = f"{document_id}:{index}"
            chunk.metadata["chunk_index"] = index
            chunk.metadata["chunk_id"] = chunk_id
            ids.append(chunk_id)

        await self.vector_store.aadd_documents(chunks, ids=ids)
        return chunks

    def split(self, document: Document) -> list[Document]:
        return self.text_splitter.split_documents([document])

    async def delete_by_document_id(self, document_id: int):
        await self.vector_store.adelete(where={"metadata.document_id": document_id})

    async def update_knowledge(self, document_id: int, content: str):
        await self.delete_by_document_id(document_id)
        return await self.ingest_document(document_id, content)
