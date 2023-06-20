import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

import Player from "./types/player";

export enum GameState {
    CONNECTING = 'CONNECTING',
    CREATE_CHARACTER = 'CREATE_CHARACTER',
    WAIT_FOR_PLAYER = 'WAIT_FOR_PLAYER',
    GAME = 'GAME',
}

export class GameController {
    private readonly DBNAME = 'examplemud'; // replace with your database name

    private client: SpacetimeDBClient;
    public gameState: GameState = GameState.CONNECTING; // Initialized to connecting state

    private local_identity: Uint8Array;

    private setConsole: (value: ((prevState: JSX.Element[]) => JSX.Element[]) | JSX.Element[]) => void = () => { };

    setConsoleFunction = (setConsole: (value: ((prevState: JSX.Element[]) => JSX.Element[]) | JSX.Element[]) => void) => {
        this.setConsole = setConsole;
    }

    constructor() {
        this.client = new SpacetimeDBClient('localhost:3000', this.DBNAME);
        this.local_identity = new Uint8Array();
    }

    public init(): void {
        console.log("Initializing game controller");
        this.client.connect();
        this.client.subscribe([
            "SELECT * FROM Mobile",
            "SELECT * FROM Player",
            "SELECT * FROM Location",
            "SELECT * FROM Room",
            "SELECT * FROM RoomChat"
        ]);

        this.client.onConnect((identity: Uint8Array) => {
            this.local_identity = identity;
        });

        this.client.on('InitialStateSync', () => {
            console.log("Initial state sync");
            var player = Player.filterByIdentity(this.local_identity);
            if (player) {
                this.gameState = GameState.GAME;
                this.setConsole((prev) => {
                    return [...prev, <p>Welcome back.</p>];
                });
            }
        });
    }

    public close(): void {
        this.client.disconnect();
    }
}