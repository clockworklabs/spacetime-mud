// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue, ReducerEvent, Identity } from "@clockworklabs/spacetimedb-sdk";

export class World extends IDatabaseTable
{
	public static tableName = "World";
	public worldId: string;
	public name: string;
	public description: string;

	public static primaryKey: string | undefined = "worldId";

	constructor(worldId: string, name: string, description: string) {
	super();
		this.worldId = worldId;
		this.name = name;
		this.description = description;
	}

	public static serialize(value: World): object {
		return [
		value.worldId, value.name, value.description
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("world_id", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("name", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("description", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
		]);
	}

	public static fromValue(value: AlgebraicValue): World
	{
		let productValue = value.asProductValue();
		let __world_id = productValue.elements[0].asString();
		let __name = productValue.elements[1].asString();
		let __description = productValue.elements[2].asString();
		return new this(__world_id, __name, __description);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("World").count();
	}

	public static all(): World[]
	{
		return __SPACETIMEDB__.clientDB.getTable("World").getInstances() as unknown as World[];
	}

	public static filterByWorldId(value: string): World | null
	{
		for(let instance of __SPACETIMEDB__.clientDB.getTable("World").getInstances())
		{
			if (instance.worldId === value) {
				return instance;
			}
		}
		return null;
	}

	public static filterByName(value: string): World[]
	{
		let result: World[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("World").getInstances())
		{
			if (instance.name === value) {
				result.push(instance);
			}
		}
		return result;
	}

	public static filterByDescription(value: string): World[]
	{
		let result: World[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("World").getInstances())
		{
			if (instance.description === value) {
				result.push(instance);
			}
		}
		return result;
	}


	public static onInsert(callback: (value: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: World, newValue: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").onUpdate(callback);
	}

	public static onDelete(callback: (value: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: World, newValue: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: World, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("World").removeOnDelete(callback);
	}

}

export default World;

__SPACETIMEDB__.registerComponent("World", World);
