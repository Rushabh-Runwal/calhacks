import os
import uvicorn
from dotenv import load_dotenv

def main():
    # Load environment variables from a .env file if it exists
    load_dotenv()

    # Get the host and port from environment variables, with default values
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    # Set Fish Audio API Key
    fish_api_key = "b34cff9e6fed4b8cb414b3ed4356014d"

    # Start the Uvicorn server
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:socket_app", 
        host=host, 
        port=port, 
        reload=True, 
        log_level="info"
    )

if __name__ == "__main__":
    main()
