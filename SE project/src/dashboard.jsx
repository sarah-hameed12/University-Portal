// src/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
// --- >>> Import the single Supabase client instance <<< ---
const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Style Definitions ---
const styles = {
  // --- General & Layout ---
  dashboardContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#111827", // Dark background
    color: "#e5e7eb", // Light gray text default
    fontFamily: "sans-serif", // Base font
  },
  dashboardMainContent: {
    flexGrow: 1,
    marginLeft: "256px", // Fixed offset for sidenav
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  dashboardScrollableArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "24px",
    paddingTop: "80px", // Space for fixed TopNav
  },

  // --- SideNav ---
  sidenav: {
    width: "256px",
    height: "100vh",
    backgroundColor: "#1f2937", // Darker Gray
    color: "#d1d5db", // Lighter Gray
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    boxSizing: "border-box",
    borderRight: "1px solid #374151",
  },
  sidenavTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "40px",
    textAlign: "center",
    color: "#a78bfa", // Purple-400
  },
  sidenavList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  sidenavListItem: {
    marginBottom: "16px",
  },
  sidenavLink: {
    display: "flex",
    alignItems: "center",
    padding: "8px",
    borderRadius: "6px",
    textDecoration: "none",
    color: "inherit",
    transition: "background-color 0.2s ease, color 0.2s ease", // Note: Hover styles won't apply directly
  },
  sidenavLinkIcon: {
    marginRight: "12px",
  },
  sidenavFooter: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#6b7280",
  },

  // --- TopNav ---
  topnav: {
    backgroundColor: "#1f2937",
    color: "#e5e7eb",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: "256px", // Aligned next to sidenav
    right: 0,
    zIndex: 10,
    height: "64px",
    boxSizing: "border-box",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderBottom: "1px solid #374151",
  },
  topnavProfile: {
    display: "flex",
    alignItems: "center",
  },
  topnavProfilePic: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    marginRight: "12px",
    border: "2px solid #a78bfa",
    objectFit: "cover",
  },
  topnavProfileName: {
    fontWeight: 500,
  },
  topnavSearchContainer: {
    flexGrow: 1,
    maxWidth: "42rem",
    margin: "0 16px",
    position: "relative",
  },
  topnavSearchInput: {
    width: "100%",
    padding: "8px 8px 8px 40px",
    borderRadius: "6px",
    backgroundColor: "#374151",
    color: "white",
    border: "1px solid #4b5563",
    boxSizing: "border-box",
  },
  topnavSearchIconContainer: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  topnavActions: {
    display: "flex",
    alignItems: "center",
  },
  // Base button definitions needed for composing styles later
  topnavButton: {
    padding: "4px 16px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  topnavButtonPrimary: {
    backgroundColor: "#7c3aed", // purple-600
  },
  topnavButtonSecondary: {
    backgroundColor: "#4b5563", // gray-600
    marginRight: "8px",
  },

  // --- Feed ---
  feedContainer: {
    marginTop: "16px",
  },
  feedTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#e5e7eb",
    marginBottom: "16px",
  },
  feedStatusMessage: {
    textAlign: "center",
    padding: "20px",
    color: "#9ca3af",
    borderRadius: "8px",
  },
  feedErrorMessage: {
    color: "#f87171", // red-500
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  // --- PostItem ---
  postItem: {
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    padding: "16px",
    marginBottom: "24px",
    border: "1px solid #374151",
  },
  postHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  postAuthorAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "12px",
    border: "2px solid #4b5563",
    objectFit: "cover",
  },
  postAuthorName: {
    fontWeight: 600,
    color: "#a78bfa",
  },
  postTimestamp: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  postImage: {
    borderRadius: "8px",
    marginBottom: "12px",
    maxHeight: "384px",
    width: "100%",
    objectFit: "cover",
  },
  postContent: {
    color: "#e5e7eb",
    marginBottom: "16px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  postActions: {
    display: "flex",
    justifyContent: "flex-start",
  },
  postActionButton: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px 8px",
    marginRight: "16px",
    fontSize: "0.875rem",
    transition: "color 0.2s ease",
  },

  // --- Modal Base Styles ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#1f2937",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
    width: "90%",
    maxWidth: "500px",
    position: "relative",
    border: "1px solid #374151",
  },
  modalCloseButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: "1.5rem",
    cursor: "pointer",
    lineHeight: "1",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#e5e7eb",
    textAlign: "center",
  },
  modalFormTextArea: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    backgroundColor: "#374151",
    color: "white",
    border: "1px solid #4b5563",
    boxSizing: "border-box",
    resize: "vertical",
  },
  modalFormInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    backgroundColor: "#374151",
    color: "white",
    border: "1px solid #4b5563",
    boxSizing: "border-box",
  },
  modalError: {
    color: "#f87171", // red-500
    textAlign: "center",
    marginBottom: "15px",
    fontSize: "0.875rem",
  },
}; // End of base styles object

// --- DEFINE COMPOSITE MODAL BUTTON STYLES HERE ---
const modalSubmitButtonStyle = {
  ...styles.topnavButton,
  ...styles.topnavButtonPrimary,
  display: "block",
  width: "50%",
  margin: "0 auto",
  padding: "10px 16px",
};

const modalSubmitButtonDisabledStyle = {
  ...styles.topnavButton,
  backgroundColor: "#4b5563",
  cursor: "not-allowed",
  display: "block",
  width: "50%",
  margin: "0 auto",
  padding: "10px 16px",
};
// --- END COMPOSITE STYLE DEFINITIONS ---

// --- Components ---

const HomeIcon = () => <span>🏠</span>;
const ExploreIcon = () => <span>🧭</span>;
const ProfileIcon = () => <span>👤</span>;
const SettingsIcon = () => <span>⚙️</span>;
const SearchIcon = () => <span>🔍</span>;

const SideNav = () => {
  const navItems = [
    { name: "Home", icon: <HomeIcon />, path: "/" },
    { name: "Explore", icon: <ExploreIcon />, path: "/explore" },
    { name: "Profile", icon: <ProfileIcon />, path: "/profile" },
    { name: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];
  const [isHomeHovered, setIsHomeHovered] = useState(false);

  return (
    <nav style={styles.sidenav}>
      <div style={styles.sidenavTitle}>SuperLUMS</div>
      <ul style={styles.sidenavList}>
        {navItems.map((item, index) => (
          <li key={item.name} style={styles.sidenavListItem}>
            <a
              href={item.path}
              style={styles.sidenavLink}
              onMouseEnter={() => index === 0 && setIsHomeHovered(true)}
              onMouseLeave={() => index === 0 && setIsHomeHovered(false)}
            >
              <span style={styles.sidenavLinkIcon}>{item.icon}</span>
              {item.name}
            </a>
          </li>
        ))}
      </ul>
      <div style={styles.sidenavFooter}>© 2025 UniSocial</div>
    </nav>
  );
};

const TopNav = ({ isAuthenticated, user, onLogout, onOpenCreatePost }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const primaryButtonStyle = {
    ...styles.topnavButton,
    ...styles.topnavButtonPrimary,
  };
  const secondaryButtonStyle = {
    ...styles.topnavButton,
    ...styles.topnavButtonSecondary,
  };
  const createPostButtonStyle = primaryButtonStyle;
  const logoutButtonStyle = {
    ...styles.topnavButton,
    backgroundColor: "#dc2626",
  };

  return (
    <nav style={styles.topnav}>
      {/* Left Side: Profile Info or Placeholder */}
      <div style={styles.topnavProfile}>
        {isAuthenticated && user ? (
          <>
            <img
              src={
                user.profilePicUrl ||
                `https://i.pravatar.cc/40?u=${user.id || user.name}`
              } // Pravatar fallback
              alt={user.name || "User"}
              style={styles.topnavProfilePic}
            />
            <span style={styles.topnavProfileName}>
              {user.name || user.email || "User"} {/* Display name or email */}
            </span>
          </>
        ) : (
          <div style={{ width: "32px", marginRight: "12px" }}></div>
        )}
      </div>

      {/* Middle: Search Bar */}
      <div style={styles.topnavSearchContainer}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search posts, users..."
          style={styles.topnavSearchInput}
        />
        <div style={styles.topnavSearchIconContainer}>
          <SearchIcon />
        </div>
      </div>

      {/* Right Side: Conditional Actions */}
      <div style={styles.topnavActions}>
        {isAuthenticated ? (
          <>
            <button style={createPostButtonStyle} onClick={onOpenCreatePost}>
              {" "}
              + Create Post{" "}
            </button>
            <div style={{ width: "10px" }}></div>
            <button style={logoutButtonStyle} onClick={onLogout}>
              {" "}
              Logout{" "}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signin
              "
              style={{ ...secondaryButtonStyle, textDecoration: "none" }}
            >
              {" "}
              Login{" "}
            </Link>
            <Link
              to="/signup2"
              style={{ ...primaryButtonStyle, textDecoration: "none" }}
            >
              {" "}
              Register{" "}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const PostItem = ({ post }) => {
  return (
    <div style={styles.postItem}>
      <div style={styles.postHeader}>
        <img
          src={`https://i.pravatar.cc/40?u=${post.author_name}`}
          alt={post.author_name}
          style={styles.postAuthorAvatar}
        />
        <div>
          <p style={styles.postAuthorName}>{post.author_name}</p>
          <p style={styles.postTimestamp}>
            {" "}
            {new Date(post.timestamp).toLocaleString()}{" "}
          </p>
        </div>
      </div>
      {post.image_url && (
        <img src={post.image_url} alt="Post content" style={styles.postImage} />
      )}
      <p style={styles.postContent}>{post.content}</p>
      <div style={styles.postActions}>
        <button style={styles.postActionButton}>👍 Like</button>
        <button style={styles.postActionButton}>💬 Comment</button>
        <button style={styles.postActionButton}>🔗 Share</button>
      </div>
    </div>
  );
};

const Feed = ({ posts, loading, error }) => {
  const errorCombinedStyle = {
    ...styles.feedStatusMessage,
    ...styles.feedErrorMessage,
  };

  return (
    <div style={styles.feedContainer}>
      <h2 style={styles.feedTitle}>Live Feed</h2>
      {loading && <p style={styles.feedStatusMessage}>Loading feed...</p>}
      {error && <p style={errorCombinedStyle}>{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p style={styles.feedStatusMessage}>
          {" "}
          No posts yet. Be the first to share!{" "}
        </p>
      )}
      {!loading &&
        !error &&
        posts.map((post) => <PostItem key={post.id} post={post} />)}
    </div>
  );
};

const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setImageUrl("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Use name from the currentUser object passed down from Dashboard state
    const postData = {
      content: content,
      author_name: currentUser?.name || currentUser?.email || "Anonymous User", // Use name or email
      image_url: imageUrl.trim() || null,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/feed/posts/", // API endpoint
        postData
      );
      onPostCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      let errorMessage = "Failed to create post. Please try again.";
      if (err.response && err.response.data) {
        const errors = err.response.data;
        const messages = Object.entries(errors)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join("; ");
        if (messages) errorMessage = messages;
      }
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalCloseButton} onClick={onClose}>
          {" "}
          ×{" "}
        </button>
        <h3 style={styles.modalTitle}>Create New Post</h3>
        {error && <p style={styles.modalError}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.modalFormTextArea}
            required
            disabled={isSubmitting}
          />
          <input
            type="url"
            placeholder="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={styles.modalFormInput}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            style={
              isSubmitting
                ? modalSubmitButtonDisabledStyle
                : modalSubmitButtonStyle
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [errorFeed, setErrorFeed] = useState(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- Fetch User Profile ---
  const fetchUserProfile = useCallback(async (userId) => {
    // Wrapped in useCallback
    if (!userId) return null;
    console.log(`fetchUserProfile called for userId: ${userId}`); // Log profile fetch start
    try {
      const { data, error } = await supabase
        .from("users") // Your table name
        .select("id, email") // Select specific columns you need - ADJUST AS NEEDED
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        return null;
      }
      console.log("Profile data fetched from DB:", data); // Log success
      return data;
    } catch (fetchError) {
      console.error("Catch Error fetching user profile:", fetchError);
      return null;
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props

  // --- Effect for Handling Auth State Changes ---
  // --- Effect for Handling Auth State Changes ---
  useEffect(() => {
    console.log("Auth useEffect started.");
    let initialCheckDone = false; // Flag to track initial check completion

    // --- Define Helper to Set User State ---
    // This avoids repeating logic and ensures profile fetch happens correctly
    const updateUserState = async (session) => {
      if (session) {
        console.log(
          `updateUserState: Setting auth true. Fetching profile for ${session.user.id}`
        );
        setIsAuthenticated(true);
        try {
          const profile = await fetchUserProfile(session.user.id);
          console.log("updateUserState: Profile fetched:", profile);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name:
              session.user.user_metadata?.full_name ||
              profile?.full_name ||
              session.user.email,
            profilePicUrl:
              session.user.user_metadata?.avatar_url || profile?.avatar_url,
          });
        } catch (profileError) {
          console.error(
            "updateUserState: Error fetching profile:",
            profileError
          );
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email,
          }); // Fallback
        }
      } else {
        console.log("updateUserState: Setting auth false, user null.");
        setUser(null);
        setIsAuthenticated(false);
      }

      // --- Crucially set loading false AFTER potentially async profile fetch ---
      // --- Only set it once after the *initial* check is fully processed ---
      if (!initialCheckDone) {
        console.log(
          "updateUserState: Initial check complete. Setting authLoading false."
        );
        setAuthLoading(false);
        initialCheckDone = true;
      }
    };

    // 1. Check initial session *without* blocking on profile fetch initially
    console.log("Checking initial Supabase session...");
    supabase.auth
      .getSession()
      .then(({ data: { session }, error: sessionError }) => {
        console.log(
          "Initial getSession resolved. Session:",
          session,
          "Error:",
          sessionError
        );
        if (sessionError) {
          console.error("Error directly from getSession:", sessionError);
        }
        // Call the helper function to process the session and set loading state
        updateUserState(session);
      })
      .catch((error) => {
        // Catch errors specifically from the getSession promise itself
        console.error("Error in getSession promise chain (.catch):", error);
        updateUserState(null); // Treat error as no session, ensure loading state is set
      });

    // 2. Listen for future changes
    console.log("Setting up onAuthStateChange listener...");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("onAuthStateChange triggered. Event:", _event);
        // The listener should simply update state based on the current session
        // We don't need to worry about the 'initialCheckDone' flag here
        updateUserState(session);
      }
    );

    // Cleanup
    return () => {
      console.log("Cleaning up auth listener.");
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]); // Keep fetchUserProfile dependency

  // Fetching Logic for Feed Posts
  const fetchPosts = useCallback(async () => {
    setErrorFeed(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/feed/posts/");
      const postsData = response.data.results || response.data;
      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        console.error("API response is not an array:", postsData);
        setErrorFeed("Received unexpected data format.");
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setErrorFeed("Failed to load feed.");
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  // Fetch posts initially
  useEffect(() => {
    setLoadingFeed(true);
    fetchPosts();
  }, [fetchPosts]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    setIsCreateModalOpen(true);
  };
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Logout Handler using Supabase
  const handleLogout = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    setAuthLoading(false); // Set loading false regardless of outcome
    if (error) {
      console.error("Error logging out:", error);
    } else {
      // No need to manually set state here, listener will handle it
      navigate("/signin");
    }
  };

  // Render loading state while checking auth
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: styles.dashboardContainer.backgroundColor,
          color: "white",
        }}
      >
        Loading Authentication...
      </div>
    );
  }

  // Main component render
  return (
    <div style={styles.dashboardContainer}>
      <SideNav />
      <div style={styles.dashboardMainContent}>
        <TopNav
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          onOpenCreatePost={handleOpenCreateModal}
        />
        <main style={styles.dashboardScrollableArea}>
          <Feed posts={posts} loading={loadingFeed} error={errorFeed} />
        </main>
      </div>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onPostCreated={handlePostCreated}
        currentUser={user}
      />
    </div>
  );
};

export default Dashboard;
