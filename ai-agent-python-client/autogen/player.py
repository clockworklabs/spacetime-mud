# THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
# WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

from __future__ import annotations
from typing import List, Iterator, Callable

from spacetimedb_python_sdk.spacetimedb_client import SpacetimeDBClient

class Player:
	is_table_class = True

	@classmethod
	def register_row_update(cls, callback: Callable[[str,Player,Player], None]):
		SpacetimeDBClient.instance._register_row_update("Player",callback)

	@classmethod
	def iter(cls) -> Iterator[Player]:
		return SpacetimeDBClient.instance._get_table_cache("Player").values()

	@classmethod
	def filter_by_spawnable_entity_id(cls, spawnable_entity_id) -> Player:
		return next(iter([column_value for column_value in SpacetimeDBClient.instance._get_table_cache("Player").values() if column_value.spawnable_entity_id == spawnable_entity_id]), None)

	@classmethod
	def filter_by_identity(cls, identity) -> Player:
		return next(iter([column_value for column_value in SpacetimeDBClient.instance._get_table_cache("Player").values() if column_value.identity == identity]), None)

	def __init__(self, data: List[object]):
		self.data = {}
		self.data["spawnable_entity_id"] = int(data[0])
		self.data["identity"] = bytes.fromhex(data[1])

	def encode(self) -> List[object]:
		return [self.spawnable_entity_id, self.identity]

	def __getattr__(self, name: str):
		return self.data.get(name)
