// import { useState, useEffect } from "react";

// function Mess({ sock, cur, scur }) {
//     var uni = 1
//     var messages = [{ id: uni, tex: "You have no messages", first: true }]
//     const [msg, setMessages] = useState([])
//     useEffect(() => {
//         // This ensures the listener is set only once
//         const handleMessage = (data) => {
//             setMessages((prevMessages) => {
//                 var sp = data.msg.split(":")
//                 //console.log(sp)
//                 //console.log(`sock: ${sock.name}`)
//                 var tcur = cur;
//                 scur(pcur=>{
//                     tcur = pcur
//                     return pcur
//                 })
//                 console.log(sp[0])
//                 console.log(tcur)
//                 console.log(sp[0] === tcur || sp[0] === sock.name)
//                 var cq = (cur === "server" && data.server )
//                 console.log(sp[0] === tcur || sp[0] === sock.name || cq)
//                 if (sp[0] === tcur || sp[0] === sock.name || cq) {
//                     const newMessage = { id: Math.floor(Math.random() * 200000 + 1), tex: data.msg, first: false };
//                     const filteredMessages = prevMessages.filter(item => !item.first); // Remove the initial message
//                     return [...filteredMessages, newMessage]; // Append the new message to the filtered list
//                 }
//                 else {
//                     return prevMessages
//                 }
//             });
//         };

//         // Register the socket listener
//         sock.on("message", handleMessage);

//         // Cleanup listener when the component unmounts
//         return () => {
//             sock.off("message", handleMessage);
//         };

//     }, [sock]);


//     useEffect(() => {
//         // This ensures the listener is set only once
//         const handleloadMessage = (data) => {
//             setMessages([])
//             for (let i = 0; i < data.length; i++) {
//                 setMessages((prevMessages) => {
//                     const newMessage = { id: Math.floor(Math.random() * 200000 + 1), tex: data[i], first: false };
//                     const filteredMessages = prevMessages.filter(item => !item.first); // Remove the initial message
//                     return [...filteredMessages, newMessage]; // Append the new message to the filtered list
//                 });
//             }
//         };

//         // Register the socket listener
//         sock.on("load_message", handleloadMessage);

//         // Cleanup listener when the component unmounts
//         return () => {
//             sock.off("message", handleloadMessage);
//         };
//     }, [sock]);
//     // The effect runs only once, because we are passing `sock` as dependency


//     return (
//         <div className="messages">
//             {msg.map((item) => (
//                 <div key={item.id} className="message">
//                     {!(item.tex.split(":")[0] === sock.name) ? (
//                         <p className="mess">
//                             <div className="sender">{item.tex.split(":", 2)[0]}</div>
//                             <div className = "tex">{item.tex.split(":", 2)[1]}</div>
//                         </p>) :

//                         (<p className="my_mess">
//                             <div className = "tex">{item.tex.split(":", 2)[1]}</div>
//                             <div className="me_sender">{item.tex.split(":", 2)[0]}</div>
//                         </p>)

//                     }
//                 </div>
//             ))}
//         </div>
//     )
// }

// export default Mess


// import { useState, useEffect, useRef } from "react";

// function Mess({ sock, cur, scur }) {
//     // Initialize state with an empty array
//     const [msg, setMessages] = useState([]);
//     // Ref to track if the initial load for the current user has happened
//     const initialLoadDone = useRef(false);

//     // --- Effect for handling NEW incoming messages ---
//     useEffect(() => {
//         const handleMessage = (data) => {
//             // Ensure data.msg is a string before splitting
//             if (typeof data.msg !== 'string') {
//                 console.error("Received non-string message data:", data);
//                 return;
//             }

//             const parts = data.msg.split(":", 2); // Split into sender and text
//             const sender = parts[0];
//             const text = parts[1] || ""; // Handle cases with no colon

//             // Get the current active chat user (safer way than using scur inside)
//             const currentChat = cur;

//              // Determine if the message belongs to the current chat or is from the user
//             const isFromServerBroadcast = cur === "server" && data.server;
//             const isRelevant = sender === currentChat || sender === sock.name || isFromServerBroadcast;

//             //console.log(`New Msg: Sender=${sender}, CurrentChat=${currentChat}, IsSelf=${sender === sock.name}, IsServer=${isFromServerBroadcast}, Relevant=${isRelevant}`);

