// ChatContainer.js
import React, { useEffect, useRef } from 'react';
import ReactMarkDown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatContainer = ({ messages }) => {
  const chatContainerRef = useRef();

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className='chat-container'>
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender}`}>
          {message.isLoading ? (
            <div className='loading-container'>
              <div className='loading-dot' />
              <div className='loading-dot' />
              <div className='loading-dot' />
            </div>
          ) : message.sender === 'user' ? (
            <p>{message.text}</p>
          ) : (
            <div>
              <ReactMarkDown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkDown>
            </div>
          )}
        </div>
      ))}
      <div ref={chatContainerRef} />
    </div>
  );
};

export default ChatContainer;
