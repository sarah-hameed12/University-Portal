// src/SocietiesPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiHome, FiArrowLeft } from "react-icons/fi";

// --- Placeholder Data ---
const societiesData = [
  {
    id: 1,
    name: "LUMS AIESEC",
    bio: "Developing leadership potential through international internships and volunteer experiences.",
    image: "https://placehold.co/400x250/8c78ff/ffffff?text=AIESEC",
  },
  {
    id: 2,
    name: "SPADES",
    bio: "Society for Promotion and Development of Engineering and Sciences.",
    image: "https://placehold.co/400x250/5a4fcf/ffffff?text=SPADES",
  },
  {
    id: 3,
    name: "Dramaline",
    bio: "The premier theatre and dramatics society, producing captivating plays.",
    image: "https://placehold.co/400x250/a391ff/ffffff?text=Dramaline",
  },
  {
    id: 4,
    name: "LUMS Debating Society",
    bio: "Engaging in critical discourse and competitive debating.",
    image: "https://placehold.co/400x250/6b5bcf/ffffff?text=Debates",
  },
  {
    id: 5,
    name: "LUMS Photographic Society",
    bio: "Capturing moments and fostering creativity through photography.",
    image: "https://placehold.co/400x250/9381ff/ffffff?text=PhotoSoc",
  },
  {
    id: 6,
    name: "FEMSoc",
    bio: "Promoting gender equality and feminist discourse on campus.",
    image: "https://placehold.co/400x250/b8a9ff/ffffff?text=FEMSoc",
  },
  {
    id: 7,
    name: "LUMS Daily Student",
    bio: "The official student-run news publication of LUMS.",
    image: "https://placehold.co/400x250/7a6ae0/ffffff?text=DailyStudent",
  },
  {
    id: 8,
    name: "LUMS Community Service Society",
    bio: "Engaging students in impactful community service projects.",
    image: "https://placehold.co/400x250/c4b9ff/ffffff?text=LCSS",
  },
  {
    id: 9,
    name: "Music Society",
    bio: "Nurturing musical talent and organizing performances.",
    image: "https://placehold.co/400x250/8c78ff/ffffff?text=MusicSoc",
  },
  // Add more societies if needed
];

// --- Styles ---
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    height: "100vh",
    padding: "80px 40px 40px 40px", // Ample padding
    boxSizing: "border-box",
    fontFamily: "sans-serif",
    position: "relative",
    overflowY: "auto", // <<< Enable vertical scroll for the whole page if content overflows
    // Custom scrollbar styles for the page container
    scrollbarWidth: "thin", // Firefox
    scrollbarColor: "rgba(140, 120, 255, 0.6) transparent", // Firefox (Thumb, Track)
  },
  // Apply Webkit scrollbar styles globally or via CSS if needed for page scroll
  // Example (better in a global CSS file):
  //   body::-webkit-scrollbar { width: 8px; }
  //   body::-webkit-scrollbar-track { background: transparent; }
  //   body::-webkit-scrollbar-thumb { background-color: rgba(140, 120, 255, 0.6); border-radius: 4px; }
  //   body::-webkit-scrollbar-thumb:hover { background-color: rgba(140, 120, 255, 0.8); }

  backToHomeButtonWrapper: {
    // Style for the motion wrapper div
    position: "fixed",
    top: "25px",
    left: "25px",
    zIndex: 1010, // Ensure wrapper is positioned correctly
    // Size matches the button for accurate hover area
    width: "45px",
    height: "45px",
    // Make wrapper round for better hover target area
    borderRadius: "50%",
    // Add pointer events none if needed, but hover should work on wrapper
    // pointerEvents: 'none', // Uncomment if hover on wrapper interferes oddly
  },
  backToHomeButton: {
    // Keep visual styles, remove fixed position (handled by wrapper)
    backgroundColor: "rgba(26, 28, 42, 0.7)",
    color: "#a0a3bd",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    width: "100%", // Fill the wrapper
    height: "100%", // Fill the wrapper
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition:
      "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    transformOrigin: "center center",
    // pointerEvents: 'auto', // Ensure link itself is clickable if wrapper has none
  },
  backToHomeButtonHover: {
    backgroundColor: "rgba(37, 40, 60, 0.9)",
    color: "#8c78ff",
    borderColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
  },
  backToHomeIcon: {
    fontSize: "1.4rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    // Make header sticky if desired (optional)
    // position: 'sticky',
    // top: '0', // Adjust based on desired sticky position (e.g., below fixed nav if any)
    // backgroundColor: 'rgba(17, 24, 39, 0.8)', // Semi-transparent background when sticky
    // backdropFilter: 'blur(10px)',
    // zIndex: 1000, // Ensure header stays above cards
    // padding: '20px 40px', // Add padding if sticky
    // margin: '0 -40px 40px -40px', // Adjust margins if sticky to align with page padding
  },
  pageTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#f0f0f5",
    margin: 0,
    letterSpacing: "1px",
  },
  searchContainer: {
    position: "relative",
    width: "350px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 20px 12px 45px",
    borderRadius: "25px",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    color: "#e5e7eb",
    border: "1px solid rgba(74, 77, 109, 0.7)",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
  },
  searchInputFocus: {
    borderColor: "#8c78ff",
    boxShadow: "0 0 0 3px rgba(140, 120, 255, 0.3)",
    backgroundColor: "rgba(31, 41, 55, 1)",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a0a3bd",
    fontSize: "1.2rem",
    pointerEvents: "none",
    transition: "color 0.3s ease",
  },
  searchIconFocus: {
    color: "#8c78ff",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "35px",
  },
  card: {
    // Base styles for the card appearance within motion.div
    backgroundColor: "#1f2937",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    border: "1px solid transparent", // Start transparent for hover transition
    height: "100%", // Ensure cards try to take full height of grid item
  },
  cardImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
    borderBottom: "1px solid #2d3748",
  },
  cardContent: {
    padding: "20px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  cardName: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#a391ff",
  },
  cardBio: {
    fontSize: "0.9rem",
    color: "#a0a3bd",
    lineHeight: "1.5",
    flexGrow: 1,
    marginBottom: 0,
  },
};

