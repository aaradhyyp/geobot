GEO_KEYWORDS = {
    "war", "conflict", "election", "president", "prime minister",
    "diplomacy", "treaty", "sanctions", "united nations", "un",
    "nato", "eu", "european union", "summit", "geopolitics",
    "border", "military", "defense", "defence", "embassy",
    "foreign policy", "trade war", "tariff", "g20", "g7", "brics",
    "asean", "russia", "ukraine", "china", "taiwan", "israel",
    "palestine", "gaza", "iran", "north korea", "india", "pakistan",
    "nuclear", "ceasefire", "refugee", "current affairs",
    "international", "global", "minister", "parliament",
    "government", "policy", "protest", "coup", "terror", "alliance",
    "geneva", "security council", "veto", "currency", "economy",
    "inflation", "oil", "gas", "energy", "climate summit", "cop",
    "wto", "imf", "world bank", "modi", "putin", "biden", "trump",
    "xi jinping", "zelensky", "netanyahu", "hamas", "hezbollah",
    "saudi", "uae", "africa", "asia", "europe", "middle east",
}


def is_geopolitics_query(text: str) -> bool:
    if not text:
        return False
    text_l = text.lower()
    return any(kw in text_l for kw in GEO_KEYWORDS)
