import asyncio
import websockets
import json

async def test_ws_client():
    uri = "ws://localhost:8001/api/v1/live/ws"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for data...")
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received message type: {data.get('type')}")
                if data.get('type') == 'feed':
                    print(f"Feed data entries: {len(data.get('data', []))}")
                    for item in data.get('data', []):
                        print(f"  Method: {item.get('method')} | Has Data: {bool(item.get('data'))}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws_client())
