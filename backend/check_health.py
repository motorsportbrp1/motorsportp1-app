import requests
import sys

def check_backend():
    url = "http://localhost:8000/api/v1/seasons"
    print(f"Checking backend at {url}...")
    try:
        r = requests.get(url, timeout=5)
        print(f"Status: {r.status_code}")
        print(f"Content: {r.text[:200]}...")
    except Exception as e:
        print(f"Backend unreachable: {e}")

if __name__ == "__main__":
    check_backend()
