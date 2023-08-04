// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, ReducerEvent } from "@clockworklabs/spacetimedb-sdk";

export class SignOutReducer
{
	public static call(_playerSpawnableEntityId: number)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
		const serializer = __SPACETIMEDB__.spacetimeDBClient.getSerializer();
		let _playerSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_playerSpawnableEntityIdType, _playerSpawnableEntityId);
			__SPACETIMEDB__.spacetimeDBClient.call("sign_out", serializer);
		}
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let playerSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let playerSpawnableEntityIdValue = AlgebraicValue.deserialize(playerSpawnableEntityIdType, adapter.next())
		let playerSpawnableEntityId = playerSpawnableEntityIdValue.asNumber();
		return [playerSpawnableEntityId];
	}

	public static on(callback: (reducerEvent: ReducerEvent, reducerArgs: any[]) => void)
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
