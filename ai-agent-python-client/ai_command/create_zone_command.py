import json
import queue
import time
import copy
from ai_command.create_room_command import CreateRoomCommand
from autogen.room import Room
from autogen.zone import Zone
from json_encoding import RoomEncoder
from .command import Command
from game_helpers import get_zone_rooms_json
from openai_harness import openai_call

import autogen.create_zone_reducer as create_zone_reducer
import autogen.create_room_reducer as create_room_reducer

class CreateZoneCommand(Command):
    direction = None
    zone_id = None
    zone_name = None
    zone_description = None
    zone_size = None
    room_count = 0    

    def __init__(self, prompt_prefix):
        self.prompt_prefix = prompt_prefix
        self.pending_room_ids = []
        self.room_creation_events = queue.Queue()
        self.zone_rooms = {}

    description = "create_zone: This command creates an entire zone with the entrance in the current room."
    required_information = {
        "direction": "The direction the zone entrance should be in from the current room",
        "zone_description": "A description of the zone",
        "zone_size": "Target number of rooms in the zone",
        # TODO
        # zone level range
    }

    def execute(self, prompt_info):
        prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\nCurrent Room Info: \n\n{json.dumps(prompt_info.source_room.data, cls=RoomEncoder)}\n\nUser Prompt:\n\n{prompt_info.prompt}.\n\nInstructions: The user has asked you to create a zone adjoining the room they are currently in. We are going to first create the zone definition. If the user prompt does not contain enough information to fill out the fields in the JSON below, respond with only the message which should inform the user what information is missing and asking them to try again. If successful, you do not need to provide a message. From this prompt, respond in the following JSON format: {{\"direction\": \"direction requested by the user\", \"zone_id\": \"generated id based on description\", \"zone_name\": \"name_of_new_zone\", \"zone_description\": \"description_of_new_zone\", \"zone_size\": \"target number of rooms in the zone\", \"message\": \"Friendly response to the user\"}}"

        message_json = None
        try:
            message_response = openai_call(prompt)
            message_json = json.loads(message_response)
        except Exception as e:
            print("OpenAI Prompt Error: " + e)            
            return ("I'm having trouble responding. Please try again.", False)
        
        if 'zone_id' in message_json and 'zone_name' in message_json and 'direction' in message_json and 'zone_description' in message_json and 'zone_size' in message_json and 'zone_size' != "unknown":
            self.prompt_info = prompt_info
            self.direction = message_json['direction']
            self.zone_id = message_json['zone_id']
            self.zone_name = message_json['zone_name']
            self.zone_description = message_json['zone_description']
            self.zone_size = int(message_json['zone_size'])

            create_zone_reducer.register_on_create_zone(self.on_create_zone)
            create_zone_reducer.create_zone(self.zone_id, prompt_info.source_world.world_id, self.zone_name, self.zone_description)

            # we need to loop and sleep until all the rooms are created, check for pending events and process them
            while True:
                while not self.room_creation_events.empty():
                    event = self.room_creation_events.get()
                    if event["room_id"] == "failed":
                        print("OpenAI Prompt Error: Zone creation failed to create room. " + event["message"])
                        return (event["message"], False)
                    else:
                        if event["room_id"] != "initial":
                            self.zone_rooms[event["room"].room_id] = event["room"]
                            self.room_count += 1
                        if self.room_count >= self.zone_size:
                            # have openai create a response telling the user the zone has been created
                            prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\n\nZone Info: \n\n{json.dumps(prompt_info.source_zone.data)}\n\nRoom Count: {self.room_count}\n\nUser Prompt:\n\n{prompt_info.prompt}.\n\nInstructions: The zone has been successfully created. Respond with a friendly message to the user giving them some information about the new zone in JSON format {{ \"message\": \"Hello\" }}"

                            message_json = None
                            try:
                                message_response = openai_call(prompt)
                                message_json = json.loads(message_response)
                            except Exception as e:
                                print("OpenAI Prompt Error: " + e)            
                                return ("I'm having trouble responding. Please try again.", False)
                            
                            return (message_json['message'], True)
                        else:
                            if event["room_id"] == "initial":
                                response, success = self.create_initial_room()
                                if not success:
                                    return (response, False)
                            elif self.room_count == 1:
                                response, success = self.create_next_room(event["room"])
                                if not success:
                                    return (response, False)
                            else:
                                response, success = self.find_next_room()
                                if not success:
                                    return (response, False)
                time.sleep(0.1)

        elif 'message' in message_json:
            return (message_json['message'], False)
        else:
            print("OpenAI Prompt Error: Invalid response")
            return ("I'm having trouble responding. Please try again.", False)

    def on_create_zone(self, caller, status, message, zone_id = None, world_id = None, zone_name = None, zone_description = None):
        if zone_id == self.zone_id:
            if status == "committed":
                print("OpenAI Prompt Info: Zone definition created.")                
                self.prompt_info.source_zone = Zone.filter_by_zone_id(zone_id)
                self.room_creation_events.put({"room_id":"initial"})
            else:
                print("OpenAI Prompt Error: Failed to create zone definition. " + message)
                self.room_creation_events.put({"room_id": "failed", "message": "I failed to create the zone definition. " + message})
            
    def create_initial_room(self):
        room_prompt_info = copy.copy(self.prompt_info)
        room_prompt_info.prompt = "The zone definition has been created. Now we will create the first room in the zone. Choose a name and description that makes sense for this room to be the entrance to the zone from the current room."
        create_room_command = CreateRoomCommand(self.prompt_prefix)
        
        response, success, room_id = create_room_command.execute(room_prompt_info)
        if not success:
            self.pending_room_ids.append(room_id)
            create_room_reducer.register_on_create_room(self.on_create_room)
            print("OpenAI Prompt Error: Failed to create initial room. " + response)
            return ("I failed to create the initial room for this zone. " + response, False)
        
        return ("Success", True)
        
    def find_next_room(self):
        # ask the ai to find the next room to create by providing all of the rooms in the zone
        # TODO this should not happen in this thread, pass the self.zone_rooms instead
        zone_rooms_json = get_zone_rooms_json(self.zone.zone_id, False)

        prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(self.prompt_info.source_world.data)}\n\nZone Info: \n\n{json.dumps(self.prompt_info.source_zone.data)}\n\nZone Rooms: {zone_rooms_json}\n\nYour job is to select the location of the next room in the zone by choosing an adjacent room from the provided list. Return the room_id of the selected adjacent room as the adjacent_room_id in the response. Respond in the following JSON format: {{ \"adjacent_room_id\": \"room_id\" }}"

        message_json = None
        try:
            message_response = openai_call(prompt)
            message_json = json.loads(message_response)
        except Exception as e:
            print("OpenAI Prompt Error: " + e)            
            return ("I'm having trouble responding. Please try again.", False)
        
        if 'adjacent_room_id' in message_json:
            adjacent_room_id = message_json['adjacent_room_id']
            # NOTE: This should not happen from this thread, we should cache the rooms
            
            if not adjacent_room_id in self.zone_rooms:
                print("OpenAI Prompt Error: Invalid adjacent room id")
                return ("I'm having trouble responding. Please try again.", False)
            else:
                adjacent_room = self.zone_rooms[adjacent_room_id]
                response, success = self.create_next_room(adjacent_room)
                if not success:
                    self.room_creation_events.put({"room_id": "failed", "message": response})
        else:
            print("OpenAI Prompt Error: Invalid response")
            return ("I'm having trouble responding. Please try again.", False)

        return ("Success", True)

    def create_next_room(self, room: Room):
        room_prompt_info = copy.copy(self.prompt_info)
        room_prompt_info.source_room = room

        room_prompt_info.prompt = "Create a room attached to the current room that is keeping within the theme of the zone. Choose a name and description that makes sense for this room to be connected to the current room. Pick a random direction that is already not used in the current room."
        create_room_command = CreateRoomCommand(self.prompt_prefix)
        
        response, success, room_id = create_room_command.execute(room_prompt_info)
        if not success:
            self.pending_room_ids.append(room_id)
            print("OpenAI Prompt Error: Failed to create initial room. " + response)
            return ("I failed to create the initial room for this zone. " + response, False)
        
        return ("Success", True)

    def on_create_room(self, caller, status, message, zone_id: str, room_id: str, name: str, description: str):
        if room_id in self.pending_room_ids:
            if status == "committed":
                self.room_creation_events.put({"room_id": room_id, "room": Room.filter_by_room_id(room_id) })                
            else:
                self.room_creation_events.put({"room_id": "failed", "message": message})
                

