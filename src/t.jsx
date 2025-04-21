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
// If not using supabaseClient.js, uncomment and configure below:
// import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = "YOUR_SUPABASE_URL";
// const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
// const supabase = createClient(supabaseUrl, supabaseKey);

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
  FiAlertTriangle,
  FiThumbsUp,
  FiMessageCircle,
  FiShare,
  FiTrash2,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// --- Style Definitions (Includes all dashboard, modal, loading styles) ---
const styles = {
  // --- General & Layout ---
  dashboardContainer: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    fontFamily: "sans-serif",
  },
  dashboardMainContent: {
    flexGrow: 1,
    marginLeft: "256px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  dashboardScrollableArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "24px",
    paddingTop: "80px",
  },
  // --- SideNav ---
  sidenav: {
    width: "256px",
    height: "100vh",
    backgroundColor: "#161827",
    color: "#a0a3bd",
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    boxSizing: "border-box",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "width 0.3s ease",
  },
  sidenavTitle: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginBottom: "45px",
    marginTop: "10px",
    textAlign: "center",
    color: "#f0f0f5",
    letterSpacing: "1px",
  },
  sidenavTitleAccent: { color: "#8c78ff" },
  sidenavList: { listStyle: "none", padding: 0, margin: "0 10px" },
  sidenavListItem: { marginBottom: "8px" },
  sidenavLink: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#a0a3bd",
    fontWeight: "500",
    transition:
      "background-color 0.2s ease, color 0.2s ease, padding-left 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },
  sidenavLinkActive: {
    backgroundColor: "rgba(140, 120, 255, 0.1)",
    color: "#f0f0f5",
  },
  sidenavLinkHover: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#f0f0f5",
  },
  sidenavLinkIcon: {
    marginRight: "15px",
    fontSize: "1.2rem",
    flexShrink: 0,
    position: "relative",
    top: "1px",
  },
  sidenavFooter: {
    marginTop: "auto",
    padding: "20px 10px 10px 10px",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#6a6f93",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  // --- TopNav ---
  topnav: {
    backgroundColor: "#161827",
    color: "#a0a3bd",
    padding: "0 25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: "256px",
    right: 0,
    zIndex: 10,
    height: "64px",
    boxSizing: "border-box",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  topnavProfileLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "background-color 0.2s ease",
    marginLeft: "-12px",
    cursor: "pointer",
  },
  topnavProfileLinkHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  topnavProfilePic: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    marginRight: "12px",
    border: "2px solid #8c78ff",
    objectFit: "cover",
  },
  topnavProfileName: { fontWeight: 600, color: "#f0f0f5", fontSize: "0.95rem" },
  topnavSearchContainer: {
    flexGrow: 1,
    maxWidth: "42rem",
    margin: "0 25px",
    position: "relative",
  },
  topnavSearchInput: {
    width: "100%",
    padding: "9px 15px 9px 45px",
    borderRadius: "8px",
    backgroundColor: "rgba(18, 19, 38, 0.7)",
    color: "#f0f0f5",
    border: "1px solid rgba(74, 77, 109, 0.7)",
    boxSizing: "border-box",
    outline: "none",
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  },
  topnavSearchInputFocus: {
    backgroundColor: "rgba(18, 19, 38, 0.9)",
    borderColor: "#8c78ff",
    boxShadow: "0 0 0 3px rgba(140, 120, 255, 0.3)",
  },
  topnavSearchIconContainer: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6a6f93",
    fontSize: "1.1rem",
    pointerEvents: "none",
    transition: "color 0.2s ease",
  },
  topnavSearchInputFocusIcon: { color: "#8c78ff" },
  topnavActions: { display: "flex", alignItems: "center", gap: "10px" },
  topnavButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "8px",
    color: "#f0f0f5",
    backgroundColor: "rgba(74, 77, 109, 0.6)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    fontWeight: "500",
    lineHeight: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
  },
  topnavButtonHover: {
    backgroundColor: "rgba(90, 93, 125, 0.8)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  topnavButtonPrimary: { backgroundColor: "#8c78ff", color: "#ffffff" },
  topnavButtonPrimaryHover: {
    backgroundColor: "#7038d4",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 10px rgba(140, 120, 255, 0.3)",
  },
  topnavButtonSecondary: {
    backgroundColor: "transparent",
    border: "1px solid rgba(74, 77, 109, 0.8)",
  },
  topnavButtonSecondaryHover: {
    backgroundColor: "rgba(74, 77, 109, 0.4)",
    borderColor: "rgba(106, 111, 147, 1)",
    transform: "translateY(-1px)",
  },
  topnavButtonLogout: {
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    color: "#f87171",
  },
  topnavButtonLogoutHover: {
    backgroundColor: "rgba(220, 38, 38, 0.4)",
    color: "#ef4444",
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
  // --- >>> Updated Post Action Styles <<< ---
  postActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(74, 77, 109, 0.4)",
    paddingTop: "12px",
    marginTop: "15px",
  },
  postActionButtonGroup: { display: "flex", gap: "20px" },
  postActionButton: {
    background: "none",
    border: "none",
    color: "#a0a3bd",
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.9rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  postActionButtonLiked: { color: "#8c78ff", fontWeight: "600" },
  postActionButtonHover: { color: "#f0f0f5" },
  postActionButtonActive: { transform: "scale(0.95)" },
  postDeleteButton: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.9rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  postDeleteButtonHover: { color: "#f0f0f5", transform: "scale(1.05)" },
  latestComment: {
    fontSize: "0.85rem",
    color: "#a0a3bd",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px dashed rgba(74, 77, 109, 0.3)",
    wordBreak: "break-word",
  },
  commentAuthor: { fontWeight: "600", color: "#f0f0f5", marginRight: "5px" },
  buttonSpinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#f0f0f5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
  // --- >>> End Updated Post Action Styles <<< ---
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
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(13, 17, 23, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1100,
    color: "#f0f0f5",
    fontSize: "1.2rem",
  },
  setupModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1050,
  },
  setupModalContent: {
    backgroundColor: "#1f2937",
    padding: "30px 40px",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "450px",
    margin: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    color: "#f0f0f5",
  },
  setupModalIcon: { fontSize: "3rem", color: "#8c78ff", marginBottom: "15px" },
  setupModalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  setupModalText: {
    fontSize: "1rem",
    color: "#a0a3bd",
    marginBottom: "25px",
    lineHeight: "1.5",
  },
  setupModalButton: {
    padding: "12px 30px",
    fontSize: "1rem",
    width: "auto",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    backgroundColor: "#8c78ff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
  },
  setupModalButtonHover: {
    backgroundColor: "#7038d4",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 10px rgba(140, 120, 255, 0.3)",
  },
  postDeleteButton: {
    background: "none",
    border: "none",
    color: "#f87171", // Or #ff6b6b from previous
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.9rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  postDeleteButtonHover: {
    color: "#ef4444", // Or #f0f0f5 from previous
    transform: "scale(1.05)",
  },
  buttonSpinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#f0f0f5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
};

// Composite Modal Button Styles
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
  color: "#a0a3bd",
  cursor: "not-allowed",
  display: "block",
  width: "50%",
  margin: "0 auto",
  padding: "10px 16px",
};

