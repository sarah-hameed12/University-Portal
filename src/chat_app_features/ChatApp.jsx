import { useState } from "react";
import './napp.css';
import C1 from "./C1";
import List from "./List";
import Mess from "./Messages";
import User from "./User";
import socket from "./sock"

function ChatApp() {
    const [users, set_users] = useState([{ username: "server", ch: true, id: 'server-id' }]); // Use stable initial ID
    const [curr, set_curr] = useState("server");
    // --- ADD LOGIN STATE HERE ---
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Initially not logged in

    // --- Function to be called by C1 on successful login ---
    const handleLoginSuccess = (username) => {
        setIsLoggedIn(true);
        set_curr("server");
        // Ensure the user list reflects the default selection
        set_users(prevUsers => prevUsers.map(u => ({ ...u, ch: u.username === "server" })));
    };

    return (
        <div className="App">
            {/* --- Sidebar: Conditionally render User List --- */}
            <div className="users">
                {/* Only render the list IF logged in */}
                {isLoggedIn && (
                    <>
                        <div className="user-list-header">Conversations</div>
                        <List
                            sock={socket}
                            use={users}
                            set={set_users}
                            cur={curr}
                            scur={set_curr}
                        />
                    </>
                )}
                 {/* Optionally show something else here if not logged in, or leave blank */}
                 {!isLoggedIn && (
                     <div className="sidebar-placeholder">Sign in to see users</div>
                 )}
            </div>

            {/* --- Main Area --- */}
            <div className="together">
                {/* Conditionally render Mess component */}
                {isLoggedIn && (
                    <Mess
                        sock={socket}
                        cur={curr}
                        scur={set_curr} // Pass scur if needed inside Mess
                    />
                )}

                {/* Render C1: It shows Login OR Input based on isLoggedIn prop */}
                {/* We wrap C1 differently depending on login state for layout */}
                 {!isLoggedIn ? (
                     // Login View Wrapper (takes full space if Mess isn't rendered)
                     <div className="login-view-wrapper">
                        <C1
                            // Key props for LOGIN state
                            isLoggedIn={false}
                            onLoginSuccess={handleLoginSuccess} // Pass login callback
                            sock={socket}
                            // Props not needed for login: use, set, cur, scur
                        />
                     </div>
                 ) : (
                     // Message Input View Wrapper (fixed at bottom)
                     <div className="frm">
                         <C1
                             // Key props for MESSAGE INPUT state
                             isLoggedIn={true}
                             sock={socket}
                             use={users} // Needed to find recipient
                             // Props not needed for input: set, onLoginSuccess
                         />
                     </div>
                 )}
            </div>

            {/* User component for background logic (like listening for user list updates) */}
            {/* Can remain, but ensure it only starts full operation after login if necessary */}
            <User sock={socket} use={users} set={set_users} isLoggedIn={isLoggedIn} />
        </div>
    );
}
export default ChatApp;