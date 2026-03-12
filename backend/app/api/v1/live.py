from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.live_f1_service import live_f1_manager
import logging

router = APIRouter()
logger = logging.getLogger("LiveRouter")

@router.websocket("/ws")
async def websocket_live_timing(websocket: WebSocket):
    await live_f1_manager.connect_client(websocket)
    try:
        while True:
            # We don't expect messages from client for now, 
            # but we need to keep the connection alive and check for disconnect
            data = await websocket.receive_text()
            # Handle client commands if needed
    except WebSocketDisconnect:
        live_f1_manager.disconnect_client(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        live_f1_manager.disconnect_client(websocket)
