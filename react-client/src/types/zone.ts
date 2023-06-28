// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue, ReducerEvent } from "@clockworklabs/spacetimedb-sdk";

export class Zone extends IDatabaseTable
{
	public static tableName = "Zone";
	public zoneId: string;
	public worldId: string;
	public name: string;
	public description: string;
	public connectingZones: string[];

	public static primaryKey: string | undefined = "zone_id";

	constructor(zoneId: string, worldId: string, name: string, description: string, connectingZones: string[]) {
	super();
		this.zoneId = zoneId;
		this.worldId = worldId;
		this.name = name;
		this.description = description;
		this.connectingZones = connectingZones;
	}

	public static serialize(value: Zone): object {
		return [
		value.zoneId, value.worldId, value.name, value.description, value.connectingZones
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("zone_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("world_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("name", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("description", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("connecting_zones", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.String))),
		]);
	}

	public static fromValue(value: AlgebraicValue): Zone
	{
		let productValue = value.asProductValue();
		let __zone_id = productValue.elements[0].asString();
		let __world_id = productValue.elements[1].asString();
		let __name = productValue.elements[2].asString();
		let __description = productValue.elements[3].asString();
		let __connecting_zones = productValue.elements[4].asArray().map(el => el.asString()) as string[];
		;
		return new this(__zone_id, __world_id, __name, __description, __connecting_zones);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("Zone").count();
	}

	public static all(): Zone[]
	{
		return __SPACETIMEDB__.clientDB.getTable("Zone").getInstances() as unknown as Zone[];
	}

	public static filterByZoneId(value: string): Zone | null
	{
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Zone").getInstances())
		{
			if (instance.zoneId === value) {
				return instance;
			}
		}
		return null;
	}

	public static filterByWorldId(value: string): Zone[]
	{
		let result: Zone[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Zone").getInstances())
		{
			if (instance.worldId === value) {
				result.push(instance);
			}
		}
		return result;
	}

	public static filterByName(value: string): Zone[]
	{
		let result: Zone[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Zone").getInstances())
		{
			if (instance.name === value) {
				result.push(instance);
			}
		}
		return result;
	}

	public static filterByDescription(value: string): Zone[]
	{
		let result: Zone[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Zone").getInstances())
		{
			if (instance.description === value) {
				result.push(instance);
			}
		}
		return result;
	}


	public static onInsert(callback: (value: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: Zone, newValue: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").onUpdate(callback);
	}

	public static onDelete(callback: (value: Zone, oldValue: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: Zone, newValue: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: Zone, oldValue: Zone, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Zone").removeOnDelete(callback);
	}

}

export default Zone;

__SPACETIMEDB__.registerComponent("Zone", Zone);
