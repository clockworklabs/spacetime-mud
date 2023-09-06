
import json
import time
from autogen.mobile import Mobile
from autogen.room import Room
from autogen.room_chat import RoomChat
from json_encoding import RoomEncoder


def get_room_chat_str(room_chat: RoomChat):
    timestamp_secs = room_chat.timestamp / 1000000
    time_since_message = int(time.time() - timestamp_secs)
    mobile = Mobile.filter_by_spawnable_entity_id(room_chat.source_spawnable_entity_id)
    return f"{mobile.name}: {room_chat.chat_text} ({time_since_message} seconds ago)"

def get_chat_log(room_id: int, num_messages: int = 10):
    this_room_chat = sorted(RoomChat.filter_by_room_id(room_id), key=lambda x: x.timestamp)[-num_messages:]
    # create a linux timestamp in milliseconds since epoch
    now_secs = time.time()
    
    # remove any item thats older than 1 minute (chat.timestamp is in microseconds)
    this_room_chat = [chat for chat in this_room_chat if (chat.timestamp/1000000) > (now_secs - 60)]

    return "\n".join(get_room_chat_str(chat) for chat in this_room_chat)

def get_zone_rooms_json(zone_id, include_descriptions):
    rooms_list = None
    if not zone_id:
        rooms_list = list(Room.iter())
    else:        
        rooms_list = Room.filter_by_zone_id(zone_id)
    
    return convert_rooms_list_to_json(rooms_list, include_descriptions)

def convert_rooms_list_to_json(rooms_list, include_descriptions):
    rooms_json = None
    
    try:
        rooms_json = json.dumps(rooms_list, cls=RoomEncoder)
        if not include_descriptions:
            rooms_list = json.loads(rooms_json)
            for room in rooms_list:
                del room['description']
                del room['exits']
        rooms_json = json.dumps(rooms_list)
    except Exception as e:
        print(e)
        print("Error parsing rooms data. Exiting.")
        return
    
    return rooms_json
    