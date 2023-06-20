// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue } from "@clockworklabs/spacetimedb-sdk";

export class SignOutReducer
{
	public static call(playerSpawnableEntityId: number)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.call("sign_out", [playerSpawnableEntityId]);
		}
	}

	public static deserializeArgs(rawArgs: any[]): any[] {
		let playerSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U64);
		let playerSpawnableEntityIdValue = AlgebraicValue.deserialize(playerSpawnableEntityIdType, rawArgs[0])
		let playerSpawnableEntityId = playerSpawnableEntityIdValue.asNumber();
		return [playerSpawnableEntityId];
	}

	public static on(callback: (status: string, identity: string, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:SignOut", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("SignOut", SignOutReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("SignOut", SignOutReducer);
}

export default SignOutReducer
