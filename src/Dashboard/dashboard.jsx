// src/Dashboard.jsx

import React, { useState, useEffect, useCallback, useReducer } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Chatbot from "../Features/chatbot";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  FiAlertTriangle,
  FiThumbsUp,
  FiMessageCircle,
  FiShare,
  FiTrash2,
  FiX,
  FiImage,
  FiLoader,
  FiCornerDownRight,
  FiChevronsRight,
  FiUsers,
  FiInfo,
  // FaPeopleGroup // Add this import
} from "react-icons/fi";
import { MdGroups } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail } from "react-icons/fi";

// --- Style Definitions (Includes all dashboard, modal, loading styles) ---
const styles = {
  // --- General & Layout ---
  dashboardContainer: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    fontFamily: "sans-serif",
    overflowY: "auto", // <<< Enable vertical scroll for the whole page if content overflows
    // Custom scrollbar styles for the page container
    scrollbarWidth: "thin", // Firefox
    scrollbarColor: "rgba(156, 141, 255, 0.6) transparent",
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
  // --- Modal General ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  }, // Slightly darker overlay
  // --- Create Post Modal Enhanced Styles ---
  modalContentEnhanced: {
    backgroundColor: "#161827",
    padding: "30px 35px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
    width: "90%",
    maxWidth: "550px",
    position: "relative",
    border: "1px solid #4b5563",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  modalCloseButtonEnhanced: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "rgba(74, 77, 109, 0.3)",
    border: "none",
    color: "#a0a3bd",
    fontSize: "1.2rem",
    cursor: "pointer",
    lineHeight: "1",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  modalCloseButtonEnhancedHover: {
    backgroundColor: "rgba(90, 93, 125, 0.6)",
    color: "#f0f0f5",
  },
  modalTitleEnhanced: {
    marginTop: 0,
    marginBottom: "5px",
    color: "#f0f0f5",
    textAlign: "center",
    fontSize: "1.4rem",
    fontWeight: "600",
  },
  modalFormTextAreaEnhanced: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 15px",
    borderRadius: "8px",
    backgroundColor: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #4b5563",
    boxSizing: "border-box",
    resize: "vertical",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  modalFormTextAreaEnhancedFocus: {
    borderColor: "#8c78ff",
    boxShadow: "0 0 0 3px rgba(140, 120, 255, 0.3)",
  },
  fileInputLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 15px",
    borderRadius: "8px",
    backgroundColor: "#1f2937",
    color: "#a0a3bd",
    border: "1px dashed #4b5563",
    cursor: "pointer",
    transition:
      "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
    textAlign: "center",
    fontSize: "0.9rem",
    gap: "8px",
  },
  fileInputLabelHover: {
    backgroundColor: "#374151",
    borderColor: "#8c78ff",
    color: "#f0f0f5",
  },
  fileInputHidden: {
    width: "0.1px",
    height: "0.1px",
    opacity: 0,
    overflow: "hidden",
    position: "absolute",
    zIndex: -1,
  },
  imagePreviewContainer: {
    marginTop: "5px",
    marginBottom: "5px",
    position: "relative",
    maxWidth: "100%",
    maxHeight: "200px",
    alignSelf: "center",
  },
  imagePreviewImg: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    border: "1px solid #4b5563",
    objectFit: "contain",
  },
  removeImageButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    fontSize: "0.8rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1",
    padding: "0",
    transition: "background-color 0.2s ease",
  },
  removeImageButtonHover: { backgroundColor: "rgba(255, 0, 0, 0.7)" },
  modalSubmitButtonContainer: { marginTop: "10px", textAlign: "center" },
  modalErrorEnhanced: {
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    textAlign: "center",
    fontSize: "0.9rem",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  // --- Loading & Setup Modals ---
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
  // --- Keyframes ---
  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
  postDeleteButton: {
    // <<< Ensure this exists
    background: "none",
    border: "none",
    color: "#ff6b6b", // Or your preferred delete color
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.9rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  postDeleteButtonHover: {
    // <<< Ensure this exists
    color: "#f0f0f5", // Or a brighter red? e.g., #f87171
    transform: "scale(1.05)",
  },
  latestCommentContainer: {
    // New container to hold comment and view more button
    display: "flex",
    justifyContent: "space-between", // Pushes button to the right
    alignItems: "flex-start", // Align items at the top
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(74, 77, 109, 0.5)", // Solid border
    backgroundColor: "rgba(31, 41, 55, 0.3)",
    padding: "10px 12px",
    borderRadius: "6px",
  },
  latestCommentTextWrapper: {
    // Wrapper for icon and text
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    flexGrow: 1, // Allow text to take up space
    marginRight: "10px", // Add space before the button
  },
  latestCommentIcon: {
    flexShrink: 0,
    color: "#8c78ff",
    position: "relative",
    top: "3px", // Align icon nicely with text
    fontSize: "1rem",
  },
  latestCommentContent: {
    // Styles for the text part (author + comment)
    flexGrow: 1,
    fontSize: "0.85rem",
    color: "#a0a3bd",
    wordBreak: "break-word",
  },
  // commentAuthor: { fontWeight: "600", color: "#f0f0f5", marginRight: "5px" },
  viewMoreCommentsButton: {
    // Style for the "View More" button
    background: "none",
    border: "none",
    color: "#a0a3bd",
    cursor: "pointer",
    padding: "3px 5px", // Small padding
    fontSize: "0.8rem", // Smaller font size
    fontWeight: "500",
    borderRadius: "4px",
    transition: "color 0.2s ease, background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0, // Prevent button from shrinking
    marginTop: "2px", // Align slightly better with text top
    whiteSpace: "nowrap", // Prevent text wrapping
  },
  viewMoreCommentsButtonHover: {
    color: "#f0f0f5",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
};

const modalSubmitButtonStyleEnhanced = {
  ...styles.topnavButton,
  ...styles.topnavButtonPrimary,
  width: "auto",
  minWidth: "120px",
  padding: "12px 30px",
  fontSize: "1rem",
  fontWeight: "600",
};

const modalSubmitButtonDisabledStyleEnhanced = {
  ...styles.topnavButton,
  backgroundColor: "#4b5563",
  color: "#a0a3bd",
  cursor: "not-allowed",
  width: "auto",
  minWidth: "120px",
  padding: "12px 30px",
  fontSize: "1rem",
  fontWeight: "600",
};

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
import { IoIosPeople } from "react-icons/io";

export const SideNav = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const navItems = [
    { name: "Home", icon: <FiHome />, path: "/" },

    { name: "Chat", icon: <FiMessageSquare />, path: "/chat" },
    { name: "Utilities", icon: <FiGrid />, path: "/documents" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
    { name: "Communities", icon: <IoIosPeople />, path: "/communities" },
    { name: "Meetup", icon: <MdGroups />, path: "/meetup" },
    { name: "Societies", icon: <FiUsers />, path: "/society" },
    { name: "Emails", icon: <FiMail />, path: "/email-dashboard" },
    { name: "About Us", icon: <FiInfo />, path: "/about-us" },
    { name: "Settings", icon: <FiSettings />, path: "/settings" },
  ];
  return (
    <nav style={styles.sidenav}>
      <div style={styles.sidenavTitle}>
        {" "}
        Super<span style={styles.sidenavTitleAccent}>LUMS</span>{" "}
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
      <div style={styles.sidenavFooter}>© 2024 SuperLums</div>
    </nav>
  );
};

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
              data-testid="create-post-button-topnav"
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isViewMoreHovered, setIsViewMoreHovered] = useState(false);

  useEffect(() => {
    setIsLiked(post?.is_liked_by_user || false);
    setLikeCount(post?.like_count || 0);
  }, [post]);
  useEffect(() => {
    `[PostItem Render/Prop Update] Post ID: ${post?.id}, Received comment_count prop: ${post?.comment_count}`;
  }, [post]);

  `PostItem Render - Post ID: ${post?.id}`;
  "currentUser:", currentUser;
  "post:", post;
  "currentUser?.id:", currentUser?.id, "(Type:", typeof currentUser?.id, ")";
  "post?.author_id:", post?.author_id, "(Type:", typeof post?.author_id, ")";

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

  const handleDeleteClick = () => {
    if (!isAuthor || isDeleting) return; // Prevent opening if already deleting
    setIsConfirmModalOpen(true); // <<<--- Open the modal
  };

  // --- New: Handles the actual deletion after confirmation ---
  const handleConfirmDelete = async () => {
    if (!isAuthor) return; // Double check permission

    setIsDeleting(true); // Show spinner IN THE MODAL
    try {
      await onDeletePost(post.id); // Call prop passed from Dashboard
      // No need to close modal here, component will unmount on success
      // No need to setIsDeleting(false) on success
    } catch (error) {
      console.error(
        "Delete failed (error caught in PostItem on confirm):",
        error
      );
      // Alert is handled in Dashboard's handler
      setIsDeleting(false); // Stop spinner on failure
      setIsConfirmModalOpen(false); // Close modal on failure to show alert
    }
  };

  // --- New: Handles cancellation ---
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
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
      specific = styles.postDeleteButton;
      hover = styles.postDeleteButtonHover;
    }

    return { ...base, ...specific, ...(isButtonHovered && hover) };
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.3 } },
  };
  // Define isAuthor once for use in JSX
  const isAuthor =
    currentUser && post?.author_id && currentUser.id === post.author_id;
  const viewMoreButtonStyle = {
    ...styles.viewMoreCommentsButton,
    ...(isViewMoreHovered && styles.viewMoreCommentsButtonHover),
  };
  if (!post) return null;

  "Calculated isAuthor (for render):", isAuthor;
  const profileLinkTarget = post?.author_email
    ? `/profile/email/${encodeURIComponent(post.author_email)}`
    : "#";
  return (
    <>
      <motion.div
        data-testid={`post-item-${post?.id}`}
        style={styles.postItem} /* ... */
      >
        <div style={styles.postHeader}>
          <Link
            to={profileLinkTarget}
            title={`View ${post.author_name || "User"}'s profile`}
          >
            <img
              src={authorAvatarSrc}
              data-testid="post-image"
              alt={post.author_name || "User"}
              style={styles.postAuthorAvatar} /* ... */
            />
          </Link>
          {/* <p data-testid="post-content" style={styles.postContent}>{post.content || ""}</p> */}
          <div>
            <Link to={profileLinkTarget} style={{ textDecoration: "none" }}>
              <p style={styles.postAuthorName}>
                {post.author_name || "Anonymous"}
              </p>
              <p style={styles.postTimestamp}>
                {post.timestamp
                  ? new Date(post.timestamp).toLocaleString()
                  : "No date"}
              </p>
            </Link>
            <p style={styles.postTimestamp}>{/* ... */}</p>
          </div>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post content"
            style={styles.postImage}
          /> // Added better alt text
        )}
        <p data-testid="post-content" style={styles.postContent}>
          {post.content || ""}
        </p>

        {post.latest_comment && (
          <div style={styles.latestCommentContainer}>
            <div style={styles.latestCommentTextWrapper}>
              <FiCornerDownRight style={styles.latestCommentIcon} />
              <div style={styles.latestCommentContent}>
                <span style={styles.commentAuthor}>
                  {post.latest_comment.author_name || "Anon"}:
                </span>
                {post.latest_comment.content}
              </div>
            </div>

            <button
              style={viewMoreButtonStyle}
              onClick={handleCommentClick}
              onMouseEnter={() => setIsViewMoreHovered(true)}
              onMouseLeave={() => setIsViewMoreHovered(false)}
              aria-label="View all comments"
            >
              View More <FiChevronsRight size="0.9em" />
            </button>
          </div>
        )}

        <div style={styles.postActions}>
          <div style={styles.postActionButtonGroup}>
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
              <FiMessageCircle />
              {post.comment_count ?? 0} Comment
              {(post.comment_count ?? 0) !== 1 ? "s" : ""}
            </button>

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

          {isAuthor && (
            <button
              data-testid="delete-post-button"
              style={getActionStyle("delete")}
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Delete Post"
              onMouseEnter={() => setHoveredAction("delete")}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {isConfirmModalOpen && (
          <ConfirmDeleteModal
            isOpen={isConfirmModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            itemName="post"
          />
        )}
      </AnimatePresence>
    </>
  );
};

const Feed = ({ posts, loading, error, user, onDeletePost, onLikePost }) => {
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
        <div data-testid="feed-post-list">
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
                  onDeletePost={onDeletePost}
                  onLikePost={onLikePost}
                />
              </motion.div>
            ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
  "--- CreatePostModal RENDERED --- isOpen:", isOpen;
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isFileLabelHovered, setIsFileLabelHovered] = useState(false);

  useEffect(() => {
    if (!isOpen || !selectedFile) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    }

    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [isOpen, selectedFile]);
  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setSelectedFile(null);

      setError(null);
      setIsSubmitting(false);
      setIsTextAreaFocused(false);
    }
  }, [isOpen]);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);

      setImagePreviewUrl(URL.createObjectURL(file));
      setError(null);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
      if (file) {
        setError("Please select a valid image file (JPEG, PNG, GIF, etc.).");
      }
    }
  };
  const handleRemoveImage = () => {
    setSelectedFile(null);

    const fileInput = document.getElementById("post-image-upload");
    if (fileInput) fileInput.value = null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !selectedFile) {
      setError("Please write something or add an image to your post.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append("content", content);
    formData.append(
      "author_name",
      currentUser?.name || currentUser?.email || "Anonymous User"
    );
    formData.append("user_id", currentUser?.id || "Anonymous user");
    formData.append("author_email", currentUser?.email);

    if (selectedFile) {
      formData.append("image_file", selectedFile);
    }

    ("Submitting Post Data:");
    for (let [key, value] of formData.entries()) {
      `${key}:`, value instanceof File ? value.name : value;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/feed/posts/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      "Post created successfully:", response.data;
      onPostCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      let errorMessage = "Failed to create post. Please try again.";
      if (err.response && err.response.data) {
        const errors = err.response.data;
        let messages = "";
        if (typeof errors === "object" && errors !== null) {
          messages = Object.entries(errors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join("; ");
        } else if (typeof errors === "string") {
          messages = errors;
        }
        if (messages) errorMessage = messages;
      } else if (err.request) {
        errorMessage = "Network error. Could not reach the server.";
      } else {
        errorMessage = `An unexpected error occurred: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } },
  };

  const closeButtonStyle = {
    ...styles.modalCloseButtonEnhanced,
    ...(isCloseHovered && styles.modalCloseButtonEnhancedHover),
  };

  const fileLabelStyle = {
    ...styles.fileInputLabel,
    ...(isFileLabelHovered && styles.fileInputLabelHover),
  };

  const submitButtonStyle = isSubmitting
    ? styles.modalSubmitButtonDisabledStyleEnhanced
    : styles.modalSubmitButtonStyleEnhanced;

  const textAreaStyle = {
    ...styles.modalFormTextAreaEnhanced,
    ...(isTextAreaFocused && styles.modalFormTextAreaEnhancedFocus),
  };

  if (!isOpen) return null;

  return (
    <motion.div
      style={styles.modalOverlay}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        data-testid="create-post-modal-content"
        style={styles.modalContentEnhanced}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          data-testid="modal-close-button"
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          aria-label="Close create post modal"
        >
          <FiX />
        </button>

        <h3 style={styles.modalTitleEnhanced}>Create New Post</h3>

        {error && (
          <p
            data-testid="modal-error-message"
            style={styles.modalErrorEnhanced}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <textarea
            data-testid="post-content-textarea"
            placeholder={`What's on your mind, ${currentUser?.name || "User"}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={textAreaStyle}
            required={!selectedFile}
            disabled={isSubmitting}
            rows={5}
            onFocus={() => setIsTextAreaFocused(true)}
            onBlur={() => setIsTextAreaFocused(false)}
          />

          <input
            data-testid="post-image-input"
            type="file"
            id="post-image-upload"
            style={styles.fileInputHidden}
            onChange={handleFileChange}
            accept="image/*"
            disabled={isSubmitting}
          />

          <label
            htmlFor="post-image-upload"
            style={fileLabelStyle}
            onMouseEnter={() => setIsFileLabelHovered(true)}
            onMouseLeave={() => setIsFileLabelHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
            }}
          >
            <FiImage />
            {selectedFile
              ? `Image: ${selectedFile.name}`
              : "Add Photo (Optional)"}
          </label>

          {imagePreviewUrl && (
            <div
              data-testid="image-preview-container"
              style={styles.imagePreviewContainer}
            >
              <img
                src={imagePreviewUrl}
                alt="Selected preview"
                style={styles.imagePreviewImg}
              />
              <button
                data-testid="remove-image-button"
                type="button"
                style={styles.removeImageButton}
                onClick={handleRemoveImage}
                aria-label="Remove selected image"
              >
                <FiX size="0.8em" />
              </button>
            </div>
          )}

          <div style={styles.modalSubmitButtonContainer}>
            <motion.button
              data-testid="post-submit-button"
              type="submit"
              style={submitButtonStyle}
              disabled={isSubmitting}
              whileHover={
                !isSubmitting
                  ? { scale: 1.05, transition: { duration: 0.2 } }
                  : {}
              }
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <FiLoader style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ marginLeft: "8px" }}>Posting...</span>
                </>
              ) : (
                "Post"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profileStatus, setProfileStatus] = useState("loading");

  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [errorFeed, setErrorFeed] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // const fetchUserProfile = useCallback(async (userId) => {
  //   /* ... keep implementation ... */
  // }, []);

  useEffect(() => {
    ("Auth useEffect started.");
    let initialCheckDone = false;
    setAuthLoading(true);
    setProfileStatus("loading");

    const checkProfileAndSetState = async (session) => {
      if (session?.user?.email) {
        const userEmail = session.user.email;
        `checkProfileAndSetState: Setting auth true. User Email: ${userEmail}`;
        setIsAuthenticated(true);

        const basicUser = {
          id: session.user.id,
          email: userEmail,
          name: userEmail,
        };
        setUser(basicUser);

        ("checkProfileAndSetState: Checking profile existence via email...");
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
              userEmail
            )}`
          );
          "checkProfileAndSetState: Profile check successful (profile exists). Data:",
            response.data;
          setProfileStatus("exists");

          setUser((prevUser) => ({
            ...prevUser,
            name: response.data?.name || prevUser?.name,
            profilePicUrl: response.data?.profile_pic_url,
          }));
        } catch (err) {
          if (err.response && err.response.status === 404) {
            ("checkProfileAndSetState: Profile check returned 404 (profile missing).");
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
        ("checkProfileAndSetState: No session/email. Setting auth false, user null. Profile not needed.");
        setUser(null);
        setIsAuthenticated(false);
        setProfileStatus("not_needed");
      }
      if (!initialCheckDone) {
        ("checkProfileAndSetState: Initial check complete. Setting authLoading false.");
        setAuthLoading(false);
        initialCheckDone = true;
      }
    };

    ("Checking initial Supabase session...");
    supabase.auth
      .getSession()
      .then(({ data: { session }, error: sessionError }) => {
        "Initial getSession resolved. Session:",
          session,
          "Error:",
          sessionError;
        if (sessionError) {
          console.error("Error directly from getSession:", sessionError);
        }
        checkProfileAndSetState(session);
      })
      .catch((error) => {
        console.error("Error in getSession promise chain (.catch):", error);
        checkProfileAndSetState(null);
      });

    ("Setting up onAuthStateChange listener...");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        "onAuthStateChange triggered. Event:", _event;
        setAuthLoading(true);
        initialCheckDone = false;
        checkProfileAndSetState(session);
      }
    );
    return () => {
      ("Cleaning up auth listener.");
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchPosts = useCallback(
    async (showLoading = true) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user || profileStatus !== "exists") {
        ("Skipping feed fetch: Not authenticated or profile doesn't exist.");
        setLoadingFeed(false);

        return;
      }
      if (showLoading) setLoadingFeed(true);
      setErrorFeed(null);
      if (profileStatus !== "exists") {
        "Skipping feed fetch: Profile status is", profileStatus;
        setLoadingFeed(false);
        setPosts([]);
        return;
      }
      ("Fetching feed posts...");
      setLoadingFeed(true);
      setErrorFeed(null);
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/feed/posts/",
          {
            params: {
              requesting_user_name: user.name,
            },
          }
        );
        const postsData = response.data.results || response.data;

        "RAW FEED DATA FROM BACKEND:", JSON.stringify(postsData, null, 2);

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
    },
    [profileStatus, user]
  );

  useEffect(() => {
    if (profileStatus === "exists") {
      fetchPosts();
    } else {
      setPosts([]);
      setLoadingFeed(false);
    }
  }, [profileStatus, fetchPosts]);
  useEffect(() => {
    const handleFocus = () => {
      ("Dashboard focused, refetching posts...");

      fetchPosts(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchPosts]);

  const handleLikePost = useCallback(
    async (postId) => {
      if (!user || !user.name) {
        console.error(
          "User name not available in Dashboard state. Cannot like post."
        );

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
      const userName = user.name;
      const userIdForLogging = user.id;

      `Attempting to toggle like for post ${postId} by user name: '${userName}' (ID: ${userIdForLogging})`;

      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/feed/posts/${postId}/like/`,

          { user_name: userName }
        );

        `Like toggle successful for ${postId}:`, response.data;
        return {
          status: response.data?.status,
          like_count: response.data?.like_count,
        };
      } catch (error) {
        console.error(
          `Like toggle error for post ${postId}:`,
          error.response?.data || error.message
        );

        if (error.response?.status === 404) {
          alert("Post not found.");
        } else if (
          error.response?.status === 400 &&
          error.response?.data?.detail?.includes("blank")
        ) {
          alert("Cannot like with a blank username.");
        } else {
          alert("Failed to update like status.");
        }
        throw error;
      }
    },
    [user]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      const sessionData = await supabase.auth.getSession();
      const token = sessionData?.data?.session?.access_token;
      if (!token) {
        alert("Please log in again.");
        throw new Error("No token");
      }
      const currentUserId = user?.id;
      "this is user id::::", currentUserId;
      ("no");
      try {
        await axios.delete(`http://127.0.0.1:8000/api/feed/posts/${postId}/`, {
          data: { user_id: currentUserId },
        });

        setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId));
      } catch (error) {
        console.error(`Delete error:`, error.response?.data || error.message);
        let errorMsg = "Could not delete post.";
        if (error.response?.status === 403)
          errorMsg = "You don't have permission to delete this post.";
        if (error.response?.status === 401) errorMsg = "Authentication failed.";
        alert(errorMsg);
        throw error;
      }
    },
    [user]
  );
  const handleCommentCountUpdate = useCallback((postId, newCount) => {
    `Dashboard: Updating comment count for post ${postId} to ${newCount}`;
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId ? { ...p, comment_count: newCount } : p
      )
    );
  }, []);
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    ("Setting isCreateModalOpen to true.");
    setIsCreateModalOpen(true);
  };
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handlePostCreated = (newPost) => {
    const postWithCount = {
      ...newPost,
      comment_count: newPost.comment_count ?? 0,
    };
    setPosts((prevPosts) => [postWithCount, ...prevPosts]);
  };

  const handleLogout = async () => {
    try {
      ("Attempting Supabase sign out...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error during Supabase sign out:", error);
      } else {
        ("Supabase sign out successful.");
      }
    } catch (catchError) {
      console.error("Unexpected error calling signOut:", catchError);
    } finally {
      ("Navigating to /signin after logout attempt.");
      navigate("/signin");
    }
  };

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  if (authLoading) {
    return <div style={styles.loadingOverlay}> Loading Authentication... </div>;
  }
  if (isAuthenticated && profileStatus === "loading") {
    return <div style={styles.loadingOverlay}> Checking Profile... </div>;
  }

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
              // onCommentCountUpdate={handleCommentCountUpdate}
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
      <AnimatePresence>
        {isCreateModalOpen && ( // Use the state variable to conditionally render
          <CreatePostModal
            isOpen={isCreateModalOpen} // Still pass isOpen for internal logic if needed
            onClose={handleCloseCreateModal}
            onPostCreated={handlePostCreated}
            currentUser={user}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onPostCreated={handlePostCreated}
            currentUser={user}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAuthenticated && profileStatus === "missing" && (
          <SetupProfileModal onNavigateToProfile={handleNavigateToProfile} />
        )}
      </AnimatePresence>

      {/* --- 2. Render the Chatbot Component --- */}
      {/* Render chatbot if user is authenticated (optional, adjust as needed) */}
      {isAuthenticated && <Chatbot />}
    </div>
  );
};

export default Dashboard;
