# THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
# WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

from typing import List, Callable

from spacetimedb_sdk.spacetimedb_client import SpacetimeDBClient


def sign_in(player_spawnable_entity_id: int):
	player_spawnable_entity_id = player_spawnable_entity_id
	SpacetimeDBClient.instance._reducer_call("sign_in", player_spawnable_entity_id)

def register_on_sign_in(callback: Callable[[bytes, str, str, int], None]):
	if not _check_callback_signature(callback):
		raise ValueError("Callback signature does not match expected arguments")

	SpacetimeDBClient.instance._register_reducer("sign_in", callback)

def _decode_args(data):
	return [int(data[0])]

def _check_callback_signature(callback: Callable) -> bool:
	expected_arguments = [bytes, str, str, int]
	callback_arguments = callback.__annotations__.values()

	return list(callback_arguments) == expected_arguments
