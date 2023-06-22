// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue } from "@clockworklabs/spacetimedb-sdk";

export class Location extends IDatabaseTable
{
	public static tableName = "Location";
	public spawnableEntityId: number;
	public roomId: string | null;
	public lastRoomId: string | null;

	constructor(spawnableEntityId: number, roomId: string | null, lastRoomId: string | null) {
	super();
		this.spawnableEntityId = spawnableEntityId;
		this.roomId = roomId;
		this.lastRoomId = lastRoomId;
	}

	public static serialize(value: Location): object {
		return [
		value.spawnableEntityId, value.roomId ? { "some": value.roomId } : { "none": [] }, value.lastRoomId ? { "some": value.lastRoomId } : { "none": [] }
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("spawnable_entity_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.U64)),
			new ProductTypeElement("room_id", AlgebraicType.createSumType([
			new SumTypeVariant("some", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new SumTypeVariant("none", AlgebraicType.createProductType([
		])),
		])),
			new ProductTypeElement("last_room_id", AlgebraicType.createSumType([
			new SumTypeVariant("some", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new SumTypeVariant("none", AlgebraicType.createProductType([
		])),
		])),
		]);
	}

	public static fromValue(value: AlgebraicValue): Location
	{
		let productValue = value.asProductValue();
		let __spawnable_entity_id = productValue.elements[0].asNumber();
		let __room_id = productValue.elements[1].asSumValue().tag == 1 ? null : productValue.elements[1].asSumValue().value.asString();
		let __last_room_id = productValue.elements[2].asSumValue().tag == 1 ? null : productValue.elements[2].asSumValue().value.asString();
		return new this(__spawnable_entity_id, __room_id, __last_room_id);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("Location").count();
	}

	public static all(): Location[]
	{
		return __SPACETIMEDB__.clientDB.getTable("Location").getInstances() as unknown as Location[];
	}

	public static filterBySpawnableEntityId(value: number): Location | null
	{
		for(let entry of __SPACETIMEDB__.clientDB.getTable("Location").getEntries())
		{
			var productValue = entry.asProductValue();
			let compareValue = productValue.elements[0].asNumber() as number;
			if (compareValue == value) {
				return Location.fromValue(entry);
			}
		}
		return null;
	}


	public static onInsert(callback: (value: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: Location, newValue: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").onUpdate(callback);
	}

	public static onDelete(callback: (value: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: Location, newValue: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: Location) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Location").removeOnDelete(callback);
	}

}

export default Location;

__SPACETIMEDB__.registerComponent("Location", Location);
