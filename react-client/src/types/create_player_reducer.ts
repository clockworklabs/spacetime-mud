// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue } from "@clockworklabs/spacetimedb-sdk";

export class CreatePlayerReducer
{
	public static call(name: string, description: string)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.call("create_player", [name, description]);
		}
	}

	public static deserializeArgs(rawArgs: any[]): any[] {
		let nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let nameValue = AlgebraicValue.deserialize(nameType, rawArgs[0])
		let name = nameValue.asString();
		let descriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let descriptionValue = AlgebraicValue.deserialize(descriptionType, rawArgs[1])
		let description = descriptionValue.asString();
		return [name, description];
	}

	public static on(callback: (status: string, identity: string, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:CreatePlayer", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("CreatePlayer", CreatePlayerReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("CreatePlayer", CreatePlayerReducer);
}

export default CreatePlayerReducer
