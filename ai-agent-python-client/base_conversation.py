import queue
import threading
import time
from autogen.location import Location
from autogen.mobile import Mobile

from autogen.room import Room
from autogen.world import World
from autogen.zone import Zone
import autogen.tell_reducer as tell_reducer
import autogen.say_reducer as say_reducer

class PromptInfo:
    source_room: Room
    source_zone: Zone
    source_world: World
    is_tell: bool
    prompt: str

    def __init__(self, me: Mobile, source_room: Room, source_zone: Zone, source_world: World, is_tell: bool, prompt: str):
        self.me = me
        self.source_room = source_room
        self.source_zone = source_zone
        self.source_world = source_world
        self.is_tell = is_tell
        self.prompt = prompt
        
class BaseConversation:
    def __init__(self, entity_id, source_spawnable_entity_id: int):
        self.entity_id = entity_id
        self.prompt_queue = queue.Queue()
        self.source_spawnable_entity_id = source_spawnable_entity_id
        self.worker_thread = threading.Thread(target=self.worker)
        self.worker_thread.start()
        self.thinking = False
        self.prompt_prefix = ""

    def message_arrived(self, message: str, is_tell: bool):
        print(f"[Behavior] Message arrived: {message}")
        if self.thinking:
            self.respond("Please wait, I'm thinking...")
        else:            
            me = Mobile.filter_by_spawnable_entity_id(self.entity_id)
            source_location = Location.filter_by_spawnable_entity_id(self.source_spawnable_entity_id)
            source_room = Room.filter_by_room_id(source_location.room_id)
            source_zone = Zone.filter_by_zone_id(source_room.zone_id)
            source_world = World.filter_by_world_id(source_zone.world_id)
            self.prompt_queue.put(PromptInfo(me, source_room, source_zone, source_world, is_tell, message))

    def handle_prompt(self, promptInfo):
        # override with logic to handle prompt
        pass

    def worker(self):
        while True:
            while not self.prompt_queue.empty():
                self.handle_prompt(self.prompt_queue.get())
            time.sleep(0.1)

    def respond(self, message, is_tell=True):
        print(f"[Behavior] Responding: {message}")
        if(is_tell):
            tell_reducer.tell(self.entity_id, self.source_spawnable_entity_id, message)
        else:
            say_reducer.say(self.entity_id, message)

    def close(self):
        self.worker_thread.join()
