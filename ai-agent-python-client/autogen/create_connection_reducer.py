# THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
# WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

from typing import List, Callable

from spacetimedb_sdk.spacetimedb_client import SpacetimeDBClient
from spacetimedb_sdk.spacetimedb_client import Identity


def create_connection(from_room_id: str, to_room_id: str, from_direction: str, to_direction: str, from_exit_description: str, to_exit_description: str):
	from_room_id = from_room_id
	to_room_id = to_room_id
	from_direction = from_direction
	to_direction = to_direction
	from_exit_description = from_exit_description
	to_exit_description = to_exit_description
	SpacetimeDBClient.instance._reducer_call("create_connection", from_room_id, to_room_id, from_direction, to_direction, from_exit_description, to_exit_description)

def register_on_create_connection(callback: Callable[[Identity, str, str, str, str, str, str, str, str], None]):
	SpacetimeDBClient.instance._register_reducer("create_connection", callback)

def _decode_args(data):
	return [str(data[0]), str(data[1]), str(data[2]), str(data[3]), str(data[4]), str(data[5])]