// --- Society Card Component ---
const SocietyCard = ({ society }) => {
  // Card animation variants including hover state
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      borderColor: "transparent", // Ensure border starts transparent
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)", // Base shadow
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
      y: -8,
      scale: 1.03,
      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.45)", // Enhanced hover shadow
      borderColor: "rgba(140, 120, 255, 0.3)", // Accent border on hover
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      style={styles.card} // Apply base appearance styles
      variants={cardVariants}
      whileHover="hover" // Trigger hover variant
      layout // Animate layout changes
    >
      <img
        src={society.image}
        alt={`${society.name} banner`}
        style={styles.cardImage}
      />
      <div style={styles.cardContent}>
        <h3 style={styles.cardName}>{society.name}</h3>
        <p style={styles.cardBio}>{society.bio}</p>
      </div>
    </motion.div>
  );
};

// --- Main Societies Page Component ---
const SocietiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHomeHovered, setIsHomeHovered] = useState(false);

  const filteredSocieties = useMemo(() => {
    if (!searchTerm) return societiesData;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return societiesData.filter(
      (society) =>
        society.name.toLowerCase().includes(lowerCaseSearch) ||
        society.bio.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  // Combine base and hover styles for non-transform properties for the Link
  const backToHomeLinkStyle = {
    ...styles.backToHomeButton,
    ...(isHomeHovered && styles.backToHomeButtonHover),
  };
  const searchInputStyle = {
    ...styles.searchInput,
    ...(isSearchFocused && styles.searchInputFocus),
  };
  const searchIconStyle = {
    ...styles.searchIcon,
    ...(isSearchFocused && styles.searchIconFocus),
  };

  // Animation variants
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const cardItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 }, // Slightly different initial state
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Back to Home Button - Wrapper handles positioning and hover detection */}
      <motion.div
        style={styles.backToHomeButtonWrapper} // Use wrapper style for positioning
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHomeHovered(true)}
        onMouseLeave={() => setIsHomeHovered(false)}
      >
        <Link
          to="/" // Link back to the main Dashboard/Home
          style={backToHomeLinkStyle} // Apply visual styles (bg, color, border, etc.)
          aria-label="Back to Dashboard"
        >
          <FiArrowLeft style={styles.backToHomeIcon} />
        </Link>
      </motion.div>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Societies Hub</h1>
        <div style={styles.searchContainer}>
          <span style={searchIconStyle}>
            {" "}
            <FiSearch />{" "}
          </span>
          <input
            type="search"
            placeholder="Search societies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </header>

      {/* Card Grid */}
      <motion.div
        style={styles.cardGrid}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <AnimatePresence>
          {filteredSocieties.length > 0 ? (
            filteredSocieties.map((society) => (
              // <<<--- Wrap Card in Link --->>>
              <Link
                key={society.id}
                to={`/society/${society.id}`} // Dynamic link to detail page
                style={{ textDecoration: "none" }} // Remove default link underline
              >
                <motion.div
                  // key prop moved to Link for proper list handling if Link is outermost element
                  variants={cardItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <SocietyCard society={society} />
                </motion.div>
              </Link>
              // <<<-------------------------->>>
            ))
          ) : (
            <motion.p key="no-results" /* ... */>
              No societies found matching "{searchTerm}".
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SocietiesPage;
