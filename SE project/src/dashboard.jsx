// src/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
// --- >>> Import the single Supabase client instance <<< ---
// import { supabase } from "./supabaseClient"; // Make sure the path is correct

// --- >>> Import Icons <<< ---
const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);
import {
  FiHome,
  FiCompass,
  FiUser,
  FiSettings,
  FiMessageSquare,
  FiGrid,
  FiSearch,
  FiLogOut,
  FiPlus,
  FiLogIn,
} from "react-icons/fi"; // Import specific icons

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
    paddingTop: "80px", // Space for fixed TopNav (64px height + 16px padding)
  },

  // --- SideNav Enhancements ---
  sidenav: {
    width: "256px",
    height: "100vh",
    backgroundColor: "#161827", // Slightly different dark shade
    color: "#a0a3bd", // Default text color (text-secondary)
    padding: "20px 10px", // Adjust padding
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    boxSizing: "border-box",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border
    transition: "width 0.3s ease", // For potential future collapse
  },
  sidenavTitle: {
    fontSize: "1.6rem", // Slightly larger
    fontWeight: "bold",
    marginBottom: "45px", // More space below title
    marginTop: "10px",
    textAlign: "center",
    color: "#f0f0f5", // Brighter title color (text-primary)
    letterSpacing: "1px",
  },
  sidenavTitleAccent: {
    // For styling part of the title
    color: "#8c78ff", // Primary accent
  },
  sidenavList: {
    listStyle: "none",
    padding: 0,
    margin: "0 10px", // Add horizontal margin to list container
  },
  sidenavListItem: {
    marginBottom: "8px", // Reduce space between items
  },
  // Base style for links
  sidenavLink: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px", // Adjust padding
    borderRadius: "8px", // Slightly less rounded
    textDecoration: "none",
    color: "#a0a3bd", // Default item color (text-secondary)
    fontWeight: "500",
    transition:
      "background-color 0.2s ease, color 0.2s ease, padding-left 0.2s ease",
    position: "relative", // For active indicator
    overflow: "hidden", // Ensure indicator doesn't overflow
  },
  // Style for the active link
  sidenavLinkActive: {
    backgroundColor: "rgba(140, 120, 255, 0.1)", // Light primary accent background
    color: "#f0f0f5", // Brighter text (text-primary)
    // Optional: Add a visual indicator (e.g., left border)
    // borderLeft: '3px solid #8c78ff', // Primary accent border
    // paddingLeft: '12px', // Adjust padding to account for border
  },
  // Simple visual cue on hover (background change)
  sidenavLinkHover: {
    // We'll merge this conditionally using state
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#f0f0f5",
  },
  sidenavLinkIcon: {
    marginRight: "15px", // More space after icon
    fontSize: "1.2rem", // Slightly larger icons
    flexShrink: 0, // Prevent icon from shrinking
    position: "relative", // Fine-tune vertical alignment if needed
    top: "1px",
  },
  sidenavFooter: {
    marginTop: "auto",
    padding: "20px 10px 10px 10px",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#6a6f93", // Darker grey (text-placeholder)
    borderTop: "1px solid rgba(255, 255, 255, 0.05)", // Subtle separator
  },

  // --- TopNav Enhancements ---
  topnav: {
    backgroundColor: "#161827", // Match sidenav bg
    color: "#a0a3bd", // Default text color
    padding: "0 25px", // Adjust horizontal padding, vertical handled by height
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
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
  },
  // Profile section styling
  topnavProfileLink: {
    // Wrapper for the Link component
    display: "flex",
    alignItems: "center",
    textDecoration: "none", // Remove default link underline
    padding: "8px 12px", // Add padding for hover effect area
    borderRadius: "8px",
    transition: "background-color 0.2s ease",
    marginLeft: "-12px", // Counteract padding for visual alignment
    cursor: "pointer", // Indicate it's clickable
  },
  topnavProfileLinkHover: {
    // Style for hover state (merge with state)
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  topnavProfilePic: {
    width: "36px", // Slightly larger
    height: "36px",
    borderRadius: "50%",
    marginRight: "12px",
    border: "2px solid #8c78ff", // Primary accent border
    objectFit: "cover",
  },
  topnavProfileName: {
    fontWeight: 600, // Bolder name
    color: "#f0f0f5", // Brighter name color (text-primary)
    fontSize: "0.95rem",
  },
  // Search Bar styling
  topnavSearchContainer: {
    flexGrow: 1,
    maxWidth: "42rem",
    margin: "0 25px", // Adjust margin
    position: "relative",
  },
  topnavSearchInput: {
    width: "100%",
    padding: "9px 15px 9px 45px", // Adjust padding for icon
    borderRadius: "8px",
    backgroundColor: "rgba(18, 19, 38, 0.7)", // Darker input bg
    color: "#f0f0f5",
    border: "1px solid rgba(74, 77, 109, 0.7)", // Input border
    boxSizing: "border-box",
    outline: "none",
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  },
  topnavSearchInputFocus: {
    // Style for focus state (merge with state)
    backgroundColor: "rgba(18, 19, 38, 0.9)",
    borderColor: "#8c78ff", // Primary accent border
    boxShadow: "0 0 0 3px rgba(140, 120, 255, 0.3)", // Primary accent glow
  },
  topnavSearchIconContainer: {
    position: "absolute",
    left: "15px", // Adjust icon position
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6a6f93", // Placeholder color
    fontSize: "1.1rem",
    pointerEvents: "none",
    transition: "color 0.2s ease", // Transition color on focus
  },
  topnavSearchInputFocusIcon: {
    // Style for icon when input focused (merge)
    color: "#8c78ff", // Primary accent color
  },
  // Action buttons styling
  topnavActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Add gap between action buttons
  },
  topnavButton: {
    // Base button
    padding: "8px 18px", // Adjust padding
    border: "none",
    borderRadius: "8px",
    color: "#f0f0f5",
    backgroundColor: "rgba(74, 77, 109, 0.6)", // Muted background
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    fontWeight: "500",
    lineHeight: "1.25rem",
    display: "flex", // Allow icon centering
    alignItems: "center",
    gap: "6px", // Space between icon and text
    textDecoration: "none", // Remove underline if used within Link
  },
  topnavButtonHover: {
    // Hover for general buttons (merge with state)
    backgroundColor: "rgba(90, 93, 125, 0.8)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  topnavButtonPrimary: {
    // Specific style for primary actions (Register / Create Post)
    backgroundColor: "#8c78ff", // Primary accent solid
    color: "#ffffff",
  },
  topnavButtonPrimaryHover: {
    // Hover for primary button (merge with state)
    backgroundColor: "#7038d4", // Darker primary
    transform: "translateY(-1px)",
    boxShadow: "0 4px 10px rgba(140, 120, 255, 0.3)",
  },
  topnavButtonSecondary: {
    // Login button
    backgroundColor: "transparent",
    border: "1px solid rgba(74, 77, 109, 0.8)", // Subtle border
    // marginRight: "10px", // Use gap in topnavActions instead
  },
  topnavButtonSecondaryHover: {
    // Hover for secondary (merge with state)
    backgroundColor: "rgba(74, 77, 109, 0.4)",
    borderColor: "rgba(106, 111, 147, 1)",
    transform: "translateY(-1px)",
  },
  topnavButtonLogout: {
    // Style for logout button
    backgroundColor: "rgba(220, 38, 38, 0.2)", // Transparent red
    color: "#f87171", // Light red text
    // marginLeft: '10px', // Use gap in topnavActions instead
  },
  topnavButtonLogoutHover: {
    // Hover for logout (merge with state)
    backgroundColor: "rgba(220, 38, 38, 0.4)",
    color: "#ef4444", // Brighter red text
    transform: "translateY(-1px)",
  },

  // --- Feed Styles ---
  feedContainer: { marginTop: "16px" },
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
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  // --- PostItem Styles ---
  postItem: {
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    padding: "16px",
    marginBottom: "24px",
    border: "1px solid #374151",
  },
  postHeader: { display: "flex", alignItems: "center", marginBottom: "12px" },
  postAuthorAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "12px",
    border: "2px solid #4b5563",
    objectFit: "cover",
  },
  postAuthorName: { fontWeight: 600, color: "#a78bfa" },
  postTimestamp: { fontSize: "0.75rem", color: "#9ca3af" },
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
  postActions: { display: "flex", justifyContent: "flex-start" },
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

  // --- Modal Styles ---
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
    color: "#f87171",
    textAlign: "center",
    marginBottom: "15px",
    fontSize: "0.875rem",
  },
}; // End of base styles object

