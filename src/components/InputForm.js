// InputForm.js
import React from "react";

const InputForm = ({ onSubmit, onChange, value }) => {
  return (
    <form className="input-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Type your message..."
        value={value}
        onChange={onChange}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default InputForm;
