// ChatContainer.js
import React, { useEffect, useRef } from "react";

const ChatContainer = ({ messages }) => {
  const chatContainerRef = useRef();

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender}`}>
          {message.isLoading ? (
            <div className="loading-container">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          ) : (
            <p>{message.text}</p>
          )}
        </div>
      ))}
      <div ref={chatContainerRef} />
    </div>
  );
};

export default ChatContainer;
