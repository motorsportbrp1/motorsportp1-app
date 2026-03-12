import logging
import requests
import json
import time
from signalrcore.hub_connection_builder import HubConnectionBuilder

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('LiveTest')

def test_live_f1():
    negotiate_url = 'https://livetiming.formula1.com/signalrcore/negotiate'
    connection_url = 'wss://livetiming.formula1.com/signalrcore'
    
    headers = {
        "User-Agent": "BestHTTP",
        "Accept-Encoding": "gzip,identity"
    }

    print("Pre-negotiating for AWSALBCORS cookie...")
    try:
        r = requests.options(negotiate_url, headers=headers)
        r.raise_for_status()
        cookie = f"AWSALBCORS={r.cookies.get('AWSALBCORS', '')}"
        print(f"Got Cookie: {cookie}")
        headers["Cookie"] = cookie
    except Exception as e:
        print(f"Negotiation Cookie failed: {e}")
        return

    # SignalR Core topics
    topics = ["Heartbeat","AudioStreams","DriverList",
              "ExtrapolatedClock","RaceControlMessages",
              "SessionInfo","SessionStatus","TeamRadio",
              "TimingAppData","TimingStats","TrackStatus",
              "WeatherData","Position.z","CarData.z",
              "ContentStreams","SessionData","TimingData",
              "TopThree", "RcmSeries", "LapCount"]

    def on_message(msg):
        print(f"~~~ MESSAGE RECEIVED ~~~")
        # print(msg)

    # Use signalrcore HubConnectionBuilder
    # We set access_token_factory to None explicitly
    hub_connection = HubConnectionBuilder() \
        .with_url(connection_url, options={
            "verify_ssl": True,
            "access_token_factory": None,
            "headers": headers
        }) \
        .configure_logging(logging.DEBUG) \
        .build()

    hub_connection.on_open(lambda: print("Connection Opened!"))
    hub_connection.on_close(lambda: print("Connection Closed!"))
    
    # F1 uses 'feed' as the message type for their hub
    hub_connection.on('feed', on_message)

    print("Starting connection...")
    try:
        hub_connection.start()
        
        # Give it a few seconds to connect
        time.sleep(5)
        
        print("Sending Subscribe message...")
        hub_connection.send("Subscribe", [topics])
        
        print("Entering loop, waiting for data (Ctrl+C to stop)...")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("Stopping...")
    except Exception as e:
        print(f"Error during execution: {e}")
    finally:
        hub_connection.stop()

if __name__ == "__main__":
    test_live_f1()
