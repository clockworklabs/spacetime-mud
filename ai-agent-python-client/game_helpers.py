
import time
from autogen.mobile import Mobile
from autogen.room_chat import RoomChat


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