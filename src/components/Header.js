// Header.js
import React from "react";

const Header = () => {
  return (
    <header>
      <a
        href={window.location.href}
        onClick={(e) => e.preventDefault() || window.location.reload()}
      >
        AB Chatbot
      </a>
    </header>
  );
};

export default Header;
