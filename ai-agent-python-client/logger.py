import os
import time

# Create logs directory in user's home if it doesn't exist
LOGS_DIR = os.path.join(os.path.expanduser('~'), '.spacetime_mud/logs')
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def log(logName, message, logToConsole=True):
    """Writes a log message to a file."""
    # Get current timestamp
    current_time = time.strftime('%Y-%m-%d %H:%M:%S')
    
    if logToConsole:
        print(f"{current_time} - {message}")

    # Create or append to the log file
    with open(os.path.join(LOGS_DIR, f"{logName}.log"), 'a') as log_file:
        log_file.write(f"{current_time} - {message}\n")
