import React, { useState, useEffect, useRef, useCallback } from "react";

function Mess({ sock, cur, scur }) {
  const [msg, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const userIsNearBottom = useRef(true);

  useEffect(() => {
    const handleMessage = (data) => {
      console.log("Raw message received:", data);
      if (!data || !data.sender) {
        console.warn("Received incomplete message data:", data);
        return;
      }

      const selfUsername = sock.name;
      const currentChat = cur;
      const isFromServerBroadcast = data.server === true;
      const isRelevantDM =
        !isFromServerBroadcast &&
        (data.sender === currentChat || data.sender === selfUsername);
      const isRelevantServerMsg =
        isFromServerBroadcast && currentChat === "server";

      if (isRelevantDM || isRelevantServerMsg) {
        setMessages((prevMessages) => {
          const newMessage = {
            id: `msg-${data.timestamp || Date.now()}-${Math.random()
              .toString(16)
              .slice(2, 8)}`,
            sender: data.sender,
            text: data.msg || "",
            timestamp: data.timestamp,
            imageFileId: data.imageFileId || null,
            isOutgoing: data.sender === selfUsername,
          };

          return [...prevMessages, newMessage];
        });
      } else {
      }
    };

    sock.on("message", handleMessage);
    return () => {
      sock.off("message", handleMessage);
    };
  }, [sock, cur, sock.name]);
  useEffect(() => {
    const handleloadMessage = (data) => {
      console.log("Raw load_message received:", data);
      if (!data || !Array.isArray(data.messages) || data.forUser !== cur) {
        if (data.forUser === cur) setMessages([]);
        return;
      }

      userIsNearBottom.current = true;
      const loadedMessages = data.messages.map((msgData, index) => {
        return {
          id: `hist-${cur}-${msgData.timestamp || index}-${Math.random()
            .toString(16)
            .slice(2, 8)}`,
          sender:
            msgData.sender ||
            (typeof msgData.tex === "string"
              ? msgData.tex.split(":", 1)[0]
              : "unknown"), // Fallback logic if needed
          text:
            msgData.msg ||
            (typeof msgData.tex === "string"
              ? msgData.tex.split(":").slice(1).join(":")
              : ""), // Fallback logic if needed
          timestamp: msgData.timestamp,
          imageFileId: msgData.imageFileId || null, // Expecting string ID or null
          isOutgoing:
            (msgData.sender ||
              (typeof msgData.tex === "string"
                ? msgData.tex.split(":", 1)[0]
                : "unknown")) === sock.name,
        };
      });
      setMessages(loadedMessages); // Set state ONCE
    };

    sock.on("load_message", handleloadMessage);

    if (sock && cur) {
      console.log(`Requesting pretext for: ${cur}`);
      sock.emit("pretext", { to: cur });
    }
    return () => {
      sock.off("load_message", handleloadMessage);
    };
  }, [sock, cur, sock.name]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="message-list-container" ref={messagesContainerRef}>
      {msg.length === 0 && (
        <div className="message-placeholder"> No messages yet. </div>
      )}
      {msg.map((item) => {
        const key = item.id || `fallback-${item.timestamp}-${Math.random()}`;

        const imageUrl = item.imageFileId
          ? `https://chatserver-production-1a8d.up.railway.app/image/${item.imageFileId}`
          : null;

        return (
          <div className="message" key={key}>
            <div className={item.isOutgoing ? "my_mess" : "mess"}>
              {!item.isOutgoing && (
                <div className="sender-name">{item.sender}</div>
              )}

              {imageUrl && (
                <div className="message-image-container">
                  <img
                    src={imageUrl}
                    alt="User upload"
                    className="message-image"
                  />
                </div>
              )}

              {item.text && <div className="message-text"> {item.text} </div>}

              <div className="message-timestamp">
                {" "}
                {formatTimestamp(item.timestamp)}{" "}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Mess;
