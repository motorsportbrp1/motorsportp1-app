import uvicorn
import logging

if __name__ == "__main__":
    # Force full log output
    logging.basicConfig(level=logging.DEBUG)
    try:
        print("Starting Debug Server...")
        uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
    except Exception as e:
        print(f"Server FAILED to start: {e}")
        import traceback
        traceback.print_exc()
