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

    thinking = False

    def __init__(self, source_spawnable_entity_id: int):
        self.prompt_queue = queue.Queue()

        self.source_spawnable_entity_id = source_spawnable_entity_id
        self.worker_thread = threading.Thread(target=self.worker)
        self.worker_thread.start()

    def worker(self):
        while True:
            while not self.prompt_queue.empty():
                self.thinking = True
                prompt_info = self.prompt_queue.get()

                prompt = f"You are an AI agent and you are talking to a player inside a multi-user dungeon. Keep your responses in character.\n\nWorld Info: {json.dumps(prompt_info.source_world.data)}\nPlayer Direct Message: {prompt_info.prompt}\n\nWhat do you say? Respond in JSON format Example {{ \"message\": \"Hello\" }}"

                message_json = None
                try:
                    message_response = openai_call(prompt)
                    message_json = json.loads(message_response)
                except Exception as e:
                    print("OpenAI Prompt Error: " + e)
                    self.respond("I'm having trouble responding. Please try again.")
                    return
                
                self.respond(message_json['message'])
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

    def respond(self, message):
        tell_reducer.tell(GlobalVars.local_spawnable_entity_id, self.source_spawnable_entity_id, message)