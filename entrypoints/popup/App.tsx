import { useState } from "react";
import reactLogo from "@assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import { Button, TextField } from "@mui/material";

function App() {
  const [property, setProperty] = useState("");

  const startMonitoring = () => {
    browser.runtime
      .sendMessage({
        type: "startMonitoring",
        property: property,
      })
      .then(() => {
        console.log("Message sent to background script.");
      })
      .catch((err) => {
        console.error("Error sending message to background script:", err);
      });
  };

  return (
    <div className="app">
      <TextField
        required
        type="text"
        id="property"
        label="监听值"
        variant="standard"
        value={property}
        onChange={(e) => setProperty(e.target.value)}
      />
      <Button id="start" variant="text" onClick={startMonitoring}>
        Start
      </Button>
    </div>
  );
}

export default App;
