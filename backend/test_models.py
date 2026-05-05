import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load your keys
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("=== AVAILABLE CHAT MODELS ===")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)

print("\n=== AVAILABLE EMBEDDING MODELS ===")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(m.name)