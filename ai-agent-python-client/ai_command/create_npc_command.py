import json
from .command import Command
from openai_harness import openai_call

import autogen.create_npc_reducer as create_npc_reducer

class CreateNPCCommand(Command):
    def __init__(self, prompt_prefix):
        self.prompt_prefix = prompt_prefix

    description = "create_npc: This command creates a new NPC in the current room."

    def execute(self, prompt_info):
        prompt = f"{self.prompt_prefix}\n\nWorld Info: \n\n{json.dumps(prompt_info.source_world.data)}\nCurrent Room Info: \n\n{json.dumps(prompt_info.source_room.data, cls=RoomEncoder)}\n\nUser Prompt:\n\n{prompt_info.prompt}.\n\nInstructions: The user has asked you to create an NPC in the room they are currently in. If you are able to complete the request, respond in the following JSON format: {{\"npc_id\": \"npc_id_of_new_npc\", \"npc_name\": \"name_of_new_npc\", \"npc_description\": \"description when you look at npc\", \"npc_biography\": \"a short biography of this npc including appearance that can be used for generating this npc's dialogue\", \"message\": \"Friendly response to the user telling them you processed the request\"}}\n\nIf you can't reasonably complete the request, write a response to the user in a friendly tone explaining why you can not complete the request in JSON format {{ \"message\": \"Hello\" }}"

        message_json = None
        try:
            message_response = openai_call(prompt)
            message_json = json.loads(message_response)
        except Exception as e:
            print("OpenAI Prompt Error: " + e)            
            return ("I'm having trouble responding. Please try again.", False)
        
        if 'npc_id' in message_json:            
            create_npc_reducer.create_npc(prompt_info.source_room.room_id, message_json['npc_name'], message_json['npc_description'])
            return (message_json['message'], True)
        else:
            print("OpenAI Prompt Error: Invalid response")
            return ("I'm having trouble responding. Please try again.", False)