// Animation Variants
const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
// --- Components --- (Assuming SideNav, TopNav, PostItem, Feed, CreatePostModal are defined as previously shown)

// Side Navigation Component
const SideNav = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const navItems = [
    { name: "Home", icon: <FiHome />, path: "/" },
    { name: "Explore", icon: <FiCompass />, path: "/explore" },
    { name: "Chat", icon: <FiMessageSquare />, path: "/chat" },
    { name: "Utilities", icon: <FiGrid />, path: "/documents" }, // Changed path back
    { name: "Profile", icon: <FiUser />, path: "/profile" },
    { name: "Settings", icon: <FiSettings />, path: "/settings" },
  ];
  return (
    <nav style={styles.sidenav}>
      <div style={styles.sidenavTitle}>
        {" "}
        Uni<span style={styles.sidenavTitleAccent}>Social</span>{" "}
      </div>
      <ul style={styles.sidenavList}>
        {" "}
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
              {" "}
              <Link
                to={item.path}
                style={linkStyle}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {" "}
                <span style={styles.sidenavLinkIcon}>{item.icon}</span>{" "}
                {item.name}{" "}
              </Link>{" "}
            </li>
          );
        })}{" "}
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
    ...(isSearchFocused && styles.topnavSearchInputFocusIcon),
  };
  const profileLinkStyle = {
    ...styles.topnavProfileLink,
    ...(isProfileHovered && styles.topnavProfileLinkHover),
  };

  return (
    <nav style={styles.topnav}>
      <div style={styles.topnavProfile}>
        {" "}
        {isAuthenticated && user ? (
          <Link
            to="/profile"
            style={profileLinkStyle}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            {" "}
            <img
              src={
                user.profilePicUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${
                  user.email || "default"
                }`
              }
              alt={user.name || "User"}
              style={styles.topnavProfilePic}
            />{" "}
            <span style={styles.topnavProfileName}>
              {" "}
              {user.name || user.email || "User"}{" "}
            </span>{" "}
          </Link>
        ) : (
          <div style={{ height: "40px", width: "40px" }}></div>
        )}{" "}
      </div>
      <div style={styles.topnavSearchContainer}>
        {" "}
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={searchInputStyle}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />{" "}
        <div style={searchIconStyle}>
          {" "}
          <FiSearch />{" "}
        </div>{" "}
      </div>
      <div style={styles.topnavActions}>
        {" "}
        {isAuthenticated ? (
          <>
            {" "}
            <button
              style={getButtonStyle("primary")}
              onClick={onOpenCreatePost}
              onMouseEnter={() => setHoveredButton("primary")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {" "}
              <FiPlus size="1.1em" /> Create Post{" "}
            </button>{" "}
            <button
              style={getButtonStyle("logout")}
              onClick={onLogout}
              onMouseEnter={() => setHoveredButton("logout")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {" "}
              <FiLogOut size="1.1em" /> Logout{" "}
            </button>{" "}
          </>
        ) : (
          <>
            {" "}
            <Link to="/signin">
              {" "}
              <button
                style={getButtonStyle("secondary")}
                onMouseEnter={() => setHoveredButton("secondary")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {" "}
                <FiLogIn size="1.1em" /> Login{" "}
              </button>{" "}
            </Link>{" "}
            <Link to="/signup2">
              {" "}
              <button
                style={getButtonStyle("primary")}
                onMouseEnter={() => setHoveredButton("primary")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {" "}
                Register{" "}
              </button>{" "}
            </Link>{" "}
          </>
        )}{" "}
      </div>
    </nav>
  );
};

// Post Item Component
const PostItem = ({ post, currentUser, onDeletePost, onLikePost }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post?.is_liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    setIsLiked(post?.is_liked_by_user || false);
    setLikeCount(post?.like_count || 0);
  }, [post]);

  console.log(`PostItem Render - Post ID: ${post?.id}`);
  console.log("currentUser:", currentUser);
  console.log("post:", post);
  console.log(
    "currentUser?.id:",
    currentUser?.id,
    "(Type:",
    typeof currentUser?.id,
    ")"
  );
  console.log(
    "post?.author_id:",
    post?.author_id,
    "(Type:",
    typeof post?.author_id,
    ")"
  );

  const authorAvatarSrc =
    post?.author_profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${
      post?.author_name || "anon"
    }`;

  const handleLikeClick = async () => {
    if (!currentUser || isLiking) return;
    setIsLiking(true);
    try {
      const response = await onLikePost(post.id, isLiked);
      setIsLiked(response.status === "liked");
      setLikeCount(response.like_count);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteClick = async () => {
    const isAuthorCheck = // Recalculate for safety inside handler if needed
      currentUser && post?.author_id && currentUser.id === post.author_id;
    console.log("Calculated isAuthor inside handleDeleteClick:", isAuthorCheck);

    if (!isAuthorCheck || isDeleting) {
      console.log("Delete check failed or already deleting.");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        await onDeletePost(post.id); // Call prop passed from Dashboard
      } catch (error) {
        console.error("Delete failed (caught in PostItem):", error);
        setIsDeleting(false);
      }
      // Don't reset isDeleting on success, component should unmount
    }
  };

  const handleCommentClick = () => {
    if (post?.id) navigate(`/post/${post.id}/comments`);
  };

  const handleShare = () => {
    if (post?.id) {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard
        .writeText(postUrl)
        .then(() => alert("Post link copied!"))
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const getActionStyle = (actionName) => {
    // Simplified: isLiked handled by state
    const base = styles.postActionButton;
    const isButtonHovered = hoveredAction === actionName;
    let specific = {};
    let hover = styles.postActionButtonHover;

    if (actionName === "like" && isLiked) {
      // Check component state 'isLiked'
      specific = styles.postActionButtonLiked;
      hover = {}; // Don't apply hover style if liked? Or adjust as needed
    }
    if (actionName === "delete") {
      specific = styles.postDeleteButton; // Use the correct delete style
      hover = styles.postDeleteButtonHover;
    }

    return { ...base, ...specific, ...(isButtonHovered && hover) };
  };

  // Define isAuthor once for use in JSX
  const isAuthor =
    currentUser && post?.author_id && currentUser.id === post.author_id;

  if (!post) return null;

  console.log("Calculated isAuthor (for render):", isAuthor);

  return (
    <motion.div
      style={styles.postItem}
      variants={cardVariants}
      layout
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
    >
      <div style={styles.postHeader}>
        <img
          src={authorAvatarSrc}
          alt={post.author_name || "User"}
          style={styles.postAuthorAvatar}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${
              post?.author_name || "anon"
            }`;
          }}
        />
        <div>
          <p style={styles.postAuthorName}>{post.author_name || "Anonymous"}</p>
          <p style={styles.postTimestamp}>
            {post.timestamp
              ? new Date(post.timestamp).toLocaleString()
              : "No date"}
          </p>
        </div>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="Post content" style={styles.postImage} /> // Added better alt text
      )}
      <p style={styles.postContent}>{post.content || ""}</p>

      {post.latest_comment && (
        <div style={styles.latestComment}>
          <span style={styles.commentAuthor}>
            {post.latest_comment.author_name || "Anon"}:
          </span>{" "}
          {post.latest_comment.content}
        </div>
      )}

      <div style={styles.postActions}>
        <div style={styles.postActionButtonGroup}>
          {/* Like Button */}
          <button
            style={getActionStyle("like")}
            onClick={handleLikeClick}
            disabled={isLiking || !currentUser}
            onMouseEnter={() => setHoveredAction("like")}
            onMouseLeave={() => setHoveredAction(null)}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isLiking ? (
              <div style={styles.buttonSpinnerSmall}></div>
            ) : (
              <FiThumbsUp />
            )}
            <span style={{ marginLeft: isLiking ? "8px" : "0" }}>
              {likeCount} Like{likeCount !== 1 ? "s" : ""}
            </span>
          </button>

          {/* Comment Button */}
          <button
            style={getActionStyle("comment")}
            onClick={handleCommentClick}
            onMouseEnter={() => setHoveredAction("comment")}
            onMouseLeave={() => setHoveredAction(null)}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiMessageCircle /> Comment
          </button>

          {/* Share Button */}
          <button
            style={getActionStyle("share")}
            onClick={handleShare}
            onMouseEnter={() => setHoveredAction("share")}
            onMouseLeave={() => setHoveredAction(null)}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiShare /> Share
          </button>
        </div>

        {/* --- Single Delete Button --- */}
        {isAuthor && ( // Use the isAuthor variable
          <button
            style={getActionStyle("delete")}
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete Post"
            onMouseEnter={() => setHoveredAction("delete")}
            onMouseLeave={() => setHoveredAction(null)}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isDeleting ? (
              <div style={styles.buttonSpinnerSmall}></div>
            ) : (
              <FiTrash2 /> // Use the correct icon component
            )}
          </button>
        )}
        {/* --- End Single Delete Button --- */}
      </div>
    </motion.div>
  );
};
// --- UPDATED: Feed Component ---
// Passes handlers down to PostItem
const Feed = ({ posts, loading, error, user, onDeletePost, onLikePost }) => {
  // Added onDeletePost, onLikePost
  const errorCombinedStyle = {
    ...styles.feedStatusMessage,
    ...styles.feedErrorMessage,
  };
  const validPosts = Array.isArray(posts) ? posts : [];
  return (
    <motion.div layout style={styles.feedContainer}>
      <h2 style={styles.feedTitle}>Live Feed</h2>
      {loading && <p style={styles.feedStatusMessage}>Loading feed...</p>}
      {error && <p style={errorCombinedStyle}>{error}</p>}
      {!loading && !error && Array.isArray(posts) && posts.length === 0 && (
        <p style={styles.feedStatusMessage}>
          {" "}
          No posts yet. Be the first to share!{" "}
        </p>
      )}
      <AnimatePresence>
        {!loading &&
          !error &&
          validPosts.map((post) => (
            <motion.div
              key={post?.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PostItem
                post={post}
                currentUser={user}
                onDeletePost={onDeletePost} // <<< Check props passed
                onLikePost={onLikePost} // <<< Check props passed
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
};
// const profileurl = "";
// Create Post Modal Component
const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
  // ... (Keep existing modal logic and JSX) ...
  console.log("--- CreatePostModal RENDERED --- isOpen:", isOpen);
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
    if (!isOpen) {
      console.log(
        "CreatePostModal returning null because isOpen is false/falsy."
      ); // Add this log
      return null; // If isOpen is false, nothing is rendered
    }
    event.preventDefault();
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    // console.log(currentUser?.id, "THIS IS THE ID");
    const postData = {
      content: content,
      author_name: currentUser?.name || currentUser?.email || "Anonymous User",
      user_id: currentUser?.id || "Anonymous user",
      author_email: currentUser.email,
      image_url: imageUrl.trim() || null,
    };
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/feed/posts/",
        postData
      );
      console.log("I PRINTED THIS", response.data);
      // profileurl = response.data.profilePicUrl;
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
  console.log("CreatePostModal rendering content because isOpen is true.");
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalCloseButton} onClick={onClose}>
          {" "}
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

// Setup Profile Modal Component
const SetupProfileModal = ({ onNavigateToProfile }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Use the correct composite style objects
  const buttonStyle = {
    ...styles.setupModalButton,
    ...(isHovered && styles.setupModalButtonHover),
  };

  return (
    <div style={styles.setupModalOverlay}>
      {" "}
      {/* Use overlay style */}
      <motion.div
        style={styles.setupModalContent}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div style={styles.setupModalIcon}>
          <FiAlertTriangle />
        </div>
        <h2 style={styles.setupModalTitle}>Complete Your Profile</h2>
        <p style={styles.setupModalText}>
          {" "}
          Welcome! Please set up your profile details (name, batch, school,
          major) to unlock all features and connect with others.{" "}
        </p>
        <motion.button
          style={buttonStyle}
          onClick={onNavigateToProfile}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {" "}
          Go to Profile Setup{" "}
        </motion.button>
      </motion.div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Holds {id, email, name, profilePicUrl}
  const [authLoading, setAuthLoading] = useState(true);
  // Profile Status State
  const [profileStatus, setProfileStatus] = useState("loading");

  const navigate = useNavigate();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [errorFeed, setErrorFeed] = useState(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch User Profile function remains (not used in auth check anymore)
  const fetchUserProfile = useCallback(async (userId) => {
    /* ... keep implementation ... */
  }, []);

  // Effect for Auth State Changes (Using Email Profile Check - INSECURE)
  useEffect(() => {
    console.log("Auth useEffect started.");
    let initialCheckDone = false;
    setAuthLoading(true);
    setProfileStatus("loading");

    const checkProfileAndSetState = async (session) => {
      if (session?.user?.email) {
        const userEmail = session.user.email;
        console.log(
          `checkProfileAndSetState: Setting auth true. User Email: ${userEmail}`
        );
        setIsAuthenticated(true);
        // Set basic user state immediately
        const basicUser = {
          id: session.user.id,
          email: userEmail,
          name: userEmail,
        };
        setUser(basicUser);

        console.log(
          "checkProfileAndSetState: Checking profile existence via email..."
        );
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
              userEmail
            )}`
          );
          console.log(
            "checkProfileAndSetState: Profile check successful (profile exists). Data:",
            response.data
          );
          setProfileStatus("exists");
          // Update user state with more details from profile
          setUser((prevUser) => ({
            ...prevUser,
            name: response.data?.name || prevUser?.name,
            profilePicUrl: response.data?.profile_pic_url, // Add pic URL
          }));
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.log(
              "checkProfileAndSetState: Profile check returned 404 (profile missing)."
            );
            setProfileStatus("missing");
          } else if (err.response && err.response.status === 403) {
            console.error(
              "checkProfileAndSetState: Permission error during profile check:",
              err.response.data || err.message
            );
            setProfileStatus("error");
            setErrorFeed("Permission error checking profile.");
          } else {
            console.error(
              "checkProfileAndSetState: Other error during profile check:",
              err.message
            );
            setProfileStatus("error");
            setErrorFeed("Error checking profile status.");
          }
        }
      } else {
        console.log(
          "checkProfileAndSetState: No session/email. Setting auth false, user null. Profile not needed."
        );
        setUser(null);
        setIsAuthenticated(false);
        setProfileStatus("not_needed");
      }
      if (!initialCheckDone) {
        console.log(
          "checkProfileAndSetState: Initial check complete. Setting authLoading false."
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
        checkProfileAndSetState(session);
      })
      .catch((error) => {
        console.error("Error in getSession promise chain (.catch):", error);
        checkProfileAndSetState(null);
      });

    console.log("Setting up onAuthStateChange listener...");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("onAuthStateChange triggered. Event:", _event);
        setAuthLoading(true);
        initialCheckDone = false;
        checkProfileAndSetState(session);
      }
    );
    return () => {
      console.log("Cleaning up auth listener.");
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Removed fetchUserProfile from dependency array

  // Fetching Logic for Feed Posts (Depends on profileStatus)
  const fetchPosts = useCallback(async () => {
    if (profileStatus !== "exists") {
      console.log("Skipping feed fetch: Profile status is", profileStatus);
      setLoadingFeed(false);
      setPosts([]);
      return;
    }
    console.log("Fetching feed posts...");
    setLoadingFeed(true);
    setErrorFeed(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/feed/posts/");
      const postsData = response.data.results || response.data;

      // --- >>> ADD THIS LOG <<< ---
      console.log(
        "RAW FEED DATA FROM BACKEND:",
        JSON.stringify(postsData, null, 2)
      );
      // --- >>> END LOG <<< ---

      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        console.error("Feed API response is not an array:", postsData);
        setErrorFeed("Unexpected feed data format.");
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setErrorFeed("Failed to load feed.");
    } finally {
      setLoadingFeed(false);
    }
  }, [profileStatus]);

  // Fetch posts when profileStatus changes to 'exists'
  useEffect(() => {
    if (profileStatus === "exists") {
      fetchPosts();
    } else {
      setPosts([]);
      setLoadingFeed(false);
    }
  }, [profileStatus, fetchPosts]);

  // Modal Handlers
  const handleLikePost = useCallback(
    async (postId) => {
      // No isLiked parameter needed if backend toggles
      // --- >>> Get User NAME from state <<< ---
      if (!user || !user.name) {
        // Check for user and user.name
        console.error(
          "User name not available in Dashboard state. Cannot like post."
        );
        // Optionally check if name is just the email and prevent liking?
        if (user && user.name === user.email) {
          alert(
            "Please complete your profile (set a name) before liking posts."
          );
          throw new Error("User name missing (is email)");
        } else {
          alert(
            "Authentication error or missing name. Please ensure you are logged in and profile is complete."
          );
          throw new Error("User name missing");
        }
      }
      const userName = user.name; // Get the name from the user state
      const userIdForLogging = user.id; // Keep ID for logging if needed
      // --- >>> End Get User Name <<< ---

      console.log(
        `Attempting to toggle like for post ${postId} by user name: '${userName}' (ID: ${userIdForLogging})`
      );

      try {
        // --- >>> Send User NAME in Request Body <<< ---
        const response = await axios.post(
          `http://127.0.0.1:8000/api/feed/posts/${postId}/like/`,
          // Send the user NAME instead of the ID
          { user_name: userName }
        );
        // --- >>> End Body Change <<< ---

        console.log(`Like toggle successful for ${postId}:`, response.data);
        return {
          status: response.data?.status,
          like_count: response.data?.like_count,
        };
      } catch (error) {
        console.error(
          `Like toggle error for post ${postId}:`,
          error.response?.data || error.message
        );
        // Adjust error messages if needed
        if (error.response?.status === 404) {
          alert("Post not found."); // 404 now likely means only Post not found
        } else if (
          error.response?.status === 400 &&
          error.response?.data?.detail?.includes("blank")
        ) {
          alert("Cannot like with a blank username."); // Specific error for blank name
        } else {
          alert("Failed to update like status.");
        }
        throw error;
      }
    },
    [user] // Keep user dependency
  ); // Empty dependency array is fine if it only relies on props passed in

  // --- >>> NEW: Delete Post Handler <<< ---
  const handleDeletePost = useCallback(async (postId) => {
    const sessionData = await supabase.auth.getSession();
    const token = sessionData?.data?.session?.access_token;
    if (!token) {
      alert("Please log in again.");
      throw new Error("No token");
    }
    const currentUserId = user?.id;
    console.log("this is user id::::", currentUserId);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/feed/posts/${postId}/`, {
        data: { user_id: currentUserId },
      });
      // Remove post directly from Dashboard state after successful deletion
      setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error(`Delete error:`, error.response?.data || error.message);
      let errorMsg = "Could not delete post.";
      if (error.response?.status === 403)
        errorMsg = "You don't have permission to delete this post.";
      if (error.response?.status === 401) errorMsg = "Authentication failed.";
      alert(errorMsg); // Show feedback
      throw error; // Re-throw error
    }
  }, []);
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    console.log("Setting isCreateModalOpen to true.");
    setIsCreateModalOpen(true);
  };
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Logout Handler
  const handleLogout = async () => {
    setAuthLoading(true); // Show loading during logout transition
    const { error } = await supabase.auth.signOut();
    // No need to manually set authLoading false here, listener will handle state update
    if (error) {
      console.error("Error logging out:", error);
      setAuthLoading(false); /* Handle error display */
    } else {
      navigate("/signin");
    } // Navigate after sign out attempt
  };

  // Navigation handler for Setup Profile modal
  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  // Render Loading States
  if (authLoading) {
    return <div style={styles.loadingOverlay}> Loading Authentication... </div>;
  }
  if (isAuthenticated && profileStatus === "loading") {
    return <div style={styles.loadingOverlay}> Checking Profile... </div>;
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
          {isAuthenticated &&
          (profileStatus === "exists" || profileStatus === "missing") ? (
            <Feed
              posts={posts}
              loading={loadingFeed}
              error={errorFeed}
              user={user}
              // --- >>> Pass handlers down <<< ---
              onDeletePost={handleDeletePost}
              onLikePost={handleLikePost}
              // --- >>> End Pass <<< ---
            />
          ) : isAuthenticated && profileStatus === "error" ? (
            <p style={styles.feedStatusMessage}>
              {errorFeed || "Error checking profile."}
            </p>
          ) : null}
        </main>
      </div>
      <AnimatePresence>
        {" "}
        {isAuthenticated && profileStatus === "missing" && (
          <SetupProfileModal onNavigateToProfile={handleNavigateToProfile} />
        )}{" "}
      </AnimatePresence>
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
