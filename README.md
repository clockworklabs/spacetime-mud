# SpacetimeMUD
Welcome to SpacetimeMUD, a game project developed in using, Rust (server), Typescript (frontend), and Python (ai-agent) that uses SpacetimeDB to create a text based adventure game commonly known as a "Multi-user dungeon". One twist is that players create the dungeon by giving commands to an AI Agent that connects like a player but uses OpenAI to generate the content from user prompts. While this project is still under development, all the code and assets are open-source and free for anyone to use in their own projects.

## Features

-   **Login**: The user's private key is stored locally in their home directory the first time they play and is used to authenticate in future sessions.
-  **Rooms and Navigation**: Players can see the room description of the current room and use exit connections to travel form room to room.
- **Chat**: Players can speak to each other and NPCs using say and tell commands.
- **NPCs**: NPCs can have conversations with players and are driven by prompts sent to OpenAI API.
-   **Room and NPC Creation**: Players can send messages to the AI Agent asking it to create new rooms and spawn conversational NPCs


## Getting Started

1. [Install SpacetimDB](https://spacetimedb.com/install) and start SpacetimeDB local instance. View the [SpacetimeDB getting started](https://spacetimedb.com/docs/getting-started) guide for detailed instructions.
2. Navigate to the Server folder. Publish the SpacetimeMUD module to your local instance.

`spacetime publish spacetimemud`

3. Navigate to the `react-client` folder and run `npm install` and `npm start` to launch a local client. (Requires Node JS to be installed)
4. To start the AI Agent, navigate to the `ai-agent-python-client` folder and run `python run.py --openai <INSERT_OPENAI_API_KEY>`

## License

TBD