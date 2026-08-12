from langchain_google_genai import GoogleGenerativeAIEmbeddings


class GeminiEmbeddingsService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-2", google_api_key=self.api_key
        )

    async def generate_embeddings(self, text: str) -> list[float]:
        embeddings = await self.client.aembed_query(text)
        return embeddings
