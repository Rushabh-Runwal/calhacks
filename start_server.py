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
    fish_api_key = os.getenv("FISH_API_KEY")
    if not fish_api_key:
        print("Warning: FISH_API_KEY environment variable not set.")
    else:
        os.environ["FISH_API_KEY"] = fish_api_key

    # Start the Uvicorn server
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=True, 
        log_level="info"
    )

if __name__ == "__main__":
    main()
