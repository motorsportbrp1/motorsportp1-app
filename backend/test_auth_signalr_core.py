import logging
import requests
import json
import time
from signalrcore.hub_connection_builder import HubConnectionBuilder

# Setup logging to see full handshake
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('SignalRCoreTest')

def test_live_auth_signalr():
    # The subscription token extracted from the live session
    # This token grants access to the restricted /signalrcore endpoint
    token = "eyJraWQiOiIxIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJFeHRlcm5hbEF1dGhvcml6YXRpb25zQ29udGV4dERhdGEiOiJCUkEiLCJTdWJzY3JpcHRpb25TdGF0dXMiOiJhY3RpdmUiLCJTdWJzY3JpYmVySWQiOiIyMzE2MjE5ODIiLCJGaXJzdE5hbWUiOiJSYXBoYWVsIiwiZW50cyI6W3siY291bnRyeSI6IkJSQSIsImVudCI6IlJFRyJ9LHsiY291bnRyeSI6IkJSQSIsImVudCI6IlBSRU1JVU0ifV0sIkxhc3ROYW1lIjoiQ2FydmFsaG8iLCJleHAiOjE3NzMxMTU0OTgsIlNlc3Npb25JZCI6ImV5SmhiR2NpT2lKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXhMekEwTDNodGJHUnphV2N0Ylc5eVpTTm9iV0ZqTFhOb1lUSTFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUppZFNJNklqRXdNREV4SWl3aWMya2lPaUkyTUdFNVlXUTROQzFsT1ROa0xUUTRNR1l0T0RCa05pMWhaak0zTkRrMFpqSmxNaklpTENKb2RIUndPaTh2YzJOb1pXMWhjeTU0Yld4emIyRndMbTl5Wnk5M2N5OHlNREExTHpBMUwybGtaVzUwYVhSNUwyTnNZV2x0Y3k5dVlXMWxhV1JsYm5ScFptbGxjaUk2SWpJek1UWXlNVGs0TWlJc0ltbGtJam9pWldRMlltSmlOall0TlRjNE9DMDBZMkkyTFRreE9EWXRObUl4TkdFd01tTXlNakl6SWl3aWRDSTZJakVpTENKc0lqb2laVzR0UjBJaUxDSmtZeUk2SWpNMk5EUWlMQ0poWldRaU9pSXlNREkyTFRBekxUSXdWREEwT2pBME9qVTRMak16TUZvaUxDSmtkQ0k2SWpFaUxDSmxaQ0k2SWpJ0M1qWXRNRFF0TURWVU1EUTZNRFE2TlRndU16TXdXaUlzSW1ObFpDSTZJakVpTENKc0lqb2laVzR0UjBJaUxDSmtZeUk2SWpNMk5EUWlMQ0poWldRaU9pSXlNREkyTFRBekxUSXdWREEwT2pBME9qVTRMak16TUZvaUxDSmtkQ0k2SWpFaUxDSmxaQ0k2SWpJ0M1qWXRNRFF0TURWVU1EUTZNRFE2TlRndU16TXdXaUlzSW1ObFpDSTZJakVpTENKc0lqb2laVzR0UjBJaUxDSmtZeUk2SWpNMk5EUWlMQ0poWldRaU9pSXlNREkyTFRBekxUSXdWREEwT2pBME9qVTRMak16TUZvaUxDSmtkQ0k2SWpFaUxDSmxaQ0k2SWpJ0M1qWXRNRFF0TURWVU1EUTZNRFE2TlRndU16TXdXaUlzSW1ObFpDSTZJakI0IiwiaWF0IjoxNzcyNzY5ODk4LCJTdWJzY3JpYmVkUHJvZHVjdCI6IkYxIFRWIFByZW1pdW0gQW5udWFsIiwianRpIjoiN2QyNmVhYTAtMWE5YS00MWM5LWI5NTYtN2MyZmUwODcwMmMzIiwiaGFzaGVkU3Vic2NyaWJlcklkIjoia1wvUmlUaFhCbVVpb0xNS1BoUXNFbFFKSllPdTIzZlhiQ2w0WWJQVFJ0ODQ9In0.R4TZBS7tWe6UpAvHh_wSSOA8lwLh7AOWx3lxjobUw_CS6-unhBzPaJaYsk67FeppziZQ4cSwPT-Z2ultI9dpmPtjNW1V9esm0EhQ3tQJiuG_pt6VIfMfuGjMgK3MmSPtPoTrTxByxm0DS6qbWxL_LYD7EDdn4ka_ZNeuMFUq3E4wOZps_jGg3yqFqy-SLm7-Z3M98Vjm3eb2aUr-zz1bmFiXVWWySBHL5TK5C_Rx_pHsYeP6ZIO_qLdx-D2HvEXppqEZaDd71yepCjqxPku9IrUku-7KdGPCxd5Gs0VHqabL_L9nCZLyvB5aBNM4RZzwm_2nLjw7FrQY1M_n_3V6bw=="

    connection_url = 'https://livetiming.formula1.com/signalrcore'
    
    headers = {
        "User-Agent": "BestHTTP",
        "Accept-Encoding": "gzip,identity"
    }

    # SignalR Core topics
    topics = ["Heartbeat","AudioStreams","DriverList",
              "ExtrapolatedClock","RaceControlMessages",
              "SessionInfo","SessionStatus","TeamRadio",
              "TimingAppData","TimingStats","TrackStatus",
              "WeatherData","Position.z","CarData.z",
              "ContentStreams","SessionData","TimingData",
              "TopThree", "RcmSeries", "LapCount"]

    def on_feed(msg):
        print(f"~~~ LIVE FEED RECEIVED ~~~")
        for arg in msg:
            # The data is often a large list/dict
            print(f"Data: {str(arg)[:100]}...")

    # Configure connection with the token
    hub_connection = HubConnectionBuilder() \
        .with_url(connection_url, options={
            "verify_ssl": True,
            "access_token_factory": lambda: token,
            "headers": headers
        }) \
        .configure_logging(logging.DEBUG) \
        .build()

    hub_connection.on_open(lambda: print("CONNECTED TO F1 SIGNALR CORE!"))
    hub_connection.on_close(lambda: print("CONNECTION CLOSED"))
    hub_connection.on('feed', on_feed)

    print("Initiating handshake...")
    try:
        hub_connection.start()
        
        # Wait for open
        time.sleep(5)
        
        print("Subscribing to topics...")
        hub_connection.send("Subscribe", [topics])
        
        print("Waiting for live data...")
        # Keep running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("Exiting...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        hub_connection.stop()

if __name__ == "__main__":
    test_live_auth_signalr()
