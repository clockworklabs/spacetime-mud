import json
from autogen.room import Room
from .command import Command
from json_encoding import RoomEncoder
from openai_harness import openai_call

import autogen.create_connection_reducer as create_connection_reducer
import autogen.create_room_reducer as create_room_reducer

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
            return ("I'm having trouble responding. Please try again.", False, "")
        
        if 'room_id' in message_json:
            exit_direction = message_json['source_room_exit_direction']
            if exit_direction in [exit.direction for exit in prompt_info.source_room.exits]:
                print("OpenAI Prompt Error: Exit already exists in that direction")
                return ("I'm having trouble responding. Please try again.", False, "")
            if Room.filter_by_room_id(message_json['room_id']):
                print("OpenAI Prompt Error: Room already exists with that ID")
                return ("I'm having trouble responding. Please try again.", False, "")
            create_room_reducer.create_room(prompt_info.source_zone.zone_id, message_json['room_id'], message_json['room_name'], message_json['room_description'])
            create_connection_reducer.create_connection(prompt_info.source_room.room_id, message_json['room_id'], message_json['source_room_exit_direction'], message_json['new_room_exit_direction'],"","")
            return (message_json['message'], True, message_json['room_id'])
        elif 'message' in message_json:
            return (message_json['message'], False, "")
        else:
            print("OpenAI Prompt Error: Invalid response")
            self.respond("I'm having trouble responding. Please try again.")
            return ("I'm having trouble responding. Please try again.", False, "")