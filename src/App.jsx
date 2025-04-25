import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import WelcomePage from "./welcome.jsx";
import SignIn from "./signin.jsx";
import Signup from "./signup2.jsx";
import DocsTab from "./documents.jsx";
import Outlines from "./outlines.jsx";
import Calculator from "./calculator.jsx";
import Scheduler from "./scheduler.jsx";
import Dashboard from "./dashboard.jsx";
import FacultyOfficeHours from "./faculty.jsx";
import ChatApp from "./chat_app_features/ChatApp.jsx";
import Profile from "./profile.jsx";
import SocietiesPage from "./socities.jsx";
import SocietyDetailPage from "./SocietyDetailPage.jsx";
import PostDetailPage from "./PostDetailPage.jsx";
import UserProfileView from "./UserProfileView.jsx";
import Communities from "./Communities";
import CommunityDetail from "./CommunityDetail";
import Meet from "./meetup/src/meetApp.jsx"; 
import { WebsocketProvider } from "./meetup/src/context/websocket.jsx";

// Initialize Supabase - same as in dashboard.jsx
const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  // User authentication state management (similar to dashboard.jsx)
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email // Default name to email
        });
      }
    };
    
    getInitialSession();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email
          });
        } else {
          setUser(null);
        }
      }
    );
    
    // Cleanup on unmount
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup2" element={<Signup />} />
        <Route path="/society" element={<SocietiesPage />} />
        <Route path="/documents" element={<DocsTab />} />
        <Route path="/outlines" element={<Outlines />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faculty" element={<FacultyOfficeHours />} />
        {<Route path="/chat" element={
        <ChatApp />
        } />}
        <Route path="/profile" element={<Profile />} />
        <Route path="/society/:societyId" element={<SocietyDetailPage />} />
        <Route path="/post/:postId/comments" element={<PostDetailPage />} />
        <Route path="/profile/email/:email" element={<UserProfileView />} />
        <Route path="/communities" element={<Communities user={user} />} />
        <Route path="/communities/:communityId" element={<CommunityDetail currentUser={user} />} />
        <Route path="/meetup" element={<>
          <WebsocketProvider>
            <Meet />
          </WebsocketProvider></>} />
      </Routes>
    </Router>
  );
};

export default App;
