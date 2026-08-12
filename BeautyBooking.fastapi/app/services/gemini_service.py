from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = ChatGoogleGenerativeAI(
            model="gemini-3.6-flash", google_api_key=self.api_key
        )

        self.prompt_template = ChatPromptTemplate.from_messages(
            [
                SystemMessage(content="Bạn là trợ lý cho hệ thống Beauty Booking."),
                (HumanMessage, "{question}"),
            ]
        )
        self.chain = self.prompt_template | self.client | StrOutputParser()

    async def generate_response(self, prompt: str):
        messages = self.prompt_template.invoke(
            {
                "question": prompt,
            }
        )
        response = await self.chain.ainvoke(messages)
        return {
            "content": response,
            "type": type(response).__name__,
        }
