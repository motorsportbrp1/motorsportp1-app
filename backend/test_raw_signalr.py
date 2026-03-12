import asyncio
import json
import logging
import requests
import websockets

logging.basicConfig(level=logging.DEBUG)

def negotiate_signalr():
    url = "https://livetiming.formula1.com/signalr/negotiate"
    params = {
        "clientProtocol": "1.5",
        "connectionData": json.dumps([{"name": "Streaming"}])
    }
    # F1 might require some dummy headers so they don't block us as a bot
    headers = {
        "User-Agent": "BestHTTP", 
        "Accept-Encoding": "gzip,identity"
    }

    print(f"Negotiating with {url}...")
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    cookie = response.headers.get("Set-Cookie", "")
    
    return data["ConnectionToken"], cookie

async def connect_signalr():
    try:
        token, cookie = negotiate_signalr()
        print(f"Got Token: {token}")
        print(f"Got Cookie: {cookie}")

        ws_url = f"wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken={token}&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D"
        
        headers = {
            "User-Agent": "BestHTTP",
        }
        if cookie:
            headers["Cookie"] = cookie

        print(f"Connecting to WS: {ws_url}")
        
        async with websockets.connect(ws_url, additional_headers=headers) as ws:
            print("Connected!!")
            
            # Subscribe to topics just like f1-dash lib.rs `subscribe` function
            topics = ["Heartbeat", "CarData.z", "Position.z", "ExtrapolatedClock", "TopThree", "TimingStats", "TimingAppData", "WeatherData", "TrackStatus", "DriverList", "RaceControlMessages", "SessionInfo", "SessionData", "LapCount", "TimingData", "TeamRadio"]
            
            # The invoke message for a Hub
            # In SignalR 1.5 format
            subscribe_msg = json.dumps({
                "H": "Streaming", 
                "M": "Subscribe", 
                "A": [topics], 
                "I": 1
            })
            
            await ws.send(subscribe_msg)
            print(f"Sent Subscribe: {subscribe_msg}")

            while True:
                msg = await ws.recv()
                print(f"Received msg (length: {len(msg)})")
                
                # Try to parse and extract topics
                try:
                    data = json.loads(msg)
                    if "M" in data:
                        for m in data["M"]:
                            if "A" in m and len(m["A"]) > 0:
                                topic = m["A"][0]
                                print(f"-> Topic: {topic}")
                except Exception as e:
                    print(f"Parse error: {e}")

    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(connect_signalr())
