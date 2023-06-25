import './App.css';
// App.js

import React, { useState, useEffect } from "react";
import Header from "/workspaces/codespaces-react/src/components/Header.js";
import ChatContainer from "./components/ChatContainer";
import InputForm from "./components/InputForm";
import fetchBotReply from "/workspaces/codespaces-react/src/components/fetchBotReply.js";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "chatgpt", text: "Loading...", isLoading: true }
      ]);
    } else {
      setMessages((prevMessages) =>
        prevMessages.filter((message) => !message.isLoading)
      );
    }
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = userInput.trim();

    if (message.length > 0) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: message }
      ]);
      setUserInput("");

      // Generate and add ChatGPT-like response here
      setIsLoading(true);
      try {
        const chatGptResponse = await fetchBotReply(userInput);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "chatgpt", text: chatGptResponse }
        ]);
      } catch (error) {
        console.error("Error fetching bot reply:", error.message);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "chatgpt",
            text: "Sorry, there was an error generating a response."
          }
        ]);
      }
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div>
      <Header />
      <ChatContainer messages={messages} />
      <InputForm
        onSubmit={handleSubmit}
        onChange={handleChange}
        value={userInput}
      />
    </div>
  );
};

export default App;

