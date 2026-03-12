import asyncio
import logging
from signalr_aio import Connection as SignalRClient

# Setup logging
logging.basicConfig(level=logging.DEBUG)

async def run_client():
    # SignalR 1.5 endpoint
    url = "https://livetiming.formula1.com/signalr"
    
    # Create the client
    # The hub name for F1 SignalR 1.5 is usually blank or "Streaming"
    # f1-dash uses "Streaming"
    client = SignalRClient(url, hub="Streaming")
    
    # Custom headers
    client.headers.update({
        "User-Agent": "BestHTTP",
        "Accept-Encoding": "gzip,identity"
    })

    # Define callbacks
    @client.on('feed')
    def on_feed(data):
        print(f"!!! FEED DATA RECEIVED !!!")
        # print(data)

    print("Connecting to F1 SignalR 1.5...")
    try:
        await client.start()
        print("Connected! Waiting for data...")
        
        # In SignalR 1.5, we might need to call Subscribe
        # But signalr-client-aio might handle hub connection differently
        # Let's try to send a message to Subscribe
        topics = ["Heartbeat","AudioStreams","DriverList",
                  "ExtrapolatedClock","RaceControlMessages",
                  "SessionInfo","SessionStatus","TeamRadio",
                  "TimingAppData","TimingStats","TrackStatus",
                  "WeatherData","Position.z","CarData.z",
                  "ContentStreams","SessionData","TimingData",
                  "TopThree", "RcmSeries", "LapCount"]
        
        # Invoke Subscribe on the 'Streaming' hub
        # client.invoke(hub, method, *args)
        # await client.invoke("Streaming", "Subscribe", topics)
        
        while True:
            await asyncio.sleep(1)
            
    except Exception as e:
        print(f"Client failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_client())
