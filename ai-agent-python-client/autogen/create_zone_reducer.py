# THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
# WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

from typing import List, Callable

from spacetimedb_sdk.spacetimedb_client import SpacetimeDBClient


def create_zone(zone_id: str, world_id: str, zone_name: str, zone_description: str):
	zone_id = zone_id
	world_id = world_id
	zone_name = zone_name
	zone_description = zone_description
	SpacetimeDBClient.instance._reducer_call("create_zone", zone_id, world_id, zone_name, zone_description)

def register_on_create_zone(callback: Callable[[bytes, str, str, str, str, str, str], None]):
	if not _check_callback_signature(callback):
		raise ValueError("Callback signature does not match expected arguments")

	SpacetimeDBClient.instance._register_reducer("create_zone", callback)

def _decode_args(data):
	return [str(data[0]), str(data[1]), str(data[2]), str(data[3])]

def _check_callback_signature(callback: Callable) -> bool:
	expected_arguments = [bytes, str, str, str, str, str, str]
	callback_arguments = callback.__annotations__.values()

	return list(callback_arguments) == expected_arguments
