from dotenv import load_dotenv
load_dotenv()
import hashlib
from datetime import datetime
import requests
import feedparser
import google.generativeai as genai
import chromadb
from chromadb.config import Settings
from config import (NEWSAPI_KEY, RSS_FEEDS, NEWSAPI_QUERIES,
                    GEMINI_API_KEY, CHROMA_DIR, COLLECTION_NAME, EMBED_MODEL)

genai.configure(api_key=GEMINI_API_KEY)

# Persistent ChromaDB client
chroma_client = chromadb.PersistentClient(
    path=CHROMA_DIR, settings=Settings(anonymized_telemetry=False)
)


def get_collection():
    return chroma_client.get_or_create_collection(name=COLLECTION_NAME)


def _hash_id(url: str, title: str) -> str:
    return hashlib.md5(f"{url}{title}".encode()).hexdigest()


def fetch_newsapi():
    articles = []
    if not NEWSAPI_KEY:
        return articles
    for q in NEWSAPI_QUERIES:
        try:
            url = ("https://newsapi.org/v2/everything"
                   f"?q={q}&language=en&sortBy=publishedAt"
                   f"&pageSize=15&apiKey={NEWSAPI_KEY}")
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                for a in r.json().get("articles", []):
                    articles.append({
                        "title": a.get("title") or "",
                        "description": a.get("description") or "",
                        "content": a.get("content") or "",
                        "source": (a.get("source") or {}).get("name", "NewsAPI"),
                        "url": a.get("url") or "",
                        "published": a.get("publishedAt") or "",
                    })
        except Exception as e:
            print(f"NewsAPI error ({q}): {e}")
    return articles


def fetch_rss():
    articles = []
    for source, url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:15]:
                articles.append({
                    "title": entry.get("title", ""),
                    "description": entry.get("summary", ""),
                    "content": entry.get("summary", ""),
                    "source": source,
                    "url": entry.get("link", ""),
                    "published": entry.get("published", ""),
                })
        except Exception as e:
            print(f"RSS error ({source}): {e}")
    return articles


def embed_text(text: str) -> list:
    """Get embedding vector from Gemini."""
    try:
        result = genai.embed_content(
            model=EMBED_MODEL, content=text,
            task_type="retrieval_document"
        )
        return result["embedding"]
    except Exception as e:
        print(f"Embedding error: {e}")
        return None


def update_news():
    """Fetch news, embed, and store in ChromaDB."""
    print(f"🔄 Updating news at {datetime.now().isoformat()}")
    all_articles = fetch_newsapi() + fetch_rss()
    # Deduplicate
    seen, unique = set(), []
    for a in all_articles:
        key = a["title"].strip().lower()
        if key and key not in seen:
            seen.add(key)
            unique.append(a)

    collection = get_collection()
    added = 0
    for a in unique:
        doc_id = _hash_id(a["url"], a["title"])
        # Skip if already in DB
        existing = collection.get(ids=[doc_id])
        if existing["ids"]:
            continue
        text = f"{a['title']}. {a['description']}"
        embedding = embed_text(text)
        if embedding is None:
            continue
        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[{
                "title": a["title"],
                "source": a["source"],
                "url": a["url"],
                "published": a["published"],
            }],
        )
        added += 1
    print(f"✅ Added {added} new articles. Total: {collection.count()}")
    return {"added": added, "total": collection.count(),
            "updated_at": datetime.now().isoformat()}


def get_status():
    collection = get_collection()
    return {"total_articles": collection.count()}


if __name__ == "__main__":
    update_news()
