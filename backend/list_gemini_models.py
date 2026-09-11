import httpx
from app.core.config import settings

def list_models():
    for version in ["v1beta", "v1"]:
        url = f"https://generativelanguage.googleapis.com/{version}/models?key={settings.AI_API_KEY}"
        with httpx.Client(timeout=10.0) as client:
            try:
                resp = client.get(url)
                print(f"\n--- Version {version} ---")
                print(f"Status: {resp.status_code}")
                if resp.status_code == 200:
                    models = resp.json().get("models", [])
                    print(f"Available models count: {len(models)}")
                    for m in models:
                        print(f"  - {m.get('name')} (supportedMethods: {m.get('supportedGenerationMethods')})")
                else:
                    print(f"Error: {resp.text}")
            except Exception as e:
                print(f"Exception: {e}")

if __name__ == "__main__":
    list_models()
