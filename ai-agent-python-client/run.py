import sys
sys.path.insert(0,"../../spacetimedb-python-sdk/")

import asyncio
from conversation import Conversation
from global_vars import GlobalVars

import game_config

from spacetimedb_python_sdk.spacetimedb_async_client import SpacetimeDBAsyncClient

import autogen
from autogen.player import Player
from autogen.mobile import Mobile
import autogen.create_player_reducer as create_player_reducer
import autogen.tell_reducer as tell_reducer

auth_token = game_config.get_string("auth")
spacetime_client = SpacetimeDBAsyncClient(autogen)

logged_in = False

conversations = {}

def on_connect(auth_token,identity):  
    game_config.set_string("auth", auth_token)
    GlobalVars.local_identity = identity
    print(f"Connected.")    
    
def on_player_created(caller: bytes, status: str, message: str, name: str, description: str):
    global logged_in

    if caller == GlobalVars.local_identity and status == "committed":
        print(f"Player {name} created")
        GlobalVars.local_spawnable_entity_id = Player.filter_by_identity(GlobalVars.local_identity).spawnable_entity_id
        logged_in = True
        # todo: unregister callback when we have autogen functions for it
                
def on_tell(caller: bytes, status: str, message: str, source_entity_id: int, target_entity_id: int, tell_message: str):
    if status == "committed" and target_entity_id == GlobalVars.local_spawnable_entity_id:
        if source_entity_id not in conversations:
            conversations[source_entity_id] = Conversation(source_entity_id)
        conversations[source_entity_id].message_arrived(tell_message)

tell_reducer.register_on_tell(on_tell)

def on_subscription_applied():    
    global logged_in

    player = Player.filter_by_identity(GlobalVars.local_identity)
    if player is not None:
        GlobalVars.local_spawnable_entity_id = player.spawnable_entity_id
        mobile = Mobile.filter_by_spawnable_entity_id(player.spawnable_entity_id)
        print(f"Player {mobile.name} found.")
    else:
        print(f"Creating player")
        
        create_player_reducer.register_on_create_player(on_player_created)
        create_player_reducer.create_player("AIAgent", "")

spacetime_client.client.register_on_subscription_applied(on_subscription_applied)

if __name__ == "__main__":
    try:
        asyncio.run(spacetime_client.run(
                        auth_token, 
                        "localhost:3000", 
                        "example-mud", 
                        False, 
                        on_connect, 
                        ["SELECT * FROM Mobile", 
                        "SELECT * FROM Player", 
                        "SELECT * FROM Location",
                        "SELECT * FROM Room",
                        "SELECT * FROM RoomChat",
                        "SELECT * FROM Zone",
                        "SELECT * FROM World",
                        "SELECT * FROM DirectMessage"]))
    except KeyboardInterrupt:
        for conversation in conversations.values():
            conversation.close()
        asyncio.run(spacetime_client.close())