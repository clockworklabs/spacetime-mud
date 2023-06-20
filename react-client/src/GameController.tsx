import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

import Player from "./types/player";
import Mobile from "./types/mobile";
import Location from "./types/location";
import World from "./types/world";
import Zone from "./types/zone";
import Room from "./types/room";
import RoomChat from "./types/room_chat";
import DirectMessage from './types/direct_message';
import create_player_reducer from './types/create_player_reducer';
console.log(Player, Mobile, Location, World, Zone, Room, RoomChat, DirectMessage);

export enum GameState {
    CONNECTING = 'CONNECTING',
    CREATE_CHARACTER = 'CREATE_CHARACTER',
    WAIT_FOR_PLAYER = 'WAIT_FOR_PLAYER',
    GAME = 'GAME',
}

export class GameController {
    private readonly DBNAME = 'example-mud'; // replace with your database name

    private client: SpacetimeDBClient;
    public gameState: GameState = GameState.CONNECTING; // Initialized to connecting state

    private local_identity: Uint8Array;
    private local_spawnable_entity_id: number;

    private setConsole: (value: ((prevState: JSX.Element[]) => JSX.Element[]) | JSX.Element[]) => void = () => { };

    setConsoleFunction = (setConsole: (value: ((prevState: JSX.Element[]) => JSX.Element[]) | JSX.Element[]) => void) => {
        this.setConsole = setConsole;
    }

    constructor() {
        this.client = new SpacetimeDBClient('localhost:3000', this.DBNAME);
        this.local_identity = new Uint8Array();
        this.local_spawnable_entity_id = 0;
    }

    public init(): void {
        console.log("Initializing game controller");
        this.client.connect();
        this.client.subscribe([
            "SELECT * FROM Mobile",
            "SELECT * FROM Player",
            "SELECT * FROM Location",
            "SELECT * FROM World",
            "SELECT * FROM Zone",
            "SELECT * FROM Room",
            "SELECT * FROM RoomChat",
            "SELECT * FROM DirectMessage"
        ]);

        this.client.onConnect((identity: Uint8Array) => {
            console.log("SpacetimeDB connected");
            this.local_identity = identity;
        });

        this.client.on('initialStateSync', () => {
            console.log("SpacetimeDB Initial state sync");
            var player = Player.filterByIdentity(this.local_identity);
            if (player) {
                this.gameState = GameState.GAME;
                this.local_spawnable_entity_id = player.spawnableEntityId;
                var mobile = Mobile.filterBySpawnableEntityId(this.local_spawnable_entity_id);
                if (mobile) {
                    this.console_print("Welcome back " + mobile.name + ".");
                }
                else {
                    this.on_undefined_error();
                }
            }
            else {
                this.gameState = GameState.CREATE_CHARACTER;
                this.console_print("What do you wish to be called?");
            }
        });

        create_player_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            var identity_array = (new TextEncoder()).encode(identity);
            if (identity_array === this.local_identity && status === "committed") {
                console.log("CreatePlayerReducer called with status: " + status + " by " + identity + " with args: " + reducerArgs);
                var player = Player.filterByIdentity(this.local_identity);
                if (player) {
                    this.gameState = GameState.GAME;
                    this.local_spawnable_entity_id = player?.spawnableEntityId;
                    var mobile = Mobile.filterBySpawnableEntityId(this.local_spawnable_entity_id);
                    this.console_print("Welcome " + mobile?.name + ".")
                }
                else {
                    this.on_undefined_error();
                }
            }
        });
    }

    public close(): void {
        this.client.disconnect();
    }

    public console_print(message: string): void {
        this.setConsole((prev) => {
            return [...prev, <p>{message}</p>];
        });
    }

    public on_command(command: string): void {
        if (this.gameState === GameState.CREATE_CHARACTER) {
            // todo: validate player name input
            var player_name = command;
            create_player_reducer.call(player_name, "");
        }
    }

    public on_undefined_error(): void {
        this.console_print("Something went wrong. Please refresh the page.");
        this.close();
    }
}