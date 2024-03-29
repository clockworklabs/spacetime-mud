// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue, ReducerEvent } from "@clockworklabs/spacetimedb-sdk";

export class Globals extends IDatabaseTable
{
	public static tableName = "Globals";
	public id: number;
	public spawnableEntityIdCounter: number;

	public static primaryKey: string | undefined = "id";

	constructor(id: number, spawnableEntityIdCounter: number) {
	super();
		this.id = id;
		this.spawnableEntityIdCounter = spawnableEntityIdCounter;
	}

	public static serialize(value: Globals): object {
		return [
		value.id, value.spawnableEntityIdCounter
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("id", AlgebraicType.createPrimitiveType(BuiltinType.Type.I32)),
			new ProductTypeElement("spawnable_entity_id_counter", AlgebraicType.createPrimitiveType(BuiltinType.Type.I32)),
		]);
	}

	public static fromValue(value: AlgebraicValue): Globals
	{
		let productValue = value.asProductValue();
		let __id = productValue.elements[0].asNumber();
		let __spawnable_entity_id_counter = productValue.elements[1].asNumber();
		return new this(__id, __spawnable_entity_id_counter);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("Globals").count();
	}

	public static all(): Globals[]
	{
		return __SPACETIMEDB__.clientDB.getTable("Globals").getInstances() as unknown as Globals[];
	}

	public static filterById(value: number): Globals | null
	{
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Globals").getInstances())
		{
			if (instance.id === value) {
				return instance;
			}
		}
		return null;
	}

	public static filterBySpawnableEntityIdCounter(value: number): Globals[]
	{
		let result: Globals[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("Globals").getInstances())
		{
			if (instance.spawnableEntityIdCounter === value) {
				result.push(instance);
			}
		}
		return result;
	}


	public static onInsert(callback: (value: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: Globals, newValue: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").onUpdate(callback);
	}

	public static onDelete(callback: (value: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: Globals, newValue: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: Globals, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("Globals").removeOnDelete(callback);
	}

}

export default Globals;

__SPACETIMEDB__.registerComponent("Globals", Globals);
