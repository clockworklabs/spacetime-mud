// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, ReducerEvent } from "@clockworklabs/spacetimedb-sdk";

export class TellReducer
{
	public static call(_sourceSpawnableEntityId: number, _targetSpawnableEntityId: number, _chatText: string)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
		const serializer = __SPACETIMEDB__.spacetimeDBClient.getSerializer();
		let _sourceSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_sourceSpawnableEntityIdType, _sourceSpawnableEntityId);
		let _targetSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_targetSpawnableEntityIdType, _targetSpawnableEntityId);
		let _chatTextType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_chatTextType, _chatText);
			__SPACETIMEDB__.spacetimeDBClient.call("tell", serializer);
		}
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let sourceSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let sourceSpawnableEntityIdValue = AlgebraicValue.deserialize(sourceSpawnableEntityIdType, adapter.next())
		let sourceSpawnableEntityId = sourceSpawnableEntityIdValue.asNumber();
		let targetSpawnableEntityIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let targetSpawnableEntityIdValue = AlgebraicValue.deserialize(targetSpawnableEntityIdType, adapter.next())
		let targetSpawnableEntityId = targetSpawnableEntityIdValue.asNumber();
		let chatTextType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let chatTextValue = AlgebraicValue.deserialize(chatTextType, adapter.next())
		let chatText = chatTextValue.asString();
		return [sourceSpawnableEntityId, targetSpawnableEntityId, chatText];
	}

	public static on(callback: (reducerEvent: ReducerEvent, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:Tell", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("Tell", TellReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("Tell", TellReducer);
}

export default TellReducer
