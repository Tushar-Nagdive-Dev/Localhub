# utils/data_handler.py
from utils.config import DB_FILENAME
import json
import os
import sys


DATA_FILE = 'links.json'

def load_links():
    """Reads the list of link objects from the file system."""
    data_file_path = get_db_path() # <<< Use the writable path
    if os.path.exists(data_file_path) and os.path.getsize(data_file_path) > 0:
        try:
            with open(data_file_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("Warning: links.json is invalid. Starting with empty list.")
            return []
    return []

def save_links(links):
    """Writes the list of link objects back to the file system."""
    data_file_path = get_db_path() # <<< Use the writable path
    with open(data_file_path, 'w') as f:
        try:
            # Sort links by name before saving for consistency
            links.sort(key=lambda x: x.get('name', '').lower())
        except AttributeError:
            pass 
            
        json.dump(links, f, indent=4)
        print(f"[{len(links)} links saved to {data_file_path}]")

# --- NEW: Function to determine the writable database path ---
def get_db_path():
    """
    Returns the full writable path for links.json, using the user's home/config directory 
    when packaged, or the current directory when running in development.
    """
    # 1. Check if the app is bundled by PyInstaller
    if getattr(sys, 'frozen', False):
        # On macOS, use the Application Support directory (or simply the user's home directory)
        # Using a hidden folder in the home directory is simple and effective for a local dev tool.
        app_data_dir = os.path.expanduser('~/.localhub_data')
    else:
        # Running in development, use the current working directory
        app_data_dir = '.'
    
    # Ensure the directory exists
    os.makedirs(app_data_dir, exist_ok=True)
    
    return os.path.join(app_data_dir, DB_FILENAME)