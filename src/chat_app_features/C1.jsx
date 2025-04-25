import React, { useState, useEffect, useRef } from "react";

function C1({ sock, use, isLoggedIn, onLoginSuccess }) {
    const [name, set_name] = useState("");
    const [msg, set_msg] = useState("");
    const [pwd, set_pwd] = useState("");
    const [err, set_err] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const fileInputRef = useRef(null);

    
    function handle1(e) {
        e.preventDefault();
        set_err("");
        if (!name || !pwd) {
            set_err("Username and password cannot be empty!");
            return;
        }
        setIsSigningIn(true); 
        console.log("Client: Emitting 'con' event with:", { nam: name, password: "..." });
        sock.emit("con", { nam: name, password: pwd });
    }

   
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

  
    useEffect(() => {
        if (!sock) return;
        console.log("C1: Setting up login response listeners...");

        const handleTokenUpdate = (data) => {
            console.log("[Client DEBUG] Received 'token' event in C1:", data);
            setIsSigningIn(false); 
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
            
        };
        const handleLoginError = (error) => {
            console.error("[Client DEBUG] Received 'login_error' event:", error);
            set_err(error.message || "Login failed.");
            setIsSigningIn(false); 
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

    
    return !isLoggedIn ? (
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