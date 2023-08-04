# Interactive Game World

Welcome to our Interactive Game World repository. This project is divided into three main components, each residing in its own directory. Here is a quick rundown:

## Directories

### Server

This directory contains the SpaceTimeDB server module. The server manages game state and player interactions. It contains the main logic for the game world, including player connections, room interactions, NPC logic, and the world expansion mechanism.

To run the server, navigate to the Server directory and publish it to your standalone SpacetimeDB instance. For instructions on this view the [SpacetimeDB Docs](https://spacetimedb.com/docs)

### react-client

The react-client directory holds our web client. This is the user interface for our game. It's built with React, a popular JavaScript library for building user interfaces, particularly single-page applications. The react-client interacts with the SpaceTimeDB server to provide players with an interactive experience.

To get started with the react-client, navigate to its directory and run npm start to start it.

### ai-agent-python-client

The ai-agent-python-client is our OpenAI powered agent. This unique component allows players to interact with the AI and request changes to the game world, such as creating new rooms or NPCs. It works by interpreting player commands and then responding in a way that adds to the game world.

To set up and start the ai-agent-python-client, navigate to its directory and run the run.py script. It requires an open-ai key which you can provide on the command line using --openai 

## Getting Started

Each directory contains its own README.md file with instructions on how to set up and run each part of the project. Start by navigating to the directory of the component you want to run, and follow the instructions there.

Thank you for checking out our project. We hope you enjoy exploring our interactive game world!

## License

This project is licensed under the terms of the MIT license.
