import logging
import fastf1.livetiming.client
import time

# Configure logging to see what's happening
logging.basicConfig(level=logging.DEBUG)

class MyClient(fastf1.livetiming.client.SignalRClient):
    def _on_message(self, msg):
        # Instead of writing to file, just print
        print(">>> DATA RECEIVED <<<")
        # To avoid flooding the console, we just print the indicator
        # super()._on_message(msg)

def run_test():
    # Use no_auth=True as per Option 2 goal (free access)
    client = MyClient("test_data.txt", no_auth=True)
    print("Starting FastF1 Client...")
    try:
        client.start()
    except KeyboardInterrupt:
        print("Stopping...")
        client._exit()
    except Exception as e:
        print(f"Client failed: {e}")

if __name__ == "__main__":
    run_test()
