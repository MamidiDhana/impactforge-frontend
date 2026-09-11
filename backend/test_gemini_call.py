import httpx
from app.core.config import settings

def test_gemini():
    print(f"Provider: {settings.AI_PROVIDER}")
    print(f"Model: {settings.AI_MODEL}")
    has_key = bool(settings.AI_API_KEY)
    print(f"API key is {'present' if has_key else 'missing'}")
    if has_key:
        print(f"API key length: {len(settings.AI_API_KEY)}")
        print(f"API key starts with 'AIza': {settings.AI_API_KEY.startswith('AIza')}")
        print(f"API key prefix (first 5 chars): {settings.AI_API_KEY[:5]}...")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": "Say hello in JSON format: {\"greeting\": \"hello\"}"}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1,
        },
    }
    
    with httpx.Client(timeout=10.0) as client:
        try:
            resp = client.post(url, json=payload)
            print(f"Response status: {resp.status_code}")
            print(f"Response body: {resp.text}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    test_gemini()
