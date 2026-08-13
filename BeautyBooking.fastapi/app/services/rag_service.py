from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser


def format_docs(docs: list[Document]) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


class RAGService:
    def __init__(self, retriever, client):
        self.retriever = retriever
        self.client = client
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                Bạn là trợ lý cho hệ thống Beauty Booking.
                Hãy trả lời dựa trên thông tin được cung cấp bên dưới.

                Context:
                {context}
                """,
                ),
                ("human", "{question}"),
            ]
        )
        self.chain = (
            {
                "context": self.retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough(),
            }
            | self.prompt
            | self.client
            | StrOutputParser()
        )

    async def ask(self, question: str):
        return await self.chain.ainvoke(question)

    async def retrieve_docs(self, question: str) -> str:
        docs = await self.retriever.ainvoke(question)
        return format_docs(docs)
