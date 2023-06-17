import os
import configparser
import sys

# Get the path to the user's home directory
home_dir = os.path.expanduser("~")

# Create a path to the settings file in the user's home directory
settings_file = "settings_ai_agent.ini"
if "--client" in sys.argv:
    client_index = sys.argv.index("--client")
    print("Using settings file: {}".format(sys.argv[client_index + 1]))
    settings_file = "settings_ai_agent_{}.ini".format(sys.argv[client_index + 1])
settings_path = os.path.join(home_dir, ".spacetime_mud", settings_file)

default_open_ai_key = None
if "--openai" in sys.argv:
    openai_index = sys.argv.index("--openai")
    print("Using openai key: {}".format(sys.argv[openai_index + 1]))
    default_open_ai_key = sys.argv[openai_index + 1]

# Create a ConfigParser object and read the settings file (if it exists)
config = configparser.ConfigParser()
if os.path.exists(settings_path):
    config.read(settings_path)
else:
    # Set some default config values
    config["main"] = {
        "openapi_key": default_open_ai_key
    }

def set_config(config_in):
    for key, value in config_in:
        config["main"][key] = value
    save()

def get_string(key):
    if key in config["main"]:
        return config["main"][key]
    return None


def set_string(key, value):
    # Update config values at runtime
    config["main"][key] = value
    save()


def save():
    # Write the updated config values to the settings file
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)
    with open(settings_path, "w") as f:
        config.write(f)
