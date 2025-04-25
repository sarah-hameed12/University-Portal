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
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Initially not logged in

   
    const handleLoginSuccess = (username) => {
        setIsLoggedIn(true);
        set_curr("server");
        
        set_users(prevUsers => prevUsers.map(u => ({ ...u, ch: u.username === "server" })));
    };

    return (
        <div className="App">
           
            <div className="users">
               
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
                
                 {!isLoggedIn && (
                     <div className="sidebar-placeholder">Sign in to see users</div>
                 )}
            </div>

          
            <div className="together">
               
                {isLoggedIn && (
                    <Mess
                        sock={socket}
                        cur={curr}
                        scur={set_curr} 
                    />
                )}

               
                 {!isLoggedIn ? (
                    
                     <div className="login-view-wrapper">
                        <C1
                            
                            isLoggedIn={false}
                            onLoginSuccess={handleLoginSuccess} 
                            sock={socket}
                           
                        />
                     </div>
                 ) : (
                     
                     <div className="frm">
                         <C1
                            
                             isLoggedIn={true}
                             sock={socket}
                             use={users} 
                         />
                     </div>
                 )}
            </div>

    
            <User sock={socket} use={users} set={set_users} isLoggedIn={isLoggedIn} />
        </div>
    );
}
export default ChatApp;