import json
import queue
import threading
import time
from autogen.location import Location
from autogen.room import Room
from autogen.world import World
from autogen.zone import Zone
from autogen.mobile import Mobile

from global_vars import GlobalVars

import autogen.tell_reducer as tell_reducer
import autogen.create_room_reducer as create_room_reducer
import autogen.create_connection_reducer as create_connection_reducer
import autogen.create_npc_reducer as create_npc_reducer
from json_encoding import RoomEncoder 

from openai_harness import openai_call

class Command:
    description = "Base command, should be overridden."

    def execute(self, data, prompt_info):
        pass

class CreateRoomCommand(Command):
    def __init__(self, prompt_prefix):
        self.prompt_prefix = prompt_prefix

    description = "create_room: This command creates a new room connected to the current room."

    # execute returns a tuple of (response, is_finished)
    def execute(self, prompt_info):
        prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\nCurrent Room Info: \n\n{json.dumps(prompt_info.source_room.data, cls=RoomEncoder)}\n\nUser Prompt:\n\n{prompt_info.prompt}.\n\nInstructions: The user has asked you to create a room adjoining the room they are currently in. They should indicate the exit direction of this room. If you are able to complete the request, respond in the following JSON format: {{\"room_id\": \"room_id_of_new_room\", \"room_name\": \"name_of_new_room\", \"room_description\": \"description_of_new_room\", \"source_room_exit_direction\": \"direction requested by the user\", \"new_room_exit_direction\": \"opposite direction\", \"message\": \"Friendly response to the user telling them you processed the request\"}}\n\nIf you can't reasonably complete the request, write a response to the user in a friendly tone explaining why you can not complete the request in JSON format {{ \"message\": \"Hello\" }}" 

        message_json = None
        try:
            message_response = openai_call(prompt)
            message_json = json.loads(message_response)
        except Exception as e:
            print("OpenAI Prompt Error: " + e)            
            return ("I'm having trouble responding. Please try again.", False)
        
        if 'room_id' in message_json:
            exit_direction = message_json['source_room_exit_direction']
            if exit_direction in [exit.direction for exit in prompt_info.source_room.exits]:
                print("OpenAI Prompt Error: Exit already exists in that direction")
                return ("I'm having trouble responding. Please try again.", False)
            if Room.filter_by_room_id(message_json['room_id']):
                print("OpenAI Prompt Error: Room already exists with that ID")
                return ("I'm having trouble responding. Please try again.", False)
            create_room_reducer.create_room(prompt_info.source_zone.zone_id, message_json['room_id'], message_json['room_name'], message_json['room_description'])
            create_connection_reducer.create_connection(prompt_info.source_room.room_id, message_json['room_id'], message_json['source_room_exit_direction'], message_json['new_room_exit_direction'],"","")
            return (message_json['message'], False)
        elif 'message' in message_json:
            return (message_json['message'], False)
        else:
            print("OpenAI Prompt Error: Invalid response")
            self.respond("I'm having trouble responding. Please try again.")
            return ("I'm having trouble responding. Please try again.", False)

class DeleteRoomCommand(Command):
    description = "delete_room: This command deletes a specified room."

    def execute(self, data, prompt_info):
        # Do stuff specific to deleting a room
        pass

class CreateNPCCommand(Command):
    description = "create_npc: This command creates a new NPC in the current room."

    def execute(self, data, prompt_info):
        prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\nCurrent Room Info: \n\n{json.dumps(prompt_info.source_room.data, cls=RoomEncoder)}\n\nUser Prompt:\n\n{prompt_info.prompt}.\n\nInstructions: The user has asked you to create an NPC in the room they are currently in. If you are able to complete the request, respond in the following JSON format: {{\"npc_id\": \"npc_id_of_new_npc\", \"npc_name\": \"name_of_new_npc\", \"npc_description\": \"description when you look at npc\", \"npc_biography\": \"a short biography of this npc including appearance that can be used for generating this npc's dialogue\", \"message\": \"Friendly response to the user telling them you processed the request\"}}\n\nIf you can't reasonably complete the request, write a response to the user in a friendly tone explaining why you can not complete the request in JSON format {{ \"message\": \"Hello\" }}"

        message_json = None
        try:
            message_response = openai_call(prompt)
            message_json = json.loads(message_response)
        except Exception as e:
            print("OpenAI Prompt Error: " + e)            
            return ("I'm having trouble responding. Please try again.", False)
        
        if 'npc_id' in message_json:            
            create_npc_reducer.create_npc(prompt_info.source_zone.zone_id, message_json['npc_id'], message_json['npc_name'], message_json['npc_description'])
            return (message_json['message'], False)


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
    common_prompt_prefix = "You are an AI agent that is capable of building the game world based on commands given to you by players."
    source_spawnable_entity_id: int
    prompt_queue: queue.Queue
    prompt_prefix: str

    thinking = False

    def __init__(self, source_spawnable_entity_id: int):
        self.prompt_queue = queue.Queue()

        self.source_spawnable_entity_id = source_spawnable_entity_id
        self.worker_thread = threading.Thread(target=self.worker)
        self.worker_thread.start()

        self.commands = {
            "create_room": CreateRoomCommand(self.common_prompt_prefix),
            "delete_room": DeleteRoomCommand(),
            # etc.
        }

    def worker(self):
        while True:
            while not self.prompt_queue.empty():
                self.thinking = True
                prompt_info = self.prompt_queue.get()

                commands_description = "\n".join([command.description for command in self.commands.values()])


                prompt = f"You are an AI agent that is capable of building the game world based on commands given to you by players. You are talking to a player inside a multi-user dungeon. Here is a list of commands you can process:\n\n{commands_description}\n\n Keep your responses in character.\n\nWorld Info: {json.dumps(prompt_info.source_world.data)}\nPlayer Direct Message: {prompt_info.prompt}\n\nIf the user is asking you to do one of your supported commands, respond in the following JSON format: {{\"command\": \"command_name\"}}. Otherwise you will write a response to the user in a friendly tone in JSON format {{ \"message\": \"Hello\" }}"

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
                    self.process_command(message_json['command'], prompt_info)
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
    def process_command(self, command: str, prompt_info: PromptInfo):
        if command in self.commands:
            response, still_thinking = self.commands[command].execute(prompt_info)
            if response is not None:
                self.respond(response)
            if still_thinking is not None:
                self.thinking = still_thinking
        else:
            print("OpenAI Prompt Error: Invalid command")
            self.respond("I'm having trouble responding. Please try again.")
            self.thinking = False            

    def respond(self, message):
        tell_reducer.tell(GlobalVars.local_spawnable_entity_id, self.source_spawnable_entity_id, message)

    def close(self):
        self.worker_thread.join()