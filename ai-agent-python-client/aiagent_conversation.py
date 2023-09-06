import json
from ai_command.create_zone_command import CreateZoneCommand
from base_conversation import BaseConversation, PromptInfo

from openai_harness import openai_call

from ai_command import *

class AIAgentConversation(BaseConversation):
    common_prompt_prefix = "You are an AI agent that is capable of building the game world based on commands given to you by players."
    source_spawnable_entity_id: int

    def __init__(self, entity_id, source_spawnable_entity_id: int):
        print("[Behavior] Starting AIAgentConversation with source: " + str(source_spawnable_entity_id))
        super().__init__(entity_id, source_spawnable_entity_id)
        self.commands = {
            "create_room": CreateRoomCommand,
            "create_npc": CreateNPCCommand,
            "create_zone": CreateZoneCommand,
            # etc.
        }

    def handle_prompt(self, prompt_info: PromptInfo):  
        print("[Behavior] Thinking...")
        self.thinking = True

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

    # this function is called from the worker thread
    def process_command(self, command: str, prompt_info: PromptInfo):
        if command in self.commands:
            command_instance = self.commands[command](self.common_prompt_prefix)
            response, success = command_instance.execute(prompt_info)
            
            self.thinking = False
            if response is not None:
                self.respond(response)                    
        else:
            print("OpenAI Prompt Error: Invalid command")
            self.respond("I'm having trouble responding. Please try again.")
            self.thinking = False                