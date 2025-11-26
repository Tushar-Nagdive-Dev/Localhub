# utils/logging_setup.py - Logging Configuration for Localhub
import logging
import os
from logging.handlers import RotatingFileHandler

#logs to the user's home directory (a safe, writable locaation  )
LOG_FILENAME = os.path.expanduser("~/localhub.log")

def setup_app_logging(app):
    """
    Configures and attaches a rotating file handler to the Flask application logger.
    """
    try:
        # 1. Create the File Handler
        handler = RotatingFileHandler(LOG_FILENAME, maxBytes=10000, backupCount=1)
        
        # 2. Set Log Level and Format
        handler.setLevel(logging.WARNING) 
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        # 3. Attach the Handler to the Flask App
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.WARNING)
        
        # 4. Success message (only visible if running in console)
        print(f"Logging configured. Errors will be written to: {LOG_FILENAME}")

    except Exception as e:
        # Fallback if logging setup itself fails (e.g., permission error)
        print(f"ERROR: Failed to set up file logging: {e}")

def open_browser_safely(app, port=1001):
    """
    Opens the default web browser after a short delay and logs any failure.
    """
    import webbrowser
    import threading
    
    def browser_opener():
        try:
            webbrowser.open_new("http://127.0.0.1:{port}")
        except Exception as e:
            # Log failure to open browser
            app.logger.error(f"Failed to open browser: {e}")

    # Start browser after a delay to ensure Flask is up
    threading.Timer(1.5, browser_opener).start()