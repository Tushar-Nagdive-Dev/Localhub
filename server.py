# server.py (CORRECTED VERSION)
from flask import Flask, render_template
from utils.data_handler import save_links, DATA_FILE
from routes.api_routes import api_bp
from routes.shortener_routes import shortener_bp
# <<< CORRECTED IMPORTS >>>
from utils.logging_setup import setup_app_logging, open_browser_safely 
import os

# --- Configuration ---
APP_PORT = 1001 
app = Flask(__name__)

# --- Modular Setup ---
setup_app_logging(app)
app.register_blueprint(api_bp)
app.register_blueprint(shortener_bp)

# --- Routes and Error Handlers (Remain Correct) ---

@app.route('/')
def index():
    """Renders the main application page."""
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(e):
    """Custom 404 page for when a short slug is not found."""
    return render_template('404.html'), 404

# --- Execution ---

if __name__ == '__main__':
    try:
        # Ensure the links.json file exists at startup
            
        print("\n--- LocalHub Modular Server Starting on Port {} ---".format(APP_PORT))
        
        # Open browser in a separate thread (utility handles threading and logging)
        open_browser_safely(app, port=APP_PORT) # Passing port for the utility to use
        
        # Run the app (debug=False is essential for packaging)
        app.run(port=APP_PORT, debug=False, host='0.0.0.0')

    except Exception as e:
        # Log critical errors during final startup/bind phase
        app.logger.critical(f"CRITICAL APP FAILURE: {e}", exc_info=True)