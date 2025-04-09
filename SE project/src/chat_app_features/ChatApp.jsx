// import { useState } from "react";
// import './App.css'; // <<<< ENSURE this filename is correct
// import C1 from "./C1";
// import List from "./List";
// import socket from "./sock";
// import Mess from "./Messages";
// import User from "./User";

// function App() {
//   const [users, set_users] = useState([{ username: "server", ch: true, id: Date.now() }]); // Use Date.now() or uuid for better initial ID
//   const [curr, set_curr] = useState("server");

//   return (
//     <div className="App">
//       {/* --- Sidebar --- */}
//       <div className="users">
//          {/* Optional Header */}
//          <div className="user-list-header">Conversations</div>
//         <List
//           sock={socket}
//           use={users}
//           set={set_users}
//           cur={curr}
//           scur={set_curr}
//         />
//       </div>

//       {/* --- Main Area --- */}
//       <div className="together">
//         {/* Mess component needs internal changes */}
//         <Mess
//           sock={socket}
//           cur={curr}
//           scur={set_curr} // Pass scur if needed inside Mess
//         />
//          {/* frm container for padding/bg */}
//         <div className="frm">
//           {/* C1 needs internal changes */}
//           <C1
//             sock={socket}
//             use={users} // Pass users if needed for context
//             set={set_users} // Pass set_users if needed
//             className="forms"
//           />
//         </div>
//       </div>
//       {/* User component for background logic */}
//       <User sock={socket} use={users} set={set_users} />
//     </div>
//   );
// }
// export default App;


// Import useState
import { useState } from "react";
import './napp.css';
import C1 from "./C1";
import List from "./List";
import socket from "./sock";
import Mess from "./Messages";
import User from "./User"; // Keep User for background socket handling

function ChatApp() {
    const [users, set_users] = useState([{ username: "server", ch: true, id: 'server-id' }]); // Use stable initial ID
    const [curr, set_curr] = useState("server");
    // --- ADD LOGIN STATE HERE ---
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Initially not logged in

    // --- Function to be called by C1 on successful login ---
    const handleLoginSuccess = (username) => {
        setIsLoggedIn(true);
        // Optional: You might want to update sock.name here if C1 doesn't do it
        // socket.name = username;
        // After login, select the 'server' chat by default
        set_curr("server");
        // Ensure the user list reflects the default selection
        set_users(prevUsers => prevUsers.map(u => ({ ...u, ch: u.username === "server" })));
        // Trigger loading server messages if needed (Mess component's useEffect will handle this based on 'cur')
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

// --- Add CSS for placeholders (Optional) ---
/*
.sidebar-placeholder {
    padding: var(--padding-l);
    color: var(--text-secondary);
    text-align: center;
    margin-top: 20px;
}

.login-view-wrapper {
    display: flex;
    flex: 1; // Take up main area space when Mess isn't visible
    align-items: center;
    justify-content: center;
     background-color: var(--bg-chat-area); // Match chat area background
}
*/