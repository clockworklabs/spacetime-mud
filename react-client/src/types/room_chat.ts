// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue } from "@clockworklabs/spacetimedb-sdk";

export class RoomChat extends IDatabaseTable
{
	public static tableName = "RoomChat";
	public chatEntityId: number;
	public roomId: string;
	public sourceSpawnableEntityId: number;
	public chatText: string;
	public timestamp: number;

	constructor(chatEntityId: number, roomId: string, sourceSpawnableEntityId: number, chatText: string, timestamp: number) {
	super();
		this.chatEntityId = chatEntityId;
		this.roomId = roomId;
		this.sourceSpawnableEntityId = sourceSpawnableEntityId;
		this.chatText = chatText;
		this.timestamp = timestamp;
	}

	public static serialize(value: RoomChat): object {
		return [
		value.chatEntityId, value.roomId, value.sourceSpawnableEntityId, value.chatText, value.timestamp
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("chat_entity_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.U64)),
			new ProductTypeElement("room_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("source_spawnable_entity_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.U64)),
			new ProductTypeElement("chat_text", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("timestamp", AlgebraicType.createPrimitiveType(BuiltinType.Type.U64)),
		]);
	}

	public static fromValue(value: AlgebraicValue): RoomChat
	{
		let productValue = value.asProductValue();
		let __chat_entity_id = productValue.elements[0].asNumber();
		let __room_id = productValue.elements[1].asString();
		let __source_spawnable_entity_id = productValue.elements[2].asNumber();
		let __chat_text = productValue.elements[3].asString();
		let __timestamp = productValue.elements[4].asNumber();
		return new this(__chat_entity_id, __room_id, __source_spawnable_entity_id, __chat_text, __timestamp);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("RoomChat").count();
	}

	public static all(): RoomChat[]
	{
		return __SPACETIMEDB__.clientDB.getTable("RoomChat").getInstances() as unknown as RoomChat[];
	}

	public static filterByChatEntityId(value: number): RoomChat | null
	{
		for(let entry of __SPACETIMEDB__.clientDB.getTable("RoomChat").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[0].asNumber() as number;
			if (compareValue == value) {
				return RoomChat.fromValue(entry);
			}
		}
		return null;
	}

	public static filterByRoomId(value: string): RoomChat[] | null
	{
		let result: RoomChat[] = [];
		for(let entry of __SPACETIMEDB__.clientDB.getTable("RoomChat").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[1].asString() as string;
			if (compareValue == value) {
				result.push(RoomChat.fromValue(entry));
			}
		}
		return result;
	}

	public static filterBySourceSpawnableEntityId(value: number): RoomChat[] | null
	{
		let result: RoomChat[] = [];
		for(let entry of __SPACETIMEDB__.clientDB.getTable("RoomChat").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[2].asNumber() as number;
			if (compareValue == value) {
				result.push(RoomChat.fromValue(entry));
			}
		}
		return result;
	}

	public static filterByChatText(value: string): RoomChat[] | null
	{
		let result: RoomChat[] = [];
		for(let entry of __SPACETIMEDB__.clientDB.getTable("RoomChat").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[3].asString() as string;
			if (compareValue == value) {
				result.push(RoomChat.fromValue(entry));
			}
		}
		return result;
	}

	public static filterByTimestamp(value: number): RoomChat[] | null
	{
		let result: RoomChat[] = [];
		for(let entry of __SPACETIMEDB__.clientDB.getTable("RoomChat").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[4].asNumber() as number;
			if (compareValue == value) {
				result.push(RoomChat.fromValue(entry));
			}
		}
		return result;
	}


	public static onInsert(callback: (value: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: RoomChat, newValue: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").onUpdate(callback);
	}

	public static onDelete(callback: (value: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: RoomChat, newValue: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: RoomChat) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("RoomChat").removeOnDelete(callback);
	}

}

export default RoomChat;

__SPACETIMEDB__.registerComponent("RoomChat", RoomChat);