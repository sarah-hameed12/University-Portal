import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
// import WelcomePage from "./welcome.jsx";
import SignIn from "./Auth/signin.jsx";
import Signup from "./Auth/signup2.jsx";
import DocsTab from "./Features/documents.jsx";
import Outlines from "./Features/outlines.jsx";
import Calculator from "./Features/calculator.jsx";
import Scheduler from "./Features/scheduler.jsx";
import Dashboard from "./Dashboard/dashboard.jsx";
import FacultyOfficeHours from "./Features/faculty.jsx";
import ChatApp from "./chat_app_features/ChatApp.jsx";
import Profile from "./Profile/profile.jsx";
import SocietiesPage from "./Utility/socities.jsx";
import SocietyDetailPage from "./Utility/SocietyDetailPage.jsx";
import PostDetailPage from "./Dashboard/PostDetailPage.jsx";
import UserProfileView from "./Profile/UserProfileView.jsx";
import Communities from "./Utility/Communities";
import CommunityDetail from "./Utility/CommunityDetail";
import VoiceChannel from "./Utility/VoiceChannel.jsx";
import RequireAuth from "./Auth/RequireAuth";
import UpdatePasswordPage from "./Auth/UpdatePasswordPage";

// Initialize Supabase - same as in dashboard.jsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    setLoadingAuth(true);
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data?.session;
        console.log("Initial Session Check:", session);

        if (isMounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.email, // You might want to fetch profile name here later
            });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoadingAuth(false); // <<<--- Stop loading ONLY IF mounted
        }
      }
    };

    getInitialSession();

    // Set up auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth State Change:", _event, session);
      if (isMounted) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email,
          });
        } else {
          setUser(null);
        }
        // Optionally set loading to false here too if needed,
        // but usually the initial check is the main one.
        // setLoadingAuth(false);
      }
    });

    // Cleanup on unmount
    return () => {
      isMounted = false; // Set flag on unmount
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // <<<--- Show loading indicator while checking auth --- >>>
  if (loadingAuth) {
    // You can replace this with a proper loading spinner component
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#111827",
          color: "#e5e7eb",
        }}
      >
        Loading Authentication...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup2" element={<Signup />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        {/* Optional: Add a public welcome page if needed */}
        {/* <Route path="/welcome" element={<WelcomePage />} /> */}

        {/* --- Protected Routes --- */}
        {/* All routes nested inside here require authentication */}
        <Route element={<RequireAuth user={user} />}>
          <Route index element={<Dashboard />} />{" "}
          {/* Default route when logged in */}
          <Route path="/dashboard" element={<Dashboard />} />{" "}
          {/* Explicit route */}
          <Route path="/documents" element={<DocsTab />} />
          <Route path="/outlines" element={<Outlines />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/faculty" element={<FacultyOfficeHours />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/profile" element={<Profile />} />{" "}
          {/* Assumes Profile fetches its own data */}
          <Route path="/society" element={<SocietiesPage />} />
          <Route path="/society/:societyId" element={<SocietyDetailPage />} />
          <Route path="/post/:postId/comments" element={<PostDetailPage />} />
          {/* UserProfileView might need the current user passed if it behaves differently for self vs others */}
          <Route path="/profile/email/:email" element={<UserProfileView />} />
          {/* Pass user prop specifically if the component needs it directly */}
          <Route path="/communities" element={<Communities user={user} />} />
          <Route
            path="/communities/:communityId"
            element={<CommunityDetail currentUser={user} />}
          />
          <Route
            path="/communities/:communityId/voice/:channelId"
            element={<VoiceChannel currentUser={user} />}
          />
        </Route>

        {/* --- Fallback Route --- */}
        {/* Redirects any unmatched path. If logged in, goes to dashboard, otherwise to signin. */}
        {/* Adjust the 'to' path as needed */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/signin"} replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