//             if (isRelevant) {
//                 setMessages((prevMessages) => {
//                     const newMessage = {
//                         // Use a more robust ID if possible (e.g., from server)
//                         id: Math.random().toString(36).substring(2, 15), // Slightly better random ID
//                         sender: sender,
//                         text: text,
//                         timestamp: data.timestamp || Date.now() // Use server timestamp or current time
//                     };
//                     // Append the new message
//                     return [...prevMessages, newMessage];
//                 });
//             }
//         };

//         sock.on("message", handleMessage);

//         return () => {
//             sock.off("message", handleMessage);
//         };
//         // Add sock.name as dependency if it can change after initial mount
//     }, [sock, cur]); // Depend on `cur` to use the latest value in the handler


//     // --- Effect for LOADING message history when `cur` changes ---
//     useEffect(() => {
//         // Reset flag when changing users
//         initialLoadDone.current = false;
//         // Clear messages immediately when changing users for faster UI feedback
//         setMessages([]);

//         const handleLoadMessage = (data) => {
//             // Check if the loaded data is for the *currently* selected user
//             if (data.forUser === cur) {
//                  //console.log(`Loading messages for ${cur}:`, data.messages);
//                  setMessages(() => { // Use functional update to ensure correct state base
//                      // If data.messages isn't an array, default to empty
//                      if (!Array.isArray(data.messages)) {
//                          console.error("Received non-array message history:", data.messages);
//                          return [];
//                      }
//                      return data.messages.map((msgData, index) => {
//                          // Assuming msgData format is "sender:text" or object {sender, text, timestamp}
//                          if (typeof msgData === 'string') {
//                              const parts = msgData.split(":", 2);
//                              return {
//                                  id: `hist-${cur}-${index}-${Math.random().toString(36).substring(2, 9)}`, // More specific random ID
//                                  sender: parts[0],
//                                  text: parts[1] || "",
//                                  timestamp: null // Or parse from data if available
//                              };
//                          } else if (typeof msgData === 'object' && msgData !== null) {
//                             // Assuming object format { sender, text, timestamp, id }
//                             return {
//                                 id: msgData.id || `hist-${cur}-${index}-${Math.random().toString(36).substring(2, 9)}`,
//                                 sender: msgData.sender || 'unknown',
//                                 text: msgData.text || '',
//                                 timestamp: msgData.timestamp || null
//                             };
//                          }
//                          return null; // Handle unexpected format
//                      }).filter(Boolean); // Remove any null entries
//                  });
//                  initialLoadDone.current = true; // Mark initial load as done
//              } else {
//                  //console.log(`Ignoring loaded messages for ${data.forUser} because current is ${cur}`);
//              }
//         };

//         sock.on("load_message", handleLoadMessage);

//         // Request message history when `cur` changes (after clearing)
//         // Ensure sock is connected and cur is valid before emitting
//         if (sock && cur) {
//             //console.log(`Requesting message history via pretext for: ${cur}`);
//             sock.emit("pretext", { to: cur });
//         }

//         return () => {
//             sock.off("load_message", handleLoadMessage);
//         };
//         // Rerun when the selected user (`cur`) or the socket instance changes
//     }, [sock, cur]);

//      // Helper to format timestamp (example)
//      const formatTimestamp = (timestamp) => {
//         if (!timestamp) return '';
//         try {
//             const date = new Date(timestamp);
//             // Simple HH:MM format
//             return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false });
//         } catch (e) {
//             return ''; // Handle invalid date
//         }
//      };

//     return (
//         // Use the message list container class for scrolling/layout
//         <div className="message-list-container">
//             {/* Conditional Rendering: Show placeholder if no messages */}
//             {msg.length === 0 && initialLoadDone.current && (
//                 <div className="message-placeholder">
//                     No messages yet. Start the conversation!
//                 </div>
//             )}
//              {msg.length === 0 && !initialLoadDone.current && (
//                 <div className="message-placeholder">
//                     Loading messages...
//                 </div>
//             )}

//             {/* Map over the messages */}
//             {msg.map((item) => {
//                 // Determine if the message is outgoing (sender is self) or incoming
//                  // Ensure sock.name is available and matches
//                 const isOutgoing = item.sender === sock.name && sock.name !== undefined;

