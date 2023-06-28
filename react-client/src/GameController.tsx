import { ReducerEvent, SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

import Player from "./types/player";
import Mobile from "./types/mobile";
import Location from "./types/location";
import World from "./types/world";
import Zone from "./types/zone";
import Room from "./types/room";
import RoomChat from "./types/room_chat";
import DirectMessage from './types/direct_message';
import create_player_reducer from './types/create_player_reducer';
import say_reducer from './types/say_reducer';
import tell_reducer from './types/tell_reducer';
import go_reducer from './types/go_reducer';
import sign_in_reducer from './types/sign_in_reducer';
import sign_out_reducer from './types/sign_out_reducer';
console.log(Player, Mobile, Location, World, Zone, Room, RoomChat, DirectMessage);

export enum GameState {
    CONNECTING = 'CONNECTING',
    CREATE_CHARACTER = 'CREATE_CHARACTER',
    WAIT_FOR_PLAYER = 'WAIT_FOR_PLAYER',
    GAME = 'GAME',
}

export enum Color {
    ROOM_NAME = '#00FFFF',
    // 0, 128, 128
    ROOM_EXITS = '#008080',
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
        let token = localStorage.getItem('auth_token') || undefined;
        console.log("Loading Token: " + token);
        this.client = new SpacetimeDBClient('localhost:3000', this.DBNAME, token);
        this.local_identity = new Uint8Array();
        this.local_spawnable_entity_id = 0;
    }

    public init(): void {
        console.log("Initializing game controller");
        this.client.connect();

        this.client.onConnect((token: string, identity: string) => {
            console.log("SpacetimeDB connected");
            console.log("Storing Token: " + token);
            this.local_identity = (new TextEncoder()).encode(identity);

            localStorage.setItem('auth_token', token);

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
        });

        this.client.onError(() => {
            this.on_undefined_error();
        })

        this.client.on('initialStateSync', () => {
            console.log("SpacetimeDB Initial state sync, player count: " + Player.count());
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
            console.log("CreatePlayerReducer called with status: " + status + " by " + identity_array + " with args: " + reducerArgs + ". My identity: " + this.local_identity);
            if (this.identitiesEqual(identity_array, this.local_identity) && status === "committed") {
                var player = Player.filterByIdentity(this.local_identity);
                if (player) {
                    this.gameState = GameState.GAME;
                    this.local_spawnable_entity_id = player?.spawnableEntityId;
                    var mobile = Mobile.filterBySpawnableEntityId(this.local_spawnable_entity_id);
                    this.console_print("Welcome " + mobile?.name + ".")
                    this.room();
                }
                else {
                    console.log("Player not found");
                    this.on_undefined_error();
                }
            }
        });

        say_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            if (status === "committed") {
                var source_spawnable_entity_id = reducerArgs[0];
                var chat_text = reducerArgs[1];

                const local_room_id = this.get_local_player_room_id();
                const source_location = Location.filterBySpawnableEntityId(source_spawnable_entity_id);

                if (local_room_id === source_location?.roomId) {
                    if (this.local_spawnable_entity_id === source_spawnable_entity_id) {
                        this.console_print(`You say "${chat_text}".\n`);
                    } else {
                        const source_name = this.get_name(source_spawnable_entity_id);
                        this.console_print(`${source_name} says "${chat_text}".\n`);
                    }

                    this.prompt();
                }
            }
        });

        tell_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            if (status === "committed" && reducerArgs[1] === this.local_spawnable_entity_id) {
                const source_name = this.get_name(reducerArgs[0]);
                this.console_print(`${source_name} tells you "${reducerArgs[2]}".\n`);
                this.prompt();
            }
        });

        sign_in_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            var player_spawnable_entity_id = reducerArgs[0];
            if (status === "committed" && player_spawnable_entity_id !== this.local_spawnable_entity_id) {
                const local_room_id = this.get_local_player_room_id();
                const source_location = Location.filterBySpawnableEntityId(player_spawnable_entity_id);
                if (local_room_id === source_location?.roomId) {
                    const source_name = this.get_name(player_spawnable_entity_id);
                    this.console_print(`${source_name} has entered the game.\n`);
                    this.prompt();
                }
            }
        });

        sign_out_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            var player_spawnable_entity_id = reducerArgs[0];
            if (status === "committed" && player_spawnable_entity_id !== this.local_spawnable_entity_id) {
                const local_room_id = this.get_local_player_room_id();
                const source_location = Location.filterBySpawnableEntityId(player_spawnable_entity_id);
                if (local_room_id === source_location?.lastRoomId) {
                    const source_name = this.get_name(player_spawnable_entity_id);
                    this.console_print(`${source_name} has left the game.\n`);
                    this.prompt();
                }
            }
        });

        go_reducer.on((status: string, identity: string, reducerArgs: any[]) => {
            var source_spawnable_entity_id = reducerArgs[0];
            var exit_direction = reducerArgs[1];
            if (status === "committed") {
                var caller_identity = (new TextEncoder()).encode(identity);
                if (this.identitiesEqual(this.local_identity, caller_identity)) {
                    this.console_print(`You go ${exit_direction}.\n`);
                    this.room();
                } else {
                    const local_room_id = this.get_local_player_room_id();
                    const source_location = Location.filterBySpawnableEntityId(source_spawnable_entity_id);
                    if (source_location?.lastRoomId === local_room_id) {
                        const source_name = this.get_name(source_spawnable_entity_id);
                        this.console_print(`${source_name} has left.\n`);
                        this.prompt();
                    } else if (source_location?.roomId === local_room_id) {
                        const source_name = this.get_name(source_spawnable_entity_id);
                        this.console_print(`${source_name} arrives.\n`);
                        this.prompt();
                    }
                }
            }
        });
    }

    public close(): void {
        this.client.disconnect();
    }

    public console_print(message: string, color: string | null = null): void {
        const outputElement = color !== null ? (
            <span style={{ color }}>{message}</span>
        ) : (
            message
        );

        this.setConsole((prev) => [...prev, <p>{outputElement}</p>]);
    }

    public on_command(command: string): void {
        if (this.gameState === GameState.CREATE_CHARACTER) {
            // todo: validate player name input
            var player_name = command;
            this.gameState = GameState.WAIT_FOR_PLAYER;
            create_player_reducer.call(player_name, "");
        }
        else if (this.gameState === GameState.GAME) {
            var room = this.get_local_player_room();
            var exits_strs: Array<string> = [];
            if (room) {
                exits_strs = this.getExitsStrs(room);
            }

            if (command.toLowerCase() === "quit" || command.toLowerCase() === "q") {
                //this.result = "quit";
            } else if (command.toLowerCase() === "look" || command.toLowerCase() === "l") {
                this.room();
            } else if (command.toLowerCase().startsWith("say ") || command.toLowerCase().startsWith("'")) {
                const prefix = command.toLowerCase().startsWith("say ") ? "say " : "'";
                const message = command.substring(prefix.length);
                say_reducer.call(this.local_spawnable_entity_id, message);
            } else if (command.toLowerCase().startsWith("tell ")) {
                const prefix = "tell ";
                const targetName = command.substring(prefix.length).split(" ")[0];
                const message = command.substring(command.indexOf(targetName) + targetName.length + 1);
                const matches = Array.from(Mobile.all()).filter(m => m.name.startsWith(targetName));
                if (matches.length !== 1) {
                    if (matches.length === 0) {
                        this.console_print(`${targetName} is not online.\n`);
                    } else {
                        this.console_print(`Which ${targetName} do you mean?\n`);
                    }
                    this.prompt();
                    return;
                } else {
                    this.console_print(`You tell ${matches[0].name} "${message}"\n`);
                    tell_reducer.call(this.local_spawnable_entity_id, matches[0].spawnableEntityId, message);
                }
            } else if (exits_strs.includes(command.toLowerCase())) {
                const index = exits_strs.indexOf(command.toLowerCase());
                var exit = room?.exits[index]
                /* Go in a direction */
                if (exit) {
                    if (!room?.exits.includes(exit)) {
                        this.console_print("You can't go that way!\n");
                        this.prompt();
                        return;
                    }

                    go_reducer.call(this.local_spawnable_entity_id, exit.direction);
                }
            } else {
                this.console_print("Huh?!?\n");
                this.prompt();
            }

        }
    }

    public room(): void {
        var room = this.get_local_player_room();
        if (room) {
            this.console_print(room.name + "\n", Color.ROOM_NAME);
            this.console_print(room.description + "\n");

            if (room.exits.length > 0) {
                console.log("EXIT COUNT: " + room.exits.length);
                const exits_str = room.exits.length > 0 ? room.exits.map(exit => exit.direction.toLowerCase()).join(', ') : "NONE";
                this.console_print("[EXITS: " + exits_str + "]\n", Color.ROOM_EXITS);
            }
            else {
                this.console_print("[Exits: NONE]\n", Color.ROOM_EXITS);
            }

            const spawnables_list: string[] = [];
            for (const spawnable of Location.all()) {
                if (spawnable.roomId === room.roomId && spawnable.spawnableEntityId !== this.local_spawnable_entity_id) {
                    const mob = Mobile.filterBySpawnableEntityId(spawnable.spawnableEntityId);
                    spawnables_list.push(`You see ${mob?.name}.`);
                }
            }
            let spawnables_str = spawnables_list.join("\n");
            if (spawnables_list.length > 0) {
                spawnables_str += "\n";
            }

            this.console_print(spawnables_str);
        }

        this.prompt();
    }

    public getExitsStrs(room: Room): string[] {
        if (room) {
            return room.exits.map((exit) => exit.direction);
        }
        return [];
    }

    public get_name(spawnable_entity_id: number): string {
        const mobile = Mobile.filterBySpawnableEntityId(spawnable_entity_id);
        return mobile ? mobile.name : "Unknown";
    }

    public get_local_player_room_id(): string | null {
        const local_player_id = this.local_spawnable_entity_id;
        if (local_player_id) {
            const location = Location.filterBySpawnableEntityId(local_player_id);
            return location ? location.roomId : null;
        }
        return null;
    }

    public get_local_player_room(): Room | null {
        return Room.filterByRoomId(this.get_local_player_room_id() || "");
    }

    public prompt(): void {
        this.console_print("> ");
    }

    public on_undefined_error(): void {
        this.console_print("Something went wrong. Please refresh the page.");
        this.close();
        console.log("undefined error");
        console.trace();
    }

    public identitiesEqual(a: Uint8Array, b: Uint8Array): boolean {
        if (a.length !== b.length) { this.console_print("fail"); return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }
        return true;
    }
}