// --- DEFINE COMPOSITE MODAL BUTTON STYLES HERE ---
const modalSubmitButtonStyle = {
  ...styles.topnavButton, // Re-use base button style for consistency
  ...styles.topnavButtonPrimary, // Apply primary color/style
  display: "block", // Make it block for centering
  width: "50%",
  margin: "0 auto", // Center horizontally
  padding: "10px 16px", // Adjust padding for modal context
};
const modalSubmitButtonDisabledStyle = {
  ...styles.topnavButton, // Re-use base button style
  backgroundColor: "#4b5563", // Use a muted background when disabled
  color: "#a0a3bd", // Muted text color
  cursor: "not-allowed",
  display: "block",
  width: "50%",
  margin: "0 auto",
  padding: "10px 16px",
};
// --- END COMPOSITE STYLE DEFINITIONS ---

// --- Components ---

// Side Navigation Component
const SideNav = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { name: "Home", icon: <FiHome />, path: "/" },
    { name: "Explore", icon: <FiCompass />, path: "/explore" },
    { name: "Chat", icon: <FiMessageSquare />, path: "/chat" },
    { name: "Utilities", icon: <FiGrid />, path: "/documents" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
    { name: "Settings", icon: <FiSettings />, path: "/settings" },
  ];

  return (
    <nav style={styles.sidenav}>
      <div style={styles.sidenavTitle}>
        Uni<span style={styles.sidenavTitleAccent}>Social</span>
      </div>
      <ul style={styles.sidenavList}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;
          const linkStyle = {
            ...styles.sidenavLink,
            ...(isActive && styles.sidenavLinkActive),
            ...(isHovered && !isActive && styles.sidenavLinkHover),
          };
          return (
            <li key={item.name} style={styles.sidenavListItem}>
              <Link
                to={item.path}
                style={linkStyle}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span style={styles.sidenavLinkIcon}>{item.icon}</span>
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={styles.sidenavFooter}>© 2024 UniSocial</div>
    </nav>
  );
};

// Top Navigation Component
const TopNav = ({ isAuthenticated, user, onLogout, onOpenCreatePost }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const getButtonStyle = (type) => {
    const base = styles.topnavButton;
    let specific, hover;
    switch (type) {
      case "primary":
        specific = styles.topnavButtonPrimary;
        hover = styles.topnavButtonPrimaryHover;
        break;
      case "secondary":
        specific = styles.topnavButtonSecondary;
        hover = styles.topnavButtonSecondaryHover;
        break;
      case "logout":
        specific = styles.topnavButtonLogout;
        hover = styles.topnavButtonLogoutHover;
        break;
      default:
        specific = {};
        hover = styles.topnavButtonHover;
    }
    return { ...base, ...specific, ...(hoveredButton === type && hover) };
  };

  const searchInputStyle = {
    ...styles.topnavSearchInput,
    ...(isSearchFocused && styles.topnavSearchInputFocus),
  };
  const searchIconStyle = {
    ...styles.topnavSearchIconContainer,
    ...(isSearchFocused && styles.topnavSearchInputFocusIcon), // Change icon color too
  };

  const profileLinkStyle = {
    ...styles.topnavProfileLink,
    ...(isProfileHovered && styles.topnavProfileLinkHover),
  };

  return (
    <nav style={styles.topnav}>
      {/* Left Side */}
      <div style={styles.topnavProfile}>
        {isAuthenticated && user ? (
          <Link
            to="/profile"
            style={profileLinkStyle}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            <img
              src={
                user.profilePicUrl ||
                `https://i.pravatar.cc/40?u=${user.id || user.name}`
              }
              alt={user.name || "User"}
              style={styles.topnavProfilePic}
            />
            <span style={styles.topnavProfileName}>
              {" "}
              {user.name || user.email || "User"}{" "}
            </span>
          </Link>
        ) : (
          <div style={{ height: "40px", width: "40px" }}></div>
        )}
      </div>

      {/* Middle */}
      <div style={styles.topnavSearchContainer}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={searchInputStyle}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div style={searchIconStyle}>
          {" "}
          <FiSearch />{" "}
        </div>
      </div>

      {/* Right Side */}
      <div style={styles.topnavActions}>
        {isAuthenticated ? (
          <>
            <button
              style={getButtonStyle("primary")}
              onClick={onOpenCreatePost}
              onMouseEnter={() => setHoveredButton("primary")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiPlus size="1.1em" /> Create Post
            </button>
            <button
              style={getButtonStyle("logout")}
              onClick={onLogout}
              onMouseEnter={() => setHoveredButton("logout")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiLogOut size="1.1em" /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin">
              <button
                style={getButtonStyle("secondary")}
                onMouseEnter={() => setHoveredButton("secondary")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <FiLogIn size="1.1em" /> Login
              </button>
            </Link>
            <Link to="/signup">
              <button
                style={getButtonStyle("primary")}
                onMouseEnter={() => setHoveredButton("primary")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Post Item Component (No changes needed)
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

// Feed Component (No changes needed)
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

// Create Post Modal Component (No changes needed)
const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
  // ... (Keep existing modal logic and JSX) ...
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
    const postData = {
      content: content,
      author_name: currentUser?.name || currentUser?.email || "Anonymous User",
      image_url: imageUrl.trim() || null,
    };
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/feed/posts/",
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

// Main Dashboard Component (No changes needed in core logic)
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

  // Fetch User Profile
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    console.log(`fetchUserProfile called for userId: ${userId}`);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email")
        .eq("id", userId)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        return null;
      }
      console.log("Profile data fetched from DB:", data);
      return data;
    } catch (fetchError) {
      console.error("Catch Error fetching user profile:", fetchError);
      return null;
    }
  }, []);

  // Effect for Auth State Changes
  useEffect(() => {
    console.log("Auth useEffect started.");
    let initialCheckDone = false;
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
      if (!initialCheckDone) {
        console.log(
          "updateUserState: Initial check complete. Setting authLoading false."
        );
        setAuthLoading(false);
        initialCheckDone = true;
      }
    };
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
        updateUserState(session);
      })
      .catch((error) => {
        console.error("Error in getSession promise chain (.catch):", error);
        updateUserState(null);
      });
    console.log("Setting up onAuthStateChange listener...");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("onAuthStateChange triggered. Event:", _event);
        updateUserState(session);
      }
    );
    return () => {
      console.log("Cleaning up auth listener.");
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

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

  // Logout Handler
  const handleLogout = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    setAuthLoading(false);
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/signin");
    }
  };

  // Render loading state
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#111827",
          color: "white",
        }}
      >
        {" "}
        Loading Authentication...{" "}
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
