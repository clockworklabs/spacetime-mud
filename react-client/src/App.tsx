import React, { FormEvent, useState, useEffect, useRef } from "react";
import "./App.css";

import { GameController } from './GameController'; // Adjust the path if necessary

var gameControllerGlobal = new GameController();
function App() {
  const gameController = useRef(gameControllerGlobal);
  const [console, setConsole] = useState<JSX.Element[]>([]);
  const [command, setCommand] = React.useState<string>("");

  useEffect(() => {
    gameController.current.init();
    gameController.current.setConsoleFunction(setConsole);

    // Clean up function: you can close the game controller when the component unmounts
    return () => {
      gameController.current.close();
    };
  }, []); // Empty dependency array: run this effect once on mount, and clean up on unmount


  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (command === "") return;

    gameController.current.on_command(command);

    setCommand("");
  };

  return (
    <div className="App">
      <div className="text-area">
        {console.map((line) => (
          <>{line}</>
        ))}
      </div>
      <hr />
      <form onSubmit={onSubmit}>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          type="text"
          className="input-area"
          placeholder="Command Here"
        />
      </form>
    </div>
  );
}

export default App;
