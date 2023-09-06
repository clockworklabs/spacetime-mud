import sys

sys.path.insert(0, "../../spacetimedb-python-sdk/src")

import asyncio
from autogen.location import Location
from global_vars import GlobalVars

from spacetimedb_sdk.spacetimedb_async_client import SpacetimeDBAsyncClient
from spacetimedb_sdk.spacetimedb_client import Identity
import spacetimedb_sdk.local_config as local_config

import autogen
from autogen.player import Player
from autogen.mobile import Mobile
import autogen.create_player_reducer as create_player_reducer
import autogen.tell_reducer as tell_reducer
import autogen.say_reducer as say_reducer
from npc_ai import NpcAI
from openai_harness import openai_call

# check to see if the user specified an openai key
default_open_ai_key = None
if "--openai" in sys.argv:
    openai_index = sys.argv.index("--openai")
    print("Using openai key: {}".format(sys.argv[openai_index + 1]))
    default_open_ai_key = sys.argv[openai_index + 1]

local_config.init(".spacetime_mud", "settings_ai_agent.ini", config_defaults={ "openapi_key": default_open_ai_key })
auth_token = local_config.get_string("auth")
spacetime_client = SpacetimeDBAsyncClient(autogen)

logged_in = False

npc_ais = {}

def on_connect(auth_token,identity):  
    local_config.set_string("auth", auth_token)
    GlobalVars.local_identity = identity
    print(f"Connected.")    

def on_player_created(caller: Identity, status: str, message: str, name: str, description: str):
    global logged_in

    if caller == GlobalVars.local_identity and status == "committed":
        print(f"Player {name} created")
        GlobalVars.local_spawnable_entity_id = Player.filter_by_identity(GlobalVars.local_identity).spawnable_entity_id
        logged_in = True
        npc_ais[GlobalVars.local_spawnable_entity_id] = NpcAI(GlobalVars.local_spawnable_entity_id, "ai_agent")
        # todo: unregister callback when we have autogen functions for it

def mobile_row_update(row_op, old_mobile, new_mobile, reducer_event):
    if(row_op == "insert" or row_op == "update"):
        player = Player.filter_by_spawnable_entity_id(new_mobile.spawnable_entity_id)
        if player is None and new_mobile.spawnable_entity_id not in npc_ais:
            npc_ais[new_mobile.spawnable_entity_id] = NpcAI(new_mobile.spawnable_entity_id, "npc")
        
Mobile.register_row_update(mobile_row_update)    

def on_tell(caller: Identity, status: str, message: str, source_entity_id: int, target_entity_id: int, tell_message: str):
    if status == "committed" and target_entity_id in npc_ais:
        npc_ais[target_entity_id].evaluateMessage(source_entity_id, tell_message, True)        

tell_reducer.register_on_tell(on_tell)

def npcs_in_room(room_id: int):
    #return [mobile for mobile in Mobile.iter() if Player.filter_by_spawnable_entity_id(mobile.spawnable_entity_id) is None and Location.filter_by_room_id(room_id) == room_id]
    return [mobile for mobile in Mobile.iter() if Player.filter_by_spawnable_entity_id(mobile.spawnable_entity_id) is None and Location.filter_by_spawnable_entity_id(mobile.spawnable_entity_id).room_id == room_id]

def on_say(caller: Identity, status: str, message: str, source_entity_id: int = 0, say_message: str = ""):
    #print(f"on_say: {caller} {status} {message} {source_entity_id} {say_message}")
    if status == "committed":
        # TODO: for now skip npc speech until we can handle it without getting into a loop
        if Player.filter_by_spawnable_entity_id(source_entity_id) is None:
            return

        # get the room for the source
        loc = Location.filter_by_spawnable_entity_id(source_entity_id)
        # get all the npcs in the room
        npcs = npcs_in_room(loc.room_id)
        for npc in npcs:
            if source_entity_id != npc.spawnable_entity_id:
                npc_ais[npc.spawnable_entity_id].evaluateMessage(source_entity_id, say_message, False)

say_reducer.register_on_say(on_say)

def on_subscription_applied():    
    global logged_in

    player = Player.filter_by_identity(GlobalVars.local_identity)
    if player is not None:
        GlobalVars.local_spawnable_entity_id = player.spawnable_entity_id
        mobile = Mobile.filter_by_spawnable_entity_id(player.spawnable_entity_id)
        npc_ais[GlobalVars.local_spawnable_entity_id] = NpcAI(player.spawnable_entity_id, "ai_agent")
        print(f"Player {mobile.name} found.")
    else:
        print(f"Creating player")
        
        create_player_reducer.register_on_create_player(on_player_created)
        create_player_reducer.create_player("AIAgent", "An AI Agent")

    valid_mobiles = [mobile for mobile in Mobile.iter() if Player.filter_by_spawnable_entity_id(mobile.spawnable_entity_id) is None ]
    for mobile in valid_mobiles:
        if mobile.spawnable_entity_id not in npc_ais:
            npc_ais[mobile.spawnable_entity_id] = NpcAI(mobile.spawnable_entity_id, "npc")

spacetime_client.client.register_on_subscription_applied(on_subscription_applied)

def welcome_tick():
    print("[Behavior] Welcome tick")
    prompt = "You are an AI agent that is capable of building the game world based on commands given to you by players. Every once in a while we want to say something in the room we are in. Say something now welcoming new players and letting them know about the help command."
    message_response = openai_call(prompt)
    say_reducer.say(GlobalVars.local_spawnable_entity_id, message_response)

    spacetime_client.schedule_event(50, welcome_tick)

#spacetime_client.schedule_event(50, welcome_tick)


if __name__ == "__main__":
    try:
        asyncio.run(spacetime_client.run(
                        auth_token, 
                        "testnet.spacetimedb.com", 
                        "spacetime-mud2", 
                        True, 
                        on_connect, 
                        ["SELECT * FROM Mobile", 
                        "SELECT * FROM Player", 
                        "SELECT * FROM Location",
                        "SELECT * FROM Room",
                        "SELECT * FROM RoomChat",
                        "SELECT * FROM Zone",
                        "SELECT * FROM World",
                        "SELECT * FROM DirectMessage",
                        "SELECT * FROM RoomChat"]))
    except KeyboardInterrupt:
        for npc_ai in npc_ais.values():
            npc_ai.closeConversations()
        asyncio.run(spacetime_client.close())