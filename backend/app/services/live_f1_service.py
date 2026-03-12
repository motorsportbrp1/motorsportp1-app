import asyncio
import json
import logging
import os
from typing import List, Set
from fastapi import WebSocket
import fastf1.livetiming.client
import fastf1.internals.f1auth
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("LiveF1Service")

class LiveF1Service:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LiveF1Service, cls).__new__(cls)
            cls._instance._init_manager()
        return cls._instance

    def _init_manager(self):
        self.active_connections: Set[WebSocket] = set()
        self.client = None
        self.loop = asyncio.get_event_loop()
        self.is_running = False
        
        # Use FastF1 standard authentication
        logger.info("Using standard built-in FastF1 authentication flow.")

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New client connected. Total: {len(self.active_connections)}")
        
        if not self.is_running:
            await self.start_f1_connection()

    def disconnect_client(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")
        
        if len(self.active_connections) == 0:
            # We could stop the F1 connection here to save resources, 
            # but maybe we keep it cached for a bit?
            # For now, let's keep it running during the session.
            pass

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        disconnected = set()
        msg_str = json.dumps(message)
        
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception:
                disconnected.add(connection)
                
        for connection in disconnected:
            if connection in self.active_connections:
                self.active_connections.remove(connection)

    def _decode_data(self, data_str: str):
        try:
            import base64
            import zlib
            decoded = base64.b64decode(data_str)
            return json.loads(zlib.decompress(decoded, -zlib.MAX_WBITS).decode('utf-8-sig'))
        except Exception as e:
            logger.error(f"Decoding failed: {e}")
            return data_str

    async def start_f1_connection(self):
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting F1 SignalR connection...")
        
        # Create a custom client that calls our broadcast
        class RelayClient(fastf1.livetiming.client.SignalRClient):
            def __init__(self, service_instance, *args, **kwargs):
                self.service_instance = service_instance
                super().__init__(*args, **kwargs)
                
            def _on_message(self, msg):
                if isinstance(msg, list):
                    processed_msg = []
                    for inner in msg:
                        # SignalR Core message: [Method, Payload, Timestamp]
                        if isinstance(inner, list) and len(inner) >= 2:
                            method = inner[0]
                            payload = inner[1]
                            
                            # Handle compressed payloads
                            if isinstance(method, str) and method.endswith(".z") and isinstance(payload, str):
                                payload = self.service_instance._decode_data(payload)
                            
                            processed_msg.append({
                                "method": method,
                                "data": payload,
                                "timestamp": inner[2] if len(inner) > 2 else None
                            })
                        else:
                            processed_msg.append(inner)

                    payload = {"type": "feed", "data": processed_msg}
                    asyncio.run_coroutine_threadsafe(
                        self.service_instance.broadcast(payload), 
                        self.service_instance.loop
                    )

        # We run it in a separate thread because fastf1 SignalRClient is synchronous/blocking start()
        self.client = RelayClient(self, "live_stream.txt")
        
        def run_client():
            try:
                self.client.start()
            except Exception as e:
                logger.error(f"F1 Client Error: {e}")
                self.is_running = False

        import threading
        self.thread = threading.Thread(target=run_client, daemon=True)
        self.thread.start()

# Global instance
live_f1_manager = LiveF1Service()