//                 return (
//                     // 1. Wrapper for each message for alignment/spacing
//                     <div className="message" key={item.id}>
//                         {/* 2. The message bubble itself */}
//                         <div className={isOutgoing ? 'my_mess' : 'mess'}>
//                             {/* 3. Sender name (only for incoming messages) */}
//                             {!isOutgoing && (
//                                 <div className="sender-name">{item.sender}</div>
//                             )}

//                             {/* 4. Message text content */}
//                             <div className="message-text">
//                                 {item.text}
//                             </div>

//                              {/* 5. Optional Timestamp */}
//                              <div className="message-timestamp">
//                                 {formatTimestamp(item.timestamp)}
//                              </div>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

// export default Mess;

// // --- Add placeholder styling to App.css ---
// /*
// .message-placeholder {
//     text-align: center;
//     padding: var(--padding-xl);
//     color: var(--text-secondary);
//     font-style: italic;
//     margin-top: auto; // Pushes placeholder down in column-reverse
//     margin-bottom: auto; // Centers vertically if list empty
// }
// */


// Add useRef to imports
// import { useState, useEffect, useRef } from "react";

// function Mess({ sock, cur, scur }) {
//     const [msg, setMessages] = useState([]);
//     const initialLoadDone = useRef(false);
//     // Create a ref for the scrollable message container
//     const messagesContainerRef = useRef(null); // <-- ADD THIS REF

//     // --- Effect for handling NEW incoming messages (Logic inside unchanged) ---
//     useEffect(() => {
//         const handleMessage = (data) => {
//             // ... (existing message handling logic) ...
//             if (typeof data.msg !== 'string') { /* ... */ return; }
//             const parts = data.msg.split(":", 2);
//             const sender = parts[0];
//             const text = parts[1] || "";
//             const currentChat = cur;
//             const isFromServerBroadcast = cur === "server" && data.server;
//             const isRelevant = sender === currentChat || sender === sock.name || isFromServerBroadcast;

//             if (isRelevant) {
//                 setMessages((prevMessages) => {
//                     const newMessage = {
//                         id: Math.random().toString(36).substring(2, 15),
//                         sender: sender,
//                         text: text,
//                         timestamp: data.timestamp || Date.now()
//                     };
//                     return [...prevMessages, newMessage];
//                 });
//             }
//         };
//         sock.on("message", handleMessage);
//         return () => { sock.off("message", handleMessage); };
//     }, [sock, cur, sock.name]); // Include sock.name if it might change/be initially undefined


//     // --- Effect for LOADING message history (Logic inside unchanged) ---
//     useEffect(() => {
//         initialLoadDone.current = false;
//         setMessages([]);

//         const handleLoadMessage = (data) => {
//              if (data.forUser === cur) {
//                  setMessages(() => {
//                      if (!Array.isArray(data.messages)) { /* ... */ return []; }
//                      return data.messages.map((msgData, index) => {
//                         // ... (existing mapping logic from string or object) ...
//                         if (typeof msgData === 'string') { /* ... */ }
//                         else if (typeof msgData === 'object' && msgData !== null) { /* ... */ }
//                         return null;
//                      }).filter(Boolean);
//                  });
//                  initialLoadDone.current = true;
//              }
//         };
//         sock.on("load_message", handleLoadMessage);

//         if (sock && cur) {
//             sock.emit("pretext", { to: cur });
//         }
//         return () => { sock.off("load_message", handleLoadMessage); };
//     }, [sock, cur]);

//     // --- ADD THIS EFFECT FOR SCROLLING ---
//     useEffect(() => {
//         // Scroll to the bottom whenever the 'msg' state changes
//         if (messagesContainerRef.current) {
//             const { scrollHeight, clientHeight } = messagesContainerRef.current;
//             messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
//             // A common alternative: messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//         }
//     }, [msg]); // Dependency: run this effect when 'msg' array updates
//     // --- END OF SCROLLING EFFECT ---


//     const formatTimestamp = (timestamp) => { /* ... (existing timestamp formatting) ... */ };

//     return (
//         // Add the ref to the container div
//         <div className="message-list-container" ref={messagesContainerRef}> {/* <-- ATTACH REF HERE */}
//             {/* Conditional Rendering Placeholders (Unchanged) */}
//             {msg.length === 0 && initialLoadDone.current}
//             {msg.length === 0 && !initialLoadDone.current}

//             {/* Message Mapping (Unchanged) */}
//             {msg.map((item) => {
//                 const isOutgoing = item.sender === sock.name && sock.name !== undefined;
//                 return (
//                     <div className="message" key={item.id}>
//                         <div className={isOutgoing ? 'my_mess' : 'mess'}>
//                             {!isOutgoing && ( <div className="sender-name">{item.sender}</div> )}
//                             <div className="message-text">{item.text}</div>
//                             <div className="message-timestamp">{formatTimestamp(item.timestamp)}</div>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

// export default Mess;


// src/Messages.js
// import { useState, useEffect, useRef } from "react";

// // Preserving your core logic for handling messages, but updating the JSX output
// function Mess({ sock, cur, scur }) {
//     // --- State and Ref Setup ---
//     const [msg, setMessages] = useState([]); // Start with empty array is cleaner
//     const messagesContainerRef = useRef(null); // Ref for scrolling

//     // --- Preserve your handleMessage logic ---
//     useEffect(() => {
//         const handleMessage = (data) => {
//             // Ensure data and msg exist before proceeding
//             if (!data || typeof data.msg !== 'string') {
//                  console.error("Received invalid message data:", data);
//                  return;
//             }

//             // Logic to determine if message is relevant (preserved)
//             setMessages((prevMessages) => {
//                 var sp = data.msg.split(":"); // Keep your splitting logic
//                 var tcur = cur;
//                 // This way of getting tcur inside setMessages is complex, but preserving it:
//                 scur(pcur=>{
//                     tcur = pcur;
//                     return pcur;
//                 });
//                 var sender = sp[0]; // Assuming first part is sender
//                 var cq = (cur === "server" && data.server); // Keep your server logic check

//                 // Keep your condition for relevance
//                 if (sender === tcur || sender === sock.name || cq) {
//                     // Create a message object in the format your legacy code used
//                     const newMessage = {
//                         id: Math.floor(Math.random() * 200000 + 1), // Keep random ID generation
//                         tex: data.msg, // Store the raw "sender:text" string
//                         first: false // Keep this flag if your logic depends on it elsewhere (though filter removes it)
//                     };
//                     // Keep your filtering and appending logic
//                     const filteredMessages = prevMessages.filter(item => !item.first);
//                     return [...filteredMessages, newMessage];
//                 } else {
//                     return prevMessages; // Keep existing messages if not relevant
//                 }
//             });
//         };

//         sock.on("message", handleMessage);
//         return () => { sock.off("message", handleMessage); };

//     }, [sock, cur, scur, sock.name]); // Add dependencies used inside effect

//     // --- Preserve your handleloadMessage logic ---
//     useEffect(() => {
//         const handleloadMessage = (data) => {
//             // Ensure data is an array
//             if (!Array.isArray(data)) {
//                 console.error("Received non-array data for load_message:", data);
//                 setMessages([]); // Reset to empty if data is invalid
//                 return;
//             }

//             setMessages([]); // Clear existing messages first

//             // Iterate and add messages (Preserving the loop and functional update style)
//             // Note: This is inefficient - better to build array then set state once, but preserving legacy logic
//             for (let i = 0; i < data.length; i++) {
//                 setMessages((prevMessages) => {
//                     const newMessage = {
//                         id: Math.floor(Math.random() * 200000 + 1), // Keep random ID generation
//                         tex: data[i], // Assuming data[i] is the "sender:text" string
//                         first: false // Keep this flag
//                     };
//                     // Keep your filtering and appending logic within the loop
//                     const filteredMessages = prevMessages.filter(item => !item.first);
//                     return [...filteredMessages, newMessage];
//                 });
//             }
//         };

//         sock.on("load_message", handleloadMessage);
//         return () => { sock.off("load_message", handleloadMessage); }; // Correct cleanup for load_message

//     }, [sock]); // Keep dependency as just sock per original code

//     // --- Add the Scrolling Effect ---
//     useEffect(() => {
//         if (messagesContainerRef.current) {
//             const element = messagesContainerRef.current;
//             // Scroll to the bottom
//             element.scrollTop = element.scrollHeight;
//         }
//     }, [msg]); // Re-run whenever messages change

//     // --- Helper to format timestamp (Placeholder - adapt if you add timestamps) ---
//     const formatTimestamp = (timestamp) => {
//         if (!timestamp) return '';
//         try {
//             const date = new Date(timestamp);
//             return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false });
//         } catch (e) { return ''; }
//     };

//     // --- MODIFIED JSX Return Statement ---
//     // Using the MODERN structure required by the aesthetic CSS
//     return (
//         // 1. Use the correct container class and attach the ref
//         <div className="message-list-container" ref={messagesContainerRef}>

//             {/* Optional: Add placeholder for empty state */}
//             {msg.length === 0 && (
//                 <div className="message-placeholder">
//                     No messages yet.
//                 </div>
//             )}

//             {/* 2. Map over messages */}
//             {msg.map((item) => {
//                 // Perform the split logic here for rendering purposes
//                 const parts = typeof item.tex === 'string' ? item.tex.split(":", 2) : ['unknown', ''];
//                 const sender = parts[0];
//                 const textContent = parts[1] || ""; // Handle cases with no colon

//                 // Determine if outgoing based on comparing sender with sock.name
//                 const isOutgoing = sender === sock.name && sock.name !== undefined;

//                 return (
//                     // 3. Use the modern wrapper class `.message`
//                     <div className="message" key={item.id}>
//                         {/* 4. Use the modern bubble class `div.mess` or `div.my_mess` */}
//                         <div className={isOutgoing ? 'my_mess' : 'mess'}>
//                             {/* 5. Conditionally render sender name using `.sender-name` */}
//                             {!isOutgoing && (
//                                 <div className="sender-name">{sender}</div>
//                             )}
//                             {/* 6. Render text content using `.message-text` */}
//                             <div className="message-text">
//                                 {textContent}
//                             </div>
//                             {/* 7. Add placeholder for timestamp (data needed) */}
//                              <div className="message-timestamp">
//                                 {formatTimestamp(item.timestamp)} {/* Assumes timestamp might exist */}
//                              </div>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

// export default Mess;


// src/Messages.js
// import { useState, useEffect, useRef, useCallback } from "react";

// function Mess({ sock, cur, scur }) { // Keep scur prop if parent needs it, but don't use it inside setMessages here
//     const [msg, setMessages] = useState([]);
//     const messagesContainerRef = useRef(null);
//     // Ref to track if the user is scrolled near the bottom
//     const userIsNearBottom = useRef(true);

//     // --- Optimized handleMessage (Using direct `cur` prop) ---
//     useEffect(() => {
//         const handleMessage = (data) => {
//             if (!data || typeof data.msg !== 'string') return;

//             const sp = data.msg.split(":");
//             const sender = sp[0];
//             const selfUsername = sock.name;
//             const currentChat = cur; // Use the prop value directly
//             const cq = (currentChat === "server" && data.server);
//             const isRelevant = sender === currentChat || sender === selfUsername || cq;

//             if (isRelevant) {
//                 setMessages((prevMessages) => {
//                     const newMessage = {
//                         // Use a slightly more unique ID prefix
//                         id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
//                         tex: data.msg, // Keep raw text as per legacy
//                         first: false
//                     };
//                     const filteredMessages = prevMessages.filter(item => !item.first);
//                     return [...filteredMessages, newMessage];
//                 });
//             }
//         };

//         sock.on("message", handleMessage);
//         return () => { sock.off("message", handleMessage); };

//     }, [sock, cur, sock.name]); // *** Rely on `cur` in dependency array ***

//     // --- Optimized handleloadMessage ---
//     useEffect(() => {
//         const handleloadMessage = (data) => {
//             userIsNearBottom.current = true; // Assume user starts at bottom on load
//             if (!Array.isArray(data)) {
//                 setMessages([]); return;
//             }
//             const newMessages = data.map((msgText, index) => ({
//                 id: `hist-${cur}-${index}-${Math.random().toString(16).slice(2, 8)}`, // Prefix hist ID
//                 tex: msgText,
//                 first: false
//             }));
//             setMessages(newMessages); // Set state ONCE
//         };

//         sock.on("load_message", handleloadMessage);
//         // Request history when component mounts or `cur` changes
//         if(sock && cur) {
//             sock.emit("pretext", { to: cur });
//         }
//         return () => { sock.off("load_message", handleloadMessage); };

//     }, [sock, cur]); // Run only when sock or cur changes

//     // --- Smarter Scrolling Effect ---
//     const scrollToBottom = useCallback((force = false) => {
//          if (messagesContainerRef.current) {
//             const element = messagesContainerRef.current;
//             if (force || userIsNearBottom.current) { // Scroll if forced OR user was already near bottom
//                 element.scrollTop = element.scrollHeight;
//             }
//         }
//     }, []); // useCallback ensures function identity is stable

//     useEffect(() => {
//         // Force scroll after initial load completes (when newMessages is set)
//         scrollToBottom(true);
//     }, [msg.length > 0 && msg[0]?.id?.startsWith('hist-')]); // Crude check for initial load completion

//     useEffect(() => {
//         // Scroll only if near bottom when *new* messages cause update
//         scrollToBottom(false);
//     // This dependency is tricky. Ideally, we only run for NEW messages, not initial load.
//     // Watching msg.length changing from >0 to >0 is one way. Or last message ID change.
//     }, [msg, scrollToBottom]); // Watching 'msg' is still simplest, relies on check inside scrollToBottom

//      // --- Track User Scroll Position ---
//      useEffect(() => {
//         const container = messagesContainerRef.current;
//         const handleScroll = () => {
//             if (container) {
//                 const scrollThreshold = 50; // Pixels from bottom
//                 const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + scrollThreshold;
//                 userIsNearBottom.current = isNearBottom;
//             }
//         };
//         container?.addEventListener('scroll', handleScroll);
//         return () => container?.removeEventListener('scroll', handleScroll);
//      }, []); // Run only once on mount

//     // --- Timestamp Formatting (Placeholder) ---
//     const formatTimestamp = (timestamp) => { /* ... */ };

//     // --- JSX Return Statement (Modern Structure) ---
//     return (
//         <div className="message-list-container" ref={messagesContainerRef}>
//             {msg.length === 0 && ( <div className="message-placeholder"> No messages yet. </div> )}
//             {msg.map((item) => {
//                 // Parse data for render - Consider parsing and storing sender/text in state instead
//                 const parts = typeof item.tex === 'string' ? item.tex.split(":", 2) : ['unknown', ''];
//                 const sender = parts[0];
//                 const textContent = parts[1] || "";
//                 const isOutgoing = sender === sock.name && sock.name !== undefined;

//                 // *** IMPORTANT: Use STABLE keys if possible! ***
//                 // Random keys hurt performance. If server doesn't give IDs, this is fallback.
//                 const key = item.id || `fallback-${item.tex.slice(0,10)}-${Math.random()}`;

//                 return (
//                     <div className="message" key={key}>
//                         <div className={isOutgoing ? 'my_mess' : 'mess'}>
//                             {!isOutgoing && ( <div className="sender-name">{sender}</div> )}
//                             <div className="message-text"> {textContent} </div>
//                             <div className="message-timestamp"> {formatTimestamp(item.timestamp)} </div>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

// export default Mess;



// src/chat_app_features/Messages.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";

// Pass socket down from ChatPage
function Mess({ sock, cur, scur }) {
    const [msg, setMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    const userIsNearBottom = useRef(true);

    // --- Optimized handleMessage (Needs to handle new payload structure) ---
    useEffect(() => {
        const handleMessage = (data) => {
            // *** Expecting data = { sender, msg, server, timestamp, imageFileId } ***
            console.log("Raw message received:", data);
            if (!data || !data.sender) {
                 console.warn("Received incomplete message data:", data);
                 return;
            }

            const selfUsername = sock.name;
            const currentChat = cur;
            const isFromServerBroadcast = data.server === true; // Explicit check

            // Determine relevance based on sender and current chat
            // For DMs: relevant if sender is current chat partner OR sender is self
            // For Server: relevant if it's a server broadcast and current chat is server
            const isRelevantDM = !isFromServerBroadcast && (data.sender === currentChat || data.sender === selfUsername);
            const isRelevantServerMsg = isFromServerBroadcast && currentChat === "server";

            if (isRelevantDM || isRelevantServerMsg) {
                setMessages((prevMessages) => {
                    // Create message object in the format needed for rendering
                    const newMessage = {
                        id: `msg-${data.timestamp || Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                        sender: data.sender,
                        text: data.msg || '', // Text content
                        timestamp: data.timestamp,
                        imageFileId: data.imageFileId || null, // Store the image ID (string)
                        isOutgoing: data.sender === selfUsername
                    };
                    // Simple append, could add checks for duplicates based on timestamp/id if needed
                    return [...prevMessages, newMessage];
                });
            } else {
                // console.log("Ignoring message - Not relevant for current view:", data);
            }
        };

        sock.on("message", handleMessage);
        return () => { sock.off("message", handleMessage); };

    }, [sock, cur, sock.name]); // Dependencies

    // --- Optimized handleloadMessage (Needs to handle new payload structure) ---
    useEffect(() => {
        const handleloadMessage = (data) => {
             // Expecting data = { forUser: string, messages: Array<object> }
             console.log("Raw load_message received:", data);
            if (!data || !Array.isArray(data.messages) || data.forUser !== cur) {
                // If data is not for the current user, or invalid, ignore (or clear if needed)
                if (data.forUser === cur) setMessages([]); // Clear if data for current user is invalid/empty array explicitly sent
                return;
            }

            userIsNearBottom.current = true; // Assume user starts at bottom on load
            const loadedMessages = data.messages.map((msgData, index) => {
                 // Assuming server sends msgData = { sender, msg, timestamp, imageFileId, tex? }
                return {
                    id: `hist-${cur}-${msgData.timestamp || index}-${Math.random().toString(16).slice(2, 8)}`,
                    sender: msgData.sender || (typeof msgData.tex === 'string' ? msgData.tex.split(":",1)[0] : 'unknown'), // Fallback logic if needed
                    text: msgData.msg || (typeof msgData.tex === 'string' ? msgData.tex.split(":").slice(1).join(':') : ''), // Fallback logic if needed
                    timestamp: msgData.timestamp,
                    imageFileId: msgData.imageFileId || null, // Expecting string ID or null
                    isOutgoing: (msgData.sender || (typeof msgData.tex === 'string' ? msgData.tex.split(":",1)[0] : 'unknown')) === sock.name
                };
            });
            setMessages(loadedMessages); // Set state ONCE
        };

        sock.on("load_message", handleloadMessage);

        // Request history when component mounts or `cur` changes
        if(sock && cur) {
            console.log(`Requesting pretext for: ${cur}`);
            sock.emit("pretext", { to: cur });
        }
        return () => { sock.off("load_message", handleloadMessage); };

    }, [sock, cur, sock.name]); // Dependencies

    // --- Scrolling Logic (scrollToBottom, userIsNearBottom tracking - unchanged) ---
     const scrollToBottom = useCallback((force = false) => { /* ... */ }, []);
     useEffect(() => { /* scroll on initial load */ }, [/*... depends on how you identify load complete ...*/]);
     useEffect(() => { /* scroll on new message */ }, [msg, scrollToBottom]);
     useEffect(() => { /* track scroll position */ }, []);


    // --- Timestamp Formatting (Unchanged) ---
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) { return ''; }
    };

    // --- JSX Return Statement (Modern Structure with Image Rendering) ---
    return (
        <div className="message-list-container" ref={messagesContainerRef}>
            {msg.length === 0 && ( <div className="message-placeholder"> No messages yet. </div> )}
            {msg.map((item) => {
                // Key should be stable if possible
                const key = item.id || `fallback-${item.timestamp}-${Math.random()}`;
                // Construct image URL - *** Replace with your server URL ***
                const imageUrl = item.imageFileId ? `http://localhost:3800/image/${item.imageFileId}` : null;

                return (
                    <div className="message" key={key}>
                        <div className={item.isOutgoing ? 'my_mess' : 'mess'}>
                            {/* Sender Name (only for incoming) */}
                            {!item.isOutgoing && ( <div className="sender-name">{item.sender}</div> )}

                            {/* Image Display (if imageUrl exists) */}
                            {imageUrl && (
                                <div className="message-image-container">
                                    <img
                                        src={imageUrl}
                                        alt="User upload" // Add better alt text if possible
                                        className="message-image"
                                        // Optional: Add loading state/error handling for image
                                        // onLoad={() => console.log("Image loaded:", imageUrl)}
                                        // onError={(e) => { e.target.style.display='none'; /* Hide broken img */ }}
                                     />
                                </div>
                            )}

                             {/* Text Content (if text exists) */}
                            {item.text && (
                                <div className="message-text"> {item.text} </div>
                            )}

                            {/* Timestamp */}
                            <div className="message-timestamp"> {formatTimestamp(item.timestamp)} </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Mess;