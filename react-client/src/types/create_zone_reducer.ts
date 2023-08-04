// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, ReducerEvent } from "@clockworklabs/spacetimedb-sdk";

export class CreateZoneReducer
{
	public static call(_zoneId: string, _worldId: string, _zoneName: string, _zoneDescription: string)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
		const serializer = __SPACETIMEDB__.spacetimeDBClient.getSerializer();
		let _zoneIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_zoneIdType, _zoneId);
		let _worldIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_worldIdType, _worldId);
		let _zoneNameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_zoneNameType, _zoneName);
		let _zoneDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_zoneDescriptionType, _zoneDescription);
			__SPACETIMEDB__.spacetimeDBClient.call("create_zone", serializer);
		}
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let zoneIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let zoneIdValue = AlgebraicValue.deserialize(zoneIdType, adapter.next())
		let zoneId = zoneIdValue.asString();
		let worldIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let worldIdValue = AlgebraicValue.deserialize(worldIdType, adapter.next())
		let worldId = worldIdValue.asString();
		let zoneNameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let zoneNameValue = AlgebraicValue.deserialize(zoneNameType, adapter.next())
		let zoneName = zoneNameValue.asString();
		let zoneDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let zoneDescriptionValue = AlgebraicValue.deserialize(zoneDescriptionType, adapter.next())
		let zoneDescription = zoneDescriptionValue.asString();
		return [zoneId, worldId, zoneName, zoneDescription];
	}

	public static on(callback: (reducerEvent: ReducerEvent, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:CreateZone", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("CreateZone", CreateZoneReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("CreateZone", CreateZoneReducer);
}

export default CreateZoneReducer
