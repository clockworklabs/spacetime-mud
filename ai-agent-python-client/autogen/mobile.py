# THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
# WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

from __future__ import annotations
from typing import List, Iterator, Callable

from spacetimedb_sdk.spacetimedb_client import SpacetimeDBClient, Identity
from spacetimedb_sdk.spacetimedb_client import ReducerEvent

class Mobile:
	is_table_class = True

	primary_key = "spawnable_entity_id"

	@classmethod
	def register_row_update(cls, callback: Callable[[str,Mobile,Mobile,ReducerEvent], None]):
		SpacetimeDBClient.instance._register_row_update("Mobile",callback)

	@classmethod
	def iter(cls) -> Iterator[Mobile]:
		return SpacetimeDBClient.instance._get_table_cache("Mobile").values()

	@classmethod
	def filter_by_spawnable_entity_id(cls, spawnable_entity_id) -> Mobile:
		return next(iter([column_value for column_value in SpacetimeDBClient.instance._get_table_cache("Mobile").values() if column_value.spawnable_entity_id == spawnable_entity_id]), None)

	@classmethod
	def filter_by_name(cls, name) -> List[Mobile]:
		return [column_value for column_value in SpacetimeDBClient.instance._get_table_cache("Mobile").values() if column_value.name == name]

	@classmethod
	def filter_by_description(cls, description) -> List[Mobile]:
		return [column_value for column_value in SpacetimeDBClient.instance._get_table_cache("Mobile").values() if column_value.description == description]

	def __init__(self, data: List[object]):
		self.data = {}
		self.data["spawnable_entity_id"] = int(data[0])
		self.data["name"] = str(data[1])
		self.data["description"] = str(data[2])

	def encode(self) -> List[object]:
		return [self.spawnable_entity_id, self.name, self.description]

	def __getattr__(self, name: str):
		return self.data.get(name)
