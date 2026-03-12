import asyncio
import json
import logging
from fastf1.livetiming.client import SignalRClient

# Setup basic logging to see connection status
logging.basicConfig(level=logging.INFO)

class LiveF1Client(SignalRClient):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def _on_message(self, msg):
        """Override the default message handler to parse data in memory."""
        # The parent saves it to a file. We want to process it here.
        # fastf1's client receives messages from SignalR
        try:
            # Let the parent do its file saving if we provided a filename
            await super()._on_message(msg)
            
            # Now let's print a summary of what we received
            if "M" in msg:
                for message in msg["M"]:
                    if "A" in message and len(message["A"]) > 0:
                        topic = message["A"][0]
                        data = message["A"][1]
                        print(f"[{topic}] Received Data!")
                        # Uncomment to see raw data (it can be huge and zlib compressed)
                        # print(data)
        except Exception as e:
            print(f"Error parsing message: {e}")

async def run_live_timing():
    print("Initiating F1 SignalR Connection...")
    # FastF1 expects a filename to save raw data. We can pass a dummy one for now.
    client = LiveF1Client("dummy_live_data.txt", debug=False)
    
    # FastF1 handles the negotiate and connect loop inside `start()`
    # But it is a blocking call. Because FastF1's architecture might be using asyncio under the hood,
    # we need to await its internal loop. Currently, `start()` is synchronous in FastF1, but 
    # the underlying signalr-client-aio it uses is async. Let's look at `start()`
    # According to fastf1 docs, you just call `client.start()`
    
    # Since start() spins up an asyncio event loop internally, we need to run it in a thread if we are already in async
    # OR we use the fastf1 `start()` method directly outside `asyncio.run()`.
    pass

if __name__ == "__main__":
    import threading
    
    def start_client():
        # FastF1 client.start() connects and runs the loop until disconnected
        # Set no_auth=True to attempt hitting the publicly available parts without F1TV login
        client = LiveF1Client("dummy_live_data.txt", no_auth=True)
        client.start()

    print("Starting client thread...")
    t = threading.Thread(target=start_client)
    t.start()
    t.join()
