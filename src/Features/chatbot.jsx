import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiLoader, FiCpu } from "react-icons/fi";

const chatbotStyles = {
  container: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    zIndex: 1010,
  },
  toggleButton: {
    backgroundColor: "#8c78ff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease-out, background-color 0.2s ease",
  },
  toggleButtonHover: {
    transform: "scale(1.1)",
    backgroundColor: "#7038d4",
  },
  window: {
    position: "fixed",
    bottom: "100px",
    right: "25px",
    width: "350px",
    height: "450px",
    backgroundColor: "#161827",
    borderRadius: "12px",
    boxShadow: "0 5px 25px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #374151",
    zIndex: 1009,
  },
  header: {
    backgroundColor: "#1f2937",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #374151",
  },
  headerTitle: {
    color: "#f0f0f5",
    fontWeight: "600",
    fontSize: "1rem",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#a0a3bd",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "5px",
    lineHeight: "1",
    borderRadius: "4px",
    transition: "color 0.2s ease, background-color 0.2s ease",
  },
  closeButtonHover: {
    color: "#f0f0f5",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  messagesArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "#e5e7eb",
    scrollbarWidth: "thin",
    scrollbarColor: "#4b5563 #1f2937",
  },

  messagesAreaWebkitScrollbar: {
    width: "6px",
  },
  messagesAreaWebkitScrollbarTrack: {
    background: "#1f2937",
    borderRadius: "3px",
  },
  messagesAreaWebkitScrollbarThumb: {
    background: "#4b5563",
    borderRadius: "3px",
  },
  messageBubble: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "80%",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    wordWrap: "break-word",
  },
  userMessage: {
    backgroundColor: "#8c78ff",
    color: "white",
    alignSelf: "flex-end",
    borderBottomRightRadius: "2px",
  },
  modelMessage: {
    backgroundColor: "#374151",
    color: "#e5e7eb",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "2px",
  },
  inputArea: {
    padding: "10px 15px",
    borderTop: "1px solid #374151",
    backgroundColor: "#1f2937",
  },
  inputForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  chatInput: {
    flexGrow: 1,
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #4b5563",
    backgroundColor: "#374151",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  chatInputFocus: {
    borderColor: "#8c78ff",
    boxShadow: "0 0 0 2px rgba(140, 120, 255, 0.2)",
  },
  sendButton: {
    backgroundColor: "#8c78ff",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  sendButtonHover: {
    backgroundColor: "#7038d4",
  },
  sendButtonDisabled: {
    backgroundColor: "#4b5563",
    cursor: "not-allowed",
  },
  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
  },
  errorMessage: {
    color: "#f87171",
    fontSize: "0.85rem",
    padding: "5px 15px",
    textAlign: "center",
  },
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hello! How can I help you today?" }] },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      const userMessageText = inputValue.trim();
      if (!userMessageText || isLoading) return;

      const newUserMessage = {
        role: "user",
        parts: [{ text: userMessageText }],
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      const chatHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      }));

      try {
        const response = await axios.post(
          "https://super-be.onrender.com/api/chatbot/query/",
          {
            history: chatHistory,
          }
        );
        const modelResponse = response.data.reply;
        if (modelResponse) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "model", parts: [{ text: modelResponse }] },
          ]);
        } else {
          throw new Error("Received empty response from AI.");
        }
      } catch (err) {
        console.error("Chatbot API error:", err);
        setError(
          err.message || "Sorry, something went wrong. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, messages]
  );

  const windowVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
    exit: { opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.2 } },
  };

  const toggleButtonStyle = {
    ...chatbotStyles.toggleButton,
    ...(isButtonHovered && chatbotStyles.toggleButtonHover),
  };
  const closeButtonStyle = {
    ...chatbotStyles.closeButton,
    ...(isCloseHovered && chatbotStyles.closeButtonHover),
  };
  const chatInputStyle = {
    ...chatbotStyles.chatInput,
    ...(isInputFocused && chatbotStyles.chatInputFocus),
  };
  const sendButtonStyle = {
    ...chatbotStyles.sendButton,
    ...((!inputValue || isLoading) && chatbotStyles.sendButtonDisabled),
  };

  return (
    <div style={chatbotStyles.container}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={chatbotStyles.window}
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div style={chatbotStyles.header}>
              <h3 style={chatbotStyles.headerTitle}>Chatbot</h3>
              <button
                style={closeButtonStyle}
                onClick={toggleChat}
                onMouseEnter={() => setIsCloseHovered(true)}
                onMouseLeave={() => setIsCloseHovered(false)}
                aria-label="Close chat"
              >
                <FiX />
              </button>
            </div>

            {/* Messages Area */}
            <div
              style={{
                ...chatbotStyles.messagesArea,
                "&::-webkit-scrollbar":
                  chatbotStyles.messagesAreaWebkitScrollbar,
                "&::-webkit-scrollbar-track":
                  chatbotStyles.messagesAreaWebkitScrollbarTrack,
                "&::-webkit-scrollbar-thumb":
                  chatbotStyles.messagesAreaWebkitScrollbarThumb,
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...chatbotStyles.messageBubble,
                    ...(msg.role === "user"
                      ? chatbotStyles.userMessage
                      : chatbotStyles.modelMessage),
                  }}
                >
                  {/* Simple text display, Gemini parts can be more complex */}
                  {msg.parts[0]?.text}
                </div>
              ))}
              {/* Loading indicator */}
              {isLoading && (
                <div style={chatbotStyles.loadingIndicator}>
                  <FiLoader
                    style={{ animation: "spin 1s linear infinite" }}
                    size="1.2em"
                    color="#a0a3bd"
                  />
                </div>
              )}
              {/* Error Message */}
              {error && <div style={chatbotStyles.errorMessage}>{error}</div>}
              {/* Empty div to ensure scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={chatbotStyles.inputArea}>
              <form
                style={chatbotStyles.inputForm}
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  style={chatInputStyle}
                  placeholder="Ask something..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={isLoading}
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  style={sendButtonStyle}
                  disabled={!inputValue || isLoading}
                  aria-label="Send message"
                >
                  <FiSend />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        style={toggleButtonStyle}
        onClick={toggleChat}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Show X when open, Chat icon when closed */}
        {isOpen ? <FiX size="1.5em" /> : <FiCpu />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
