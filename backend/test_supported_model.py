import httpx
import json
from app.core.config import settings

def test_model(model_name):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.AI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": "Classify this problem: 'Broken water pipeline in Ranchi'. Respond with JSON: {\"category\": \"Water and Sanitation\", \"confidence\": 0.95}"}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1,
        },
    }
    with httpx.Client(timeout=15.0) as client:
        resp = client.post(url, json=payload)
        print(f"Model: {model_name} -> Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            print(f"Response: {text}")
        else:
            print(f"Error: {resp.text}")

if __name__ == "__main__":
    for m in ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"]:
        test_model(m)
