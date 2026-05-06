__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler

from news_fetcher import update_news, get_status
from rag_engine import generate_answer
from topic_filter import is_geopolitics_query

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Start the scheduler FIRST
    scheduler.start()
    
    # 2. Schedule the regular 6-hour refresh
    scheduler.add_job(update_news, "interval", hours=6, id="news_refresh")
    
    # 3. The Magic Trick: Run the initial fetch in the background 
    # so Render doesn't kill the app for taking too long to boot!
    scheduler.add_job(update_news, "date", id="initial_boot_fetch")
    
    print("📅 Server is LIVE! Scheduler started — news is fetching in the background.")
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="GeoBot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ise Vercel live hone ke baad wapas restrict kar dena
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    on_topic: bool

@app.get("/")
def root():
    return {"status": "ok", "service": "GeoBot API"}

@app.get("/news/status")
def news_status():
    return get_status()

@app.post("/news/refresh")
def news_refresh():
    return update_news()

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(400, "Empty message")
    if not is_geopolitics_query(req.message):
        return ChatResponse(
            answer=("⚠️ I only answer questions about **geopolitics and "
                    "current affairs** — wars, elections, diplomacy, "
                    "global economy, etc. Please rephrase."),
            sources=[], on_topic=False,
        )
    result = generate_answer(req.message, req.history)
    return ChatResponse(
        answer=result["answer"], sources=result["sources"], on_topic=True,
    )