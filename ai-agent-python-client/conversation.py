import json
import queue
import threading
import time
from autogen.location import Location
from autogen.room import Room
from autogen.world import World
from autogen.zone import Zone

from global_vars import GlobalVars

import autogen.tell_reducer as tell_reducer
import autogen.create_room_reducer as create_room_reducer
import autogen.create_connection_reducer as create_connection_reducer 

from openai_harness import openai_call

class PromptInfo:
    source_room: Room
    source_zone: Zone
    source_world: World
    prompt: str

    def __init__(self, source_room: Room, source_zone: Zone, source_world: World, prompt: str):
        self.source_room = source_room
        self.source_zone = source_zone
        self.source_world = source_world
        self.prompt = prompt

class Conversation:
    source_spawnable_entity_id: int
    prompt_queue: queue.Queue
    prompt_prefix: str

    thinking = False

    def __init__(self, source_spawnable_entity_id: int):
        self.prompt_queue = queue.Queue()

        self.source_spawnable_entity_id = source_spawnable_entity_id
        self.worker_thread = threading.Thread(target=self.worker)
        self.worker_thread.start()
        self.prompt_prefix = "You are an AI agent that is capable of building the game world based on commands given to you by players. "

    def worker(self):
        while True:
            while not self.prompt_queue.empty():
                self.thinking = True
                prompt_info = self.prompt_queue.get()

                prompt = f"You are an AI agent that is capable of building the game world based on commands given to you by players. You are talking to a player inside a multi-user dungeon. Currently at this early stage of the game's development, we can only process one command called create_room which will create a room connected to the room the player is currently in. Keep your responses in character.\n\nWorld Info: {json.dumps(prompt_info.source_world.data)}\nPlayer Direct Message: {prompt_info.prompt}\n\nIf the user is asking you to do one of your supported commands, respond in the following JSON format: {{\"command\": \"command_name\", \"command_prompt\": \"command_prompt_from_user_input\"}} otherwise you will write a response to the user in a friendly tone in JSON format {{ \"message\": \"Hello\" }}"

                message_json = None
                try:
                    message_response = openai_call(prompt)
                    message_json = json.loads(message_response)
                except Exception as e:
                    print("OpenAI Prompt Error: " + e)
                    self.respond("I'm having trouble responding. Please try again.")
                    self.thinking = False
                    return
                
                if 'command' in message_json:
                    self.process_command(message_json['command'], message_json['command_prompt'], prompt_info)
                elif 'message' in message_json:
                    self.respond(message_json['message'])
                    self.thinking = False
                else:
                    print("OpenAI Prompt Error: " + e)
                    self.respond("I'm having trouble responding. Please try again.")
                    self.thinking = False
            time.sleep(0.1)

    def message_arrived(self, message: str):
        global local_spawnable_entity_id
        print(f"Message arrived: {message}")
        if self.thinking:
            self.respond("Please wait, I'm thinking...")
        else:            
            source_location = Location.filter_by_spawnable_entity_id(self.source_spawnable_entity_id)
            source_room = Room.filter_by_room_id(source_location.room_id)
            source_zone = Zone.filter_by_zone_id(source_room.zone_id)
            source_world = World.filter_by_world_id(source_zone.world_id)
            self.prompt_queue.put(PromptInfo(source_room, source_zone, source_world, message))

    # this function is called from the worker thread
    def process_command(self, command: str, command_prompt: str, prompt_info: PromptInfo):
        if command == "create_room":
            prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\n\Current Room Info: \n\n{json.dumps(prompt_info.source_room.data)}\n\nThe user has asked you to create a room adjoining the room they are currently in. The user should have provided some information about the new room and the direction from their current room to put the exit. If you are able to complete the request, respond in the following JSON format: {{\"room_id\": \"room_id_of_new_room\", \"room_name\": \"name_of_new_room\", \"room_description\": \"description_of_new_room\", \"source_room_exit_direction\": \"direction_from_source_room_to_new_room\", \"new_room_exit_direction\": \"direction_from_new_room_to_source_room\", \"message\": \"Friendly response to the user telling them you processed the request\"}}\n\nIf you can't reasonably complete the request, write a response to the user in a friendly tone explaining why you can not complete the request in JSON format {{ \"message\": \"Hello\" }}" 

            message_json = None
            try:
                message_response = openai_call(prompt)
                message_json = json.loads(message_response)
            except Exception as e:
                print("OpenAI Prompt Error: " + e)
                self.respond("I'm having trouble responding. Please try again.")
                self.thinking = False
                return
            
            if 'room_id' in message_json:
                create_room_reducer.create_room(prompt_info.source_zone.zone_id, message_json['room_id'], message_json['room_name'], message_json['room_description'])
                create_connection_reducer.create_connection(prompt_info.source_room.room_id, message_json['room_id'], message_json['source_room_exit_direction'], message_json['new_room_exit_direction'],"","")
                self.respond(message_json['message'])
                self.thinking = False
            elif 'message' in message_json:
                self.respond(message_json['message'])
                self.thinking = False
            else:
                print("OpenAI Prompt Error: " + e)
                self.respond("I'm having trouble responding. Please try again.")
                self.thinking = False

    def respond(self, message):
        tell_reducer.tell(GlobalVars.local_spawnable_entity_id, self.source_spawnable_entity_id, message)