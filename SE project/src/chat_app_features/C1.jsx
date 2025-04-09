// // import { useState, useEffect } from "react";

// // function C1({ sock, use, set }) {
// //     const [name, set_name] = useState(""); // Default empty string
// //     const [show, set_show] = useState(false);
// //     const [msg, set_msg] = useState(""); // Default empty string
// //     const [pwd, set_pwd] = useState(""); // Default empty string
// //     const [err, set_err] = useState("");

// //     // Handling the first form submission
// //     function handle1(e) {
// //         set_err("")
// //         e.preventDefault();
// //         var ch = false
// //         var ch1 = false
// //         if ((name || "") === "") {
// //             console.log(name)
// //             ch = true
// //             console.log(`ch ${ch}`)
// //             set_err("name cannot be empty!")
// //         }

// //         if ((pwd || "") === "") {
// //             ch1 = true
// //             console.log(`ch ${ch1}`)
// //             console.log(`ch1 ${ch1}`)
// //             set_err(olerr=> {
// //                 if (olerr !== "")
// //                 {
// //                     return "password and name can not be left empty"
// //                 }
// //                 else{
// //                     return "password can not be left empty"
// //                 }
// //             })
// //         }
// //         set_name(prev_name => {
// //             console.log(`pp ${prev_name}`)
// //             if ((prev_name || "") === "") {
// //                 console.log(prev_name)
// //                 ch = true
// //                 console.log(`ch ${ch}`)
// //             }
// //             return prev_name
// //         })

// //         set_pwd(prev_pwd => {
// //             console.log(`pp ${prev_pwd}`)
// //             if ((prev_pwd || "") === "") {
// //                 ch1 = true
// //                 console.log(`ch ${ch1}`)
// //                 console.log(`ch1 ${ch1}`)
// //             }
// //             return prev_pwd
// //         })
// //         console.log(ch)
// //         console.log(ch1)
// //         if (ch || ch1) {
// //             return
// //         }

// //         set_show(true);
// //         sock.emit("con", { nam: name, password: pwd });
// //         //sock.name = e.target.value
// //     }

// //     // Handling the second form submission (message send)
// //     function handle2(e) {
// //         e.preventDefault();
// //         var too;
// //         for (let i = 0; i < use.length; i++) {
// //             if (use[i].ch) {
// //                 too = use[i].username
// //                 break;
// //             }
// //         }
// //         sock.emit("message", { msg: msg, to: too });
// //         set_msg("")
// //     }

// //     // Setting up the socket event listener and cleanup
// //     useEffect(() => {
// //         const handleDone = (data) => {
// //             var name;
// //             for (let i = 0; i < use.length; i++) {
// //                 if (use.ch) {
// //                     name = use.username
// //                     break
// //                 }
// //             }
// //             sock.emit("pretext", { to: "server" });
// //         };

// //         // Register the listener
// //         sock.on("done", handleDone);

// //         // Cleanup listener when component unmounts
// //         return () => {
// //             sock.off("done", handleDone);
// //         };
// //     }, [sock]);

// //     // Debugging logs to check values of name, pwd, msg
// //     useEffect(() => {
// //         //console.log("name:", name);
// //         //console.log("pwd:", pwd);
// //         //console.log("msg:", msg);
// //     }, [name, pwd, msg]);

// //     return !show ? (
// //         <form onSubmit={handle1} className="signin">
// //             <input
// //                 type="text"
// //                 value={name || ""} // Ensure it's always a string, even if undefined or null
// //                 onChange={(e) => set_name(e.target.value || "")} // Ensure value is always a string
// //                 placeholder="name"
// //             />
// //             <input
// //                 type="text"
// //                 value={pwd || ""} // Ensure it's always a string, even if undefined or null
// //                 onChange={(e) => set_pwd(e.target.value || "")} // Ensure value is always a string
// //                 placeholder="password"
// //             />
// //             <input type="submit" />
// //             {err !== "" ? (<p>{err}</p>): <></>}
// //         </form>
// //     ) : (
// //         <form onSubmit={handle2} className="enter">
// //             <input
// //                 type="text"
// //                 value={msg || ""} // Ensure it's always a string, even if undefined or null
// //                 onChange={(e) => set_msg(e.target.value || "")} // Ensure value is always a string
// //                 placeholder="message"
// //                 style={{ minWidth: "300px", borderRadius: "10px", padding: "5px" }}
// //             />
// //             <input type="submit" style={{ width: "80px", margin: "15px" }} />
// //         </form>
// //     )
// // }

// // export default C1;



// import { useState, useEffect } from "react";

// // No changes to the logic, only to the JSX output for styling.
// function C1({ sock, use, set }) {
//     const [name, set_name] = useState("");
//     const [show, set_show] = useState(false);
//     const [msg, set_msg] = useState("");
//     const [pwd, set_pwd] = useState("");
//     const [err, set_err] = useState("");

//     // --- Login Form Submission Logic (Unchanged) ---
//     function handle1(e) {
//         set_err("")
//         e.preventDefault();
//         var ch = false
//         var ch1 = false
//         // Validation logic remains exactly the same...
//         if ((name || "") === "") {
//             ch = true
//             set_err("name cannot be empty!")
//         }

//         if ((pwd || "") === "") {
//             ch1 = true
//              set_err(olerr=> {
//                 if (olerr !== "")
//                 {
//                     return "password and name can not be left empty"
//                 }
//                 else{
//                     return "password can not be left empty"
//                 }
//             })
//         }
//          // Conditional logic remains the same
//         if (ch || ch1) {
//             return
//         }

//         set_show(true);
//         sock.emit("con", { nam: name, password: pwd });
//     }

//     // --- Message Sending Logic (Unchanged) ---
//     function handle2(e) {
//         e.preventDefault();
//         if ((msg || "").trim() === "") { // Prevent sending empty messages
//             return;
//         }
//         let too = "server"; // Default to server if no user selected
//         for (let i = 0; i < use.length; i++) {
//             if (use[i].ch) {
//                 too = use[i].username;
//                 break;
//             }
//         }
//         sock.emit("message", { msg: msg, to: too });
//         set_msg(""); // Clear message input after sending
//     }

//     // --- Socket Event Listener Logic (Unchanged) ---
//     useEffect(() => {
//         const handleDone = (data) => {
//             // Logic inside handleDone remains the same...
//             // Find the initially selected user (usually 'server') after login confirmation
//              let selectedUser = use.find(user => user.ch);
//              if (selectedUser) {
//                  sock.emit("pretext", { to: selectedUser.username });
//              } else {
//                  // Fallback if somehow no user is selected (e.g., emit for 'server')
//                  sock.emit("pretext", { to: "server" });
//              }
//         };

//         sock.on("done", handleDone);

//         return () => {
//             sock.off("done", handleDone);
//         };
//         // Dependencies updated to include `use` array if selection logic depends on it
//     }, [sock, use]);

//     // --- Component Rendering ---
//     return !show ? (
//         // --- Login Form ---
//         // Kept className="signin" for potential specific future styling
//         // Structure remains input-input-submit
//         <div className="signin-container"> {/* Optional: Add a wrapper for better centering/styling */}
//             <form onSubmit={handle1} className="signin">
//                  <h2>Sign In</h2> {/* Added a title */}
//                  <input
//                     type="text"
//                     value={name || ""}
//                     onChange={(e) => set_name(e.target.value || "")}
//                     placeholder="Username" // Changed placeholder
//                     aria-label="Username"
//                 />
//                 <input
//                     // Changed type to password for masking
//                     type="password"
//                     value={pwd || ""}
//                     onChange={(e) => set_pwd(e.target.value || "")}
//                     placeholder="Password" // Changed placeholder
//                     aria-label="Password"
//                 />
//                 {/* Standard submit button for login */}
//                 <button type="submit" className="login-button">Sign In</button>
//                 {/* Error message display */}
//                 {err !== "" ? (<p className="error-message">{err}</p>): null}
//             </form>
//         </div>

//     ) : (
//         // --- Chat Input Form ---
//         // Uses className="forms" to match the main CSS
//         <form onSubmit={handle2} className="forms">
//             <input
//                 type="text"
//                 value={msg || ""}
//                 onChange={(e) => set_msg(e.target.value || "")}
//                 placeholder="Type a message..." // Standard placeholder
//                 aria-label="Message Input"
//                 // Removed inline styles - handled by .forms input CSS
//             />
//             {/* Replaced input type="submit" with styled button + SVG */}
//             <button
//                 type="submit"
//                 className="send-button"
//                 aria-label="Send Message" // Accessibility label
//                 disabled={(msg || "").trim() === ""} // Disable if message is empty
//             >
//                 {/* SVG Send Icon - The CSS styles this */}
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
//                    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
//                 </svg>
//             </button>
//         </form>
//     );
// }

// export default C1;

// Remove internal 'show' state, accept isLoggedIn and onLoginSuccess props

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { useState, useEffect } from "react";

// // Adjust props destructuring
// function C1({ sock, use, isLoggedIn, onLoginSuccess }) {
//     // Remove internal show state:
//     // const [show, set_show] = useState(false);
//     const [name, set_name] = useState("");
//     const [msg, set_msg] = useState("");
//     const [pwd, set_pwd] = useState("");
//     const [err, set_err] = useState("");

//     // --- Login Form Submission Logic ---
//     function handle1(e) {
//         e.preventDefault();
//         set_err("");
//         let hasError = false; // Simplified validation flag
//         let currentErr = [];

//         if (!name) {
//             hasError = true;
//             currentErr.push("name");
//         }
//         if (!pwd) {
//             hasError = true;
//             currentErr.push("password");
//         }

//         if (hasError) {
//             if (currentErr.length > 1) {
//                  set_err("Username and password cannot be empty!");
//             } else {
//                  set_err(`${currentErr[0]} cannot be empty!`);
//             }
//             return; // Stop submission
//         }

//         // If validation passes:
//         // sock.name = name; // Set sock.name *here* if needed globally immediately
//         sock.emit("con", { nam: name, password: pwd });

//         // Call the callback passed from App.js instead of setting internal state
//         if (onLoginSuccess) {
//              onLoginSuccess(name); // Pass username back if needed
//         }
//          // Clear login form fields after successful attempt (optional)
//          // set_name("");
//          // set_pwd("");
//     }

//     // --- Message Sending Logic (Unchanged, only runs if isLoggedIn is true) ---
//     function handle2(e) {
//         e.preventDefault();
//         if ((msg || "").trim() === "") return;
//         let too = "server";
//         // Use optional chaining in case 'use' is not passed when logging in
//         const activeUser = use?.find(user => user.ch);
//         if (activeUser) {
//             too = activeUser.username;
//         }
//         sock.emit("message", { msg: msg, to: too });
//         set_msg("");
//     }

//     // --- Socket Event Listener Logic ---
//     useEffect(() => {
//         // This listener seems related to post-login actions based on 'done' event
//         // It might need adjustment based on when 'done' is emitted by server
//         const handleDone = (data) => {
//             // This logic might be better placed in App.js after login success,
//             // or ensure it only runs *after* isLoggedIn becomes true.
//             if (isLoggedIn) { // Only run if logged in
//                 console.log("Socket 'done' event received:", data);
//                 // Re-emit pretext for the currently selected user?
//                 const selectedUser = use?.find(user => user.ch);
//                 sock.emit("pretext", { to: selectedUser ? selectedUser.username : "server" });
//             }
//         };

//         sock.on("done", handleDone);
//         return () => { sock.off("done", handleDone); };
//     }, [sock, isLoggedIn, use]); // Add isLoggedIn and use dependencies

//     // --- Component Rendering ---
//     // Use the isLoggedIn prop to decide which form to render
//     return !isLoggedIn ? (
//         // --- Login Form --- (Structure mostly unchanged)
//         <div className="signin-container">
//             <form onSubmit={handle1} className="signin">
//                  <h2>Sign In</h2>
//                  <input /* ... Username input ... */
//                     type="text"
//                     value={name || ""}
//                     onChange={(e) => set_name(e.target.value || "")}
//                     placeholder="Username"
//                     aria-label="Username"
//                     autoFocus // Focus username field on load
//                  />
//                  <input /* ... Password input ... */
//                     type="password"
//                     value={pwd || ""}
//                     onChange={(e) => set_pwd(e.target.value || "")}
//                     placeholder="Password"
//                     aria-label="Password"
//                  />
//                  <button type="submit" className="login-button">Sign In</button>
//                  {err && (<p className="error-message">{err}</p>)}
//             </form>
//         </div>
//     ) : (
//         // --- Chat Input Form --- (Structure mostly unchanged)
//         <form onSubmit={handle2} className="forms">
//             <input /* ... Message input ... */
//                 type="text"
//                 value={msg || ""}
//                 onChange={(e) => set_msg(e.target.value || "")}
//                 placeholder="Type a message..."
//                 aria-label="Message Input"
//                 autoFocus // Focus message input when chat view loads
//             />
//             <button /* ... Send button ... */
//                 type="submit"
//                 className="send-button"
//                 aria-label="Send Message"
//                 disabled={(msg || "").trim() === ""}
//             >
//                 <svg /* ... SVG Icon ... */ >
//                    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
//                 </svg>
//             </button>
//         </form>
//     );
// }

// export default C1;



// src/chat_app_features/C1.jsx
// src/chat_app_features/C1.jsx
import React, { useState, useEffect, useRef } from "react";

// Pass socket down from ChatPage (assuming ChatPage manages the connection)

