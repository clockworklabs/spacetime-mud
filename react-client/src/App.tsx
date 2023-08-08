import React, { FormEvent, useState, useEffect, useRef } from "react";
import "./App.css";

import { GameController } from "./GameController"; // Adjust the path if necessary

const windowConsole = console;

var gameControllerGlobal = new GameController();
function App() {
  const gameController = useRef(gameControllerGlobal);
  const consoleArea = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [console, setConsole] = useState<JSX.Element[]>([]);
  const [command, setCommand] = React.useState<string>("");
  const [commandHistory, setCommandHistory] = React.useState<string[]>([]);
  const [commandIndex, setCommandIndex] = React.useState<number>(0);

  useEffect(() => {
    gameController.current.init();
    gameController.current.setConsoleFunction(setConsole);

    // Clean up function: you can close the game controller when the component unmounts
    return () => {
      gameController.current.close();
    };
  }, []); // Empty dependency array: run this effect once on mount, and clean up on unmount

  useEffect(() => {
    if (consoleArea.current) {
      consoleArea.current.scrollTop = consoleArea.current.scrollHeight;
    }
  }, [console]);

  useEffect(() => {
    //@ts-ignore
    window["commandIndex"] = commandHistory.length - 1;

    if (inputRef.current) {
      inputRef.current.onblur = () => {
        // setCommandIndex(0);
      };

      inputRef.current.onfocus = () => {};

      // list for keydown
      inputRef.current.onkeyup = (e) => {
        if (e.key === "ArrowUp") {
          //@ts-ignore

          if (window["commandIndex"] < 0) {
            //@ts-ignore
            window["commandIndex"] = commandHistory.length - 1;
          }

          //@ts-ignore
          setCommand(commandHistory[window["commandIndex"]]);

          //@ts-ignore
          window["commandIndex"] -= 1;
        }
      };
    }
  }, [inputRef, commandHistory]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (command === "") return;

    gameController.current.on_command(command);

    setCommandHistory([...commandHistory, command]);

    setCommand("");
  };

  return (
    <div className="App">
      <div className="text-area" ref={consoleArea}>
        {console.map((line, key) => (
          <div key={key}>{line}</div>
        ))}
      </div>
      <hr />
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
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
