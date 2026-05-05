import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

CHROMA_DIR = "./chroma_db"
COLLECTION_NAME = "geopolitics_news"

GEN_MODEL = "models/gemini-2.5-flash"
EMBED_MODEL = "models/gemini-embedding-001"

RSS_FEEDS = {
    "BBC World": "http://feeds.bbci.co.uk/news/world/rss.xml",
    "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
    "Reuters World": "https://feeds.reuters.com/Reuters/worldNews",
    "The Hindu World": "https://www.thehindu.com/news/international/feeder/default.rss",
}

NEWSAPI_QUERIES = [
    "geopolitics", "international relations OR diplomacy",
    "war OR conflict OR ceasefire", "election OR summit",
    "sanctions OR treaty",
]