function C1({ sock, use, isLoggedIn, onLoginSuccess }) {
    // --- State Variables ---
    const [name, set_name] = useState("");
    const [msg, set_msg] = useState("");
    const [pwd, set_pwd] = useState("");
    const [err, set_err] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false); // <-- State for disabling login form
    const fileInputRef = useRef(null);

    // --- Login Logic (handle1) ---
    function handle1(e) {
        e.preventDefault();
        set_err("");
        if (!name || !pwd) {
            set_err("Username and password cannot be empty!");
            return;
        }
        setIsSigningIn(true); // <-- Disable form
        console.log("Client: Emitting 'con' event with:", { nam: name, password: "..." });
        sock.emit("con", { nam: name, password: pwd });
    }

    // --- File Selection Handler ---
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setPreviewUrl(reader.result); };
            reader.readAsDataURL(file);
            set_err("");
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
            if (file) set_err("Please select an image file.");
        }
    };

    // --- Message/Image Sending Logic (handle2) ---
    async function handle2(e) {
        e.preventDefault();
        const textMessage = (msg || "").trim();
        if (!textMessage && !selectedFile) return;

        let too = "server";
        const activeUser = use?.find(user => user.ch);
        if (activeUser) { too = activeUser.username; }

        let fileId = null;
        if (selectedFile) {
            setIsUploading(true);
            set_err("");
            const formData = new FormData();
            formData.append('imageFile', selectedFile);

            try {
                const response = await fetch('http://localhost:3800/upload/image', { // Replace URL if needed
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                fileId = result.fileId;
                console.log("Client: File uploaded successfully, ID:", fileId);
            } catch (uploadError) {
                console.error("Client: File upload failed:", uploadError);
                set_err(`Upload failed: ${uploadError.message}`);
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const messageData = { msg: textMessage, to: too, imageFileId: fileId };
        console.log("Client: Emitting message event:", messageData);
        sock.emit("message", messageData);

        set_msg("");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
    }

    // --- Socket Listener for Login Response ---
    useEffect(() => {
        if (!sock) return;
        console.log("C1: Setting up login response listeners...");

        const handleTokenUpdate = (data) => {
            console.log("[Client DEBUG] Received 'token' event in C1:", data);
            setIsSigningIn(false); // <-- Re-enable form
            if (data && data.name && onLoginSuccess) {
                console.log(`[Client DEBUG] 'token' event has name ('${data.name}'). Calling onLoginSuccess.`);
                onLoginSuccess(data.name);
            } else if (data && !data.name) {
                console.log("[Client DEBUG] 'token' event received, but no name provided (likely guest or initial).");
            } else if (!data) {
                console.warn("[Client DEBUG] Received 'token' event with invalid data:", data);
            }
        };
        const handleDoneConfirmation = (doneData) => {
            console.log("[Client DEBUG] Received 'done' event:", doneData);
             // Might still need to set isSigningIn false here if 'token' isn't guaranteed after 'done'
             // setIsSigningIn(false);
        };
        const handleLoginError = (error) => {
            console.error("[Client DEBUG] Received 'login_error' event:", error);
            set_err(error.message || "Login failed.");
            setIsSigningIn(false); // <-- Re-enable form
        };

        sock.on("token", handleTokenUpdate);
        sock.on("done", handleDoneConfirmation);
        sock.on("login_error", handleLoginError);

        return () => {
            console.log("C1: Cleaning up login response listeners...");
            sock.off("token", handleTokenUpdate);
            sock.off("done", handleDoneConfirmation);
            sock.off("login_error", handleLoginError);
        };
    }, [sock, onLoginSuccess]);

    // --- Component Rendering ---
    return !isLoggedIn ? (
        // --- Login Form ---
        <div className="signin-container">
            <form onSubmit={handle1} className="signin">
                 <h2>Sign In</h2>
                 <input
                    type="text"
                    value={name || ""}
                    onChange={(e) => set_name(e.target.value || "")}
                    placeholder="Username"
                    aria-label="Username"
                    autoFocus
                    disabled={isSigningIn} // <-- FIXED
                 />
                 <input
                    type="password"
                    value={pwd || ""}
                    onChange={(e) => set_pwd(e.target.value || "")}
                    placeholder="Password"
                    aria-label="Password"
                    disabled={isSigningIn} // <-- FIXED
                 />
                 <button type="submit" className="login-button" disabled={isSigningIn}> {/* <-- FIXED */}
                    Sign In
                 </button>
                 {err && (<p className="error-message">{err}</p>)}
            </form>
        </div>
    ) : (
        // --- Chat Input Form ---
        <form onSubmit={handle2} className="forms chat-input-form">
            {previewUrl && (
                 <div className="image-preview-container">
                    <img src={previewUrl} alt="Preview" className="image-preview" />
                    <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="remove-preview-btn" aria-label="Remove image preview">×</button>
                 </div>
            )}
             <div className="input-area">
                <input
                    type="text"
                    value={msg}
                    onChange={(e) => set_msg(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Message Input"
                    disabled={isUploading}
                    autoFocus
                />
                <label htmlFor="file-input" className={`file-input-label ${isUploading ? 'disabled' : ''}`} aria-label="Attach image">📎</label>
                <input
                    id="file-input" type="file" accept="image/*" onChange={handleFileChange}
                    ref={fileInputRef} style={{ display: 'none' }} disabled={isUploading}
                />
             </div>
            <button type="submit" className="send-button" aria-label="Send Message" disabled={isUploading || (!msg.trim() && !selectedFile)}>
                 {isUploading ? ( <div className="spinner" aria-label="Uploading"></div> ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                       <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                    </svg>
                 )}
            </button>
            {err && !isUploading && (<p className="error-message input-error">{err}</p>)}
        </form>
    );
}

export default C1;