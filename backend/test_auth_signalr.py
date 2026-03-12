import logging
import fastf1.internals.f1auth as f1auth
import fastf1.livetiming.client as client
import time

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('AuthTest')

def test_auth_and_connect():
    email = "raphaelrcarvalhocrypto@gmail.com"
    password = "Rc2027@@@"

    print(f"Attempting to get auth token for {email}...")
    try:
        # FastF1 internally uses a cache for the token, 
        # but let's see if we can trigger the login flow.
        # Note: get_auth_token usually doesn't take params, 
        # it might need environment variables or a manual login prompt if not cached.
        # Let's check how fastf1 handles it.
        
        # Actually, fastf1's get_auth_token usually requires a manual login in the browser 
        # OR it uses cached cookies.
        # Let's see if we can force it or if there's a better way.
        
        token = f1auth.get_auth_token()
        print(f"Token obtained: {token[:10]}...")
    except Exception as e:
        print(f"Auth failed: {e}")
        print("Falling back to manual SignalR client with creds if possible...")

    # Let's try to initialize the SignalRClient. 
    # The default client doesn't take login info directly, 
    # it relies on fastf1.internals.f1auth.get_auth_token()
    
    class LiveClient(client.SignalRClient):
        def _on_message(self, msg):
            print(">>> DATA RECEIVED <<<")

    # If auth fails, we might need to find where fastf1 stores creds.
    # It usually uses a legacy method or environment variables.
    
    # Let's try to run it. 
    # If it's the first time, it might try to open a browser for login.
    # Since I'm an agent, I want to avoid interactive browser prompts if possible.
    
    c = LiveClient("live_data.txt")
    print("Starting client...")
    try:
        c.start()
    except Exception as e:
        print(f"Execution failed: {e}")

if __name__ == "__main__":
    test_auth_and_connect()
