// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue } from "@clockworklabs/spacetimedb-sdk";

export class CreateRoomReducer
{
	public static call(zoneId: string, roomId: string, name: string, description: string)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.call("create_room", [zoneId, roomId, name, description]);
		}
	}

	public static deserializeArgs(rawArgs: any[]): any[] {
		let zoneIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let zoneIdValue = AlgebraicValue.deserialize(zoneIdType, rawArgs[0])
		let zoneId = zoneIdValue.asString();
		let roomIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let roomIdValue = AlgebraicValue.deserialize(roomIdType, rawArgs[1])
		let roomId = roomIdValue.asString();
		let nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let nameValue = AlgebraicValue.deserialize(nameType, rawArgs[2])
		let name = nameValue.asString();
		let descriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let descriptionValue = AlgebraicValue.deserialize(descriptionType, rawArgs[3])
		let description = descriptionValue.asString();
		return [zoneId, roomId, name, description];
	}

	public static on(callback: (status: string, identity: string, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:CreateRoom", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("CreateRoom", CreateRoomReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("CreateRoom", CreateRoomReducer);
}

export default CreateRoomReducer
