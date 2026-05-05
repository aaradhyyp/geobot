from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
from config import GEMINI_API_KEY, GEN_MODEL, EMBED_MODEL
from news_fetcher import get_collection

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEN_MODEL)

SYSTEM_PROMPT = """You are GeoBot, an AI specialized ONLY in geopolitics
and current affairs. Rules:

1. Answer ONLY questions about geopolitics, international relations,
   wars, elections, diplomacy, global economy, current affairs.
2. Off-topic questions → politely refuse and remind user of scope.
3. Base answers on the LATEST NEWS CONTEXT below. Cite sources inline
   like [BBC World] or [Reuters].
4. If context lacks coverage, state this clearly and provide background
   knowledge labeled as "General context:".
5. Stay neutral, factual, no personal political opinions.
6. Concise answers (under 250 words) unless detail is requested.
7. Format with short paragraphs, no excessive bullet points.
"""


def query_embedding(text: str) -> list:
    result = genai.embed_content(
        model=EMBED_MODEL, content=text,
        task_type="retrieval_query"
    )
    return result["embedding"]


def retrieve_context(query: str, k: int = 8) -> tuple[str, list]:
    collection = get_collection()
    if collection.count() == 0:
        return "No news available yet.", []
    q_emb = query_embedding(query)
    results = collection.query(query_embeddings=[q_emb], n_results=k)
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    lines, sources = [], []
    for i, (doc, meta) in enumerate(zip(docs, metas), 1):
        lines.append(
            f"[{i}] {meta.get('title', '')}\n"
            f"    Source: {meta.get('source', '')} | "
            f"Published: {meta.get('published', '')}\n"
            f"    {doc}\n"
        )
        sources.append({
            "title": meta.get("title", ""),
            "source": meta.get("source", ""),
            "url": meta.get("url", ""),
            "published": meta.get("published", ""),
        })
    return "\n".join(lines), sources


def generate_answer(query: str, history: list = None) -> dict:
    context, sources = retrieve_context(query)
    history_text = ""
    if history:
        for h in history[-4:]:
            history_text += f"User: {h['user']}\nBot: {h['bot']}\n"
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"=== LATEST NEWS CONTEXT ===\n{context}\n\n"
        f"=== CONVERSATION HISTORY ===\n{history_text}\n\n"
        f"=== USER QUESTION ===\n{query}\n\nAnswer:"
    )
    try:
        response = model.generate_content(prompt)
        return {"answer": response.text.strip(), "sources": sources}
    except Exception as e:
        return {"answer": f"❌ Model error: {e}", "sources": []}
