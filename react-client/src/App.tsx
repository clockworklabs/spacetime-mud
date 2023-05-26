import React, { FormEvent, useState } from "react";
import "./App.css";

function App() {
  const [console, setConsole] = useState<JSX.Element[]>([]);
  const [command, setCommand] = React.useState<string>("");

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
