import React, { useState } from 'react';
import axios from 'axios';
import '../style/Chatbox.css'; // Ensure this matches the exact filename

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setUserMessage('');

    try {
      if (userMessage.startsWith('/product')) {
        const productName = userMessage.substring(9).trim(); // Assuming '/product' is the command
        const response = await axios.get(
          `/api/products/searchByName/${productName}`
        );
        if (response.data) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: 'bot',
              text: `Here is the product link: ${response.data.slug}`,
            },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: 'Product not found.' },
          ]);
        }
      } else {
        const response = await axios.post('/api/chat', {
          message: userMessage,
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: response.data.message },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          text: 'Error occurred while processing your request.',
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chatbox-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbox-input-container">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="chatbox-input"
        />
        <button onClick={handleSendMessage} className="chatbox-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
