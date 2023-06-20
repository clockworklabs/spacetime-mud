import React, { FormEvent, useState, useEffect } from "react";
import "./App.css";

import { GameController } from './GameController'; // Adjust the path if necessary

function App() {
  const [gameController] = useState(new GameController());
  const [console, setConsole] = useState<JSX.Element[]>([]);
  const [command, setCommand] = React.useState<string>("");

  useEffect(() => {
    gameController.init();
    gameController.setConsoleFunction(setConsole);

    // Clean up function: you can close the game controller when the component unmounts
    return () => {
      gameController.close();
    };
  }, []); // Empty dependency array: run this effect once on mount, and clean up on unmount


  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (command === "") return;

    setConsole((prev) => {
      // you can also set the console with your own responses or modify the color here when adding the new html elements
      return [...prev, <p>{command}</p>];
    });

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
