import sys
import logging
from signalrcore.hub_connection_builder import HubConnectionBuilder

logging.basicConfig(level=logging.DEBUG)

def on_receive(*args):
    print("Received message:")
    for argument in args:
        print(argument)

def test_signalrcore():
    # Attempting a direct signalrcore connection like f1-dash/api does
    # For F1, we connect to /signalr, but HubConnectionBuilder usually expects /hub
    # Let's specify the exact URL.
    hub_url = "https://livetiming.formula1.com/signalr"
    
    hub_connection = HubConnectionBuilder()\
        .with_url(hub_url, options={
            "verify_ssl": False,
            "headers": {
                "User-Agent": "BestHTTP"
            }
        })\
        .build()

    hub_connection.on_open(lambda: print("Connection opened successfully"))
    hub_connection.on_close(lambda: print("Connection closed"))
    hub_connection.on("Streaming", on_receive)

    # Let's start
    print("Starting hub connection...")
    try:
        hub_connection.start()
        # Keep alive
        while True:
            pass
    except KeyboardInterrupt:
        pass
    finally:
        hub_connection.stop()

if __name__ == "__main__":
    test_signalrcore()
