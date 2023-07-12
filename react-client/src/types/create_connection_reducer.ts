// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, IDatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer } from "@clockworklabs/spacetimedb-sdk";

export class CreateConnectionReducer
{
	public static call(_fromRoomId: string, _toRoomId: string, _fromDirection: string, _toDirection: string, _fromExitDescription: string, _toExitDescription: string)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
		const serializer = __SPACETIMEDB__.spacetimeDBClient.getSerializer();
		let _fromRoomIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_fromRoomIdType, _fromRoomId);
		let _toRoomIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_toRoomIdType, _toRoomId);
		let _fromDirectionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_fromDirectionType, _fromDirection);
		let _toDirectionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_toDirectionType, _toDirection);
		let _fromExitDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_fromExitDescriptionType, _fromExitDescription);
		let _toExitDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_toExitDescriptionType, _toExitDescription);
			__SPACETIMEDB__.spacetimeDBClient.call("create_connection", serializer);
		}
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let fromRoomIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let fromRoomIdValue = AlgebraicValue.deserialize(fromRoomIdType, adapter.next())
		let fromRoomId = fromRoomIdValue.asString();
		let toRoomIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let toRoomIdValue = AlgebraicValue.deserialize(toRoomIdType, adapter.next())
		let toRoomId = toRoomIdValue.asString();
		let fromDirectionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let fromDirectionValue = AlgebraicValue.deserialize(fromDirectionType, adapter.next())
		let fromDirection = fromDirectionValue.asString();
		let toDirectionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let toDirectionValue = AlgebraicValue.deserialize(toDirectionType, adapter.next())
		let toDirection = toDirectionValue.asString();
		let fromExitDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let fromExitDescriptionValue = AlgebraicValue.deserialize(fromExitDescriptionType, adapter.next())
		let fromExitDescription = fromExitDescriptionValue.asString();
		let toExitDescriptionType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let toExitDescriptionValue = AlgebraicValue.deserialize(toExitDescriptionType, adapter.next())
		let toExitDescription = toExitDescriptionValue.asString();
		return [fromRoomId, toRoomId, fromDirection, toDirection, fromExitDescription, toExitDescription];
	}

	public static on(callback: (status: string, identity: Uint8Array, reducerArgs: any[]) => void)
	{
		if (__SPACETIMEDB__.spacetimeDBClient) {
			__SPACETIMEDB__.spacetimeDBClient.on("reducer:CreateConnection", callback);
		}
	}
}

__SPACETIMEDB__.reducers.set("CreateConnection", CreateConnectionReducer);
if (__SPACETIMEDB__.spacetimeDBClient) {
	__SPACETIMEDB__.spacetimeDBClient.registerReducer("CreateConnection", CreateConnectionReducer);
}

export default CreateConnectionReducer
