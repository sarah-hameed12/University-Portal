// src/SocietyDetailPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiInfo,
  FiUsers,
  FiPlusCircle,
  FiLoader,
} from "react-icons/fi";

// --- Placeholder Data (Same as SocietiesPage for lookup) ---
// In a real app, you'd fetch based on ID
const societiesData = [
  {
    id: 1,
    name: "LUMS AIESEC",
    bio: "Developing leadership potential through international internships and volunteer experiences. We focus on cross-cultural understanding and making a positive impact.",
    image: "https://placehold.co/400x250/8c78ff/ffffff?text=AIESEC",
    banner: "https://placehold.co/1200x400/5a4fcf/ffffff?text=AIESEC+Banner",
    events: [
      {
        date: "2025-05-15",
        title: "Global Village",
        time: "2:00 PM",
        location: "Academic Block Lawn",
        description: "Experience cultures from around the world!",
      },
      {
        date: "2025-06-01",
        title: "Leadership Workshop",
        time: "10:00 AM",
        location: "SS Auditorium",
        description: "Unlock your leadership potential.",
      },
    ],
  },
  {
    id: 2,
    name: "SPADES",
    bio: "Society for Promotion and Development of Engineering and Sciences. We host workshops, competitions, and talks.",
    image: "https://placehold.co/400x250/5a4fcf/ffffff?text=SPADES",
    banner: "https://placehold.co/1200x400/3a2f8f/ffffff?text=SPADES+Banner",
    events: [
      {
        date: "2025-05-20",
        title: "Robotics Competition",
        time: "9:00 AM",
        location: "SSE Dean's Office",
        description: "Build and compete with your robots.",
      },
    ],
  },
  {
    id: 3,
    name: "Dramaline",
    bio: "The premier theatre and dramatics society, producing captivating plays annually.",
    image: "https://placehold.co/400x250/a391ff/ffffff?text=Dramaline",
    banner: "https://placehold.co/1200x400/8c78ff/ffffff?text=Dramaline+Banner",
    events: [
      {
        date: "2025-05-25",
        title: "Annual Play Auditions",
        time: "5:00 PM",
        location: "Amphitheatre",
        description: "Showcase your acting talent!",
      },
      {
        date: "2025-05-26",
        title: "Annual Play Auditions Day 2",
        time: "5:00 PM",
        location: "Amphitheatre",
        description: "Callbacks and final selections.",
      },
    ],
  },
  // Add banner & events for other societies...
  {
    id: 4,
    name: "LUMS Debating Society",
    bio: "Engaging in critical discourse and competitive debating.",
    image: "https://placehold.co/400x250/6b5bcf/ffffff?text=Debates",
    banner: "https://placehold.co/1200x400/4a3a9a/ffffff?text=Debate+Banner",
    events: [],
  },
  {
    id: 5,
    name: "LUMS Photographic Society",
    bio: "Capturing moments and fostering creativity through photography.",
    image: "https://placehold.co/400x250/9381ff/ffffff?text=PhotoSoc",
    banner:
      "https://placehold.co/1200x400/7a6ae0/ffffff?text=Photography+Banner",
    events: [
      {
        date: "2025-05-18",
        title: "Photowalk Downtown",
        time: "7:00 AM",
        location: "Meet at Khokha",
        description: "Explore the city streets with your camera.",
      },
    ],
  },
  {
    id: 6,
    name: "FEMSoc",
    bio: "Promoting gender equality and feminist discourse on campus.",
    image: "https://placehold.co/400x250/b8a9ff/ffffff?text=FEMSoc",
    banner: "https://placehold.co/1200x400/9381ff/ffffff?text=Feminism+Banner",
    events: [],
  },
  {
    id: 7,
    name: "LUMS Daily Student",
    bio: "The official student-run news publication of LUMS.",
    image: "https://placehold.co/400x250/7a6ae0/ffffff?text=DailyStudent",
    banner: "https://placehold.co/1200x400/5a4fcf/ffffff?text=News+Banner",
    events: [],
  },
  {
    id: 8,
    name: "LUMS Community Service Society",
    bio: "Engaging students in impactful community service projects.",
    image: "https://placehold.co/400x250/c4b9ff/ffffff?text=LCSS",
    banner:
      "https://placehold.co/1200x400/a391ff/ffffff?text=Community+Service",
    events: [],
  },
  {
    id: 9,
    name: "Music Society",
    bio: "Nurturing musical talent and organizing performances.",
    image: "https://placehold.co/400x250/8c78ff/ffffff?text=MusicSoc",
    banner: "https://placehold.co/1200x400/6b5bcf/ffffff?text=Music+Banner",
    events: [],
  },
];

// --- Styles ---
const styles = {
  pageLoadingError: {
    // Style for loading/error states
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#a0a3bd",
    fontSize: "1.2rem",
  },
  pageContainer: {
    height: "100vh",
    backgroundColor: "#111827", // Base dark background
    color: "#e5e7eb",
    fontFamily: "sans-serif",
    position: "relative", // For back button positioning
    overflowY: "auto", // <<< Enable vertical scroll for the whole page if content overflows
    // Custom scrollbar styles for the page container
    scrollbarWidth: "thin", // Firefox
    scrollbarColor: "rgba(209, 202, 253, 0.6) transparent",
  },
  //   pageContainer: {
  //     // minHeight: "100vh",
  //     backgroundColor: "#111827",
  //     color: "#e5e7eb",
  //     height: "100vh",
  //     padding: "80px 40px 40px 40px", // Ample padding
  //     boxSizing: "border-box",
  //     fontFamily: "sans-serif",
  //     position: "relative",
  //     overflowY: "auto", // <<< Enable vertical scroll for the whole page if content overflows
  //     // Custom scrollbar styles for the page container
  //     scrollbarWidth: "thin", // Firefox
  //     scrollbarColor: "rgba(140, 120, 255, 0.6) transparent", // Firefox (Thumb, Track)
  //   },
  backButtonWrapper: {
    // Wrapper for positioning and hover detection
    position: "absolute", // Position relative to pageContainer
    top: "30px",
    left: "30px",
    zIndex: 1010,
    width: "45px",
    height: "45px",
    borderRadius: "50%", // Make hover area round
  },
  backButton: {
    // Visual styles for the link itself
    backgroundColor: "rgba(26, 28, 42, 0.7)",
    color: "#a0a3bd",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    width: "100%", // Fill the wrapper
    height: "100%",
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
  },
  backButtonHover: {
    backgroundColor: "rgba(37, 40, 60, 0.9)",
    color: "#8c78ff",
    borderColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
  },
  backButtonIcon: {
    fontSize: "1.4rem",
  },
  headerSection: {
    height: "350px", // Height of the banner area
    position: "relative",
    marginBottom: "80px", // Space below header before content starts (includes profile pic overlap)
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    filter: "brightness(0.7)", // Slightly dim banner for text contrast
  },
  profilePicContainer: {
    position: "absolute",
    bottom: "-60px", // Overlap banner (half of profile pic height)
    left: "50px", // Indent from left
    zIndex: 3,
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid #111827", // Border matching page bg creates cutout effect
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
    overflow: "hidden", // Clip image to circle
  },
  profilePic: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  societyNameHeader: {
    position: "absolute",
    bottom: "15px", // Position above the profile picture bottom edge
    left: "190px", // Start next to profile pic + padding
    zIndex: 2,
    color: "white",
    fontSize: "2.8rem",
    fontWeight: "bold",
    textShadow: "0 2px 5px rgba(0, 0, 0, 0.7)", // Text shadow for readability on banner
    margin: 0,
  },
  contentArea: {
    padding: "0px 50px 50px 50px", // Padding for content below header
    maxWidth: "1200px", // Max width for content
    margin: "0 auto", // Center content area
  },
  section: {
    backgroundColor: "#1f2937", // Card-like background for sections
    borderRadius: "12px",
    padding: "25px 30px",
    marginBottom: "30px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
    border: "1px solid #2d3748",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#a391ff", // Accent color for titles
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #374151",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bioText: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "#c7d2fe", // Slightly lighter text for bio
  },
  eventsSection: {
    display: "flex",
    gap: "30px",
    // Responsive layout for calendar and details
    "@media (max-width: 900px)": {
      // Adjust breakpoint as needed
      flexDirection: "column",
    },
  },
  calendarContainer: {
    flex: "1 1 400px", // Flex properties for responsiveness
    minWidth: "300px", // Minimum width for calendar
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)", // 7 days a week
    gap: "8px",
    marginTop: "10px",
  },
  calendarDay: {
    aspectRatio: "1 / 1", // Make days square
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    backgroundColor: "#2d3748", // Day background
    color: "#a0a3bd",
    fontSize: "0.85rem",
    cursor: "pointer",
    position: "relative", // For event dot positioning
    transition:
      "background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease",
    border: "1px solid transparent",
  },
  calendarDayHover: {
    backgroundColor: "#374151",
    color: "#e5e7eb",
    transform: "scale(1.05)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  calendarDaySelected: {
    backgroundColor: "#8c78ff",
    color: "white",
    fontWeight: "bold",
    borderColor: "rgba(255, 255, 255, 0.5)",
    transform: "scale(1.05)",
    boxShadow: "0 2px 8px rgba(140, 120, 255, 0.4)",
  },
  calendarDayNotInMonth: {
    // Style for days outside current month (if implemented)
    opacity: 0.3,
    cursor: "default",
  },
  eventDot: {
    position: "absolute",
    bottom: "6px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#ef4444", // Red dot color
    boxShadow: "0 0 5px rgba(239, 68, 68, 0.7)",
  },
  eventDetailsContainer: {
    flex: "1 1 500px", // Take remaining space, minimum 500px
    minWidth: "300px",
    padding: "20px",
    backgroundColor: "#2d3748", // Slightly different bg for details
    borderRadius: "10px",
    border: "1px solid #374151",
  },
  eventDetailItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "0.95rem",
    color: "#c7d2fe",
  },
  eventDetailIcon: {
    color: "#8c78ff", // Accent color for icons
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  eventDetailTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#e5e7eb", // White title
    marginBottom: "15px",
  },
  noEventSelectedText: {
    color: "#a0a3bd",
    textAlign: "center",
    padding: "30px 0",
    fontSize: "0.95rem",
  },
  joinButtonContainer: {
    textAlign: "center", // Center button within its section
    marginTop: "20px",
  },
  joinButton: {
    // Reusing topnav button styles but making it larger
    padding: "12px 35px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    backgroundColor: "#8c78ff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "1.1rem",
    fontWeight: "600",
    display: "inline-flex", // Use inline-flex for alignment
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    boxShadow: "0 4px 15px rgba(140, 120, 255, 0.3)",
  },
  joinButtonHover: {
    backgroundColor: "#7a6ae0",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(140, 120, 255, 0.4)",
  },
};

// --- Society Detail Page Component ---
const SocietyDetailPage = () => {
  const { societyId } = useParams(); // Get ID from URL
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [joinHovered, setJoinHovered] = useState(false);

  // --- Event Calendar State ---
  const [selectedDate, setSelectedDate] = useState(null); // Store full date string 'YYYY-MM-DD'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Fetch Society Data (Simulated) ---
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Find society data based on ID from URL param
    // In real app: await axios.get(`/api/societies/${societyId}/`)
    const foundSociety = societiesData.find(
      (s) => s.id === parseInt(societyId)
    );

    // Simulate network delay
    const timer = setTimeout(() => {
      if (foundSociety) {
        setSociety(foundSociety);
        setError(null);
      } else {
        setError("Society not found.");
        setSociety(null);
      }
      setLoading(false);
    }, 300); // Short delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [societyId]);

  // --- Calendar Logic ---
  // Note: This is a very basic calendar for demonstration.
  // A real implementation might use a library or more complex date logic.
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (0 = January)

  // Simple array of days for the current month (e.g., 1 to 30/31)
  // For simplicity, using a fixed 31 days - replace with actual days in month logic
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Find which dates have events for the current society
  const eventDates = useMemo(() => {
    if (!society?.events) return new Set();
    // Assuming events have a 'date' property like 'YYYY-MM-DD'
    return new Set(society.events.map((event) => event.date));
  }, [society]);

  // Handle clicking a date in the calendar
  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    // --- Toggle Logic ---
    if (selectedDate === dateStr) {
      // If clicking the already selected date, unselect it
      setSelectedDate(null);
      setSelectedEvent(null);
    } else {
      // Otherwise, select the new date
      setSelectedDate(dateStr);
      // Find and set the event for the newly selected date
      const eventForDate = society?.events?.find(
        (event) => event.date === dateStr
      );
      setSelectedEvent(eventForDate || null);
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div style={styles.pageLoadingError}>
        <FiLoader
          style={{ animation: "spin 1s linear infinite", marginRight: "10px" }}
        />{" "}
        Loading Society Details...
      </div>
    );
  }
  if (error) {
    return <div style={styles.pageLoadingError}>Error: {error}</div>;
  }
  if (!society) {
    // Should ideally not happen if error state is handled, but good fallback
    return (
      <div style={styles.pageLoadingError}>
        Society data could not be loaded.
      </div>
    );
  }

  // --- Dynamic Styles ---
  const backButtonLinkStyle = {
    ...styles.backButton,
    ...(isHomeHovered && styles.backButtonHover),
  };
  const joinButtonStyle = {
    ...styles.joinButton,
    ...(joinHovered && styles.joinButtonHover),
  };

  // --- Animation Variants ---
  const pageFadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  const sectionFadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  const eventDetailVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };
  const dayButtonVariants = {
    initial: {
      // Base state (uses inline style)
      // No specific motion properties needed for initial rendering here
      // Inline style below handles base appearance
    },
    hover: {
      // Hover state for non-selected days
      // Apply ONLY the hover-specific changes
      backgroundColor: styles.calendarDayHover.backgroundColor,
      color: styles.calendarDayHover.color,
      scale: 1.05, // Use motion's scale
      boxShadow: styles.calendarDayHover.boxShadow,
      // Keep border transparent unless selected
    },
    selected: {
      // Apply selected styles (overrides hover)
      backgroundColor: styles.calendarDaySelected.backgroundColor,
      color: styles.calendarDaySelected.color,
      fontWeight: styles.calendarDaySelected.fontWeight,
      borderColor: styles.calendarDaySelected.borderColor, // Apply border color
      scale: 1.05, // Keep scale or adjust if needed
      boxShadow: styles.calendarDaySelected.boxShadow,
    },
    tap: {
      // Tap state for non-selected days
      scale: 0.95,
    },
  };

  return (
    <motion.div
      style={styles.pageContainer}
      variants={pageFadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.div
        style={styles.backButtonWrapper}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHomeHovered(true)}
        onMouseLeave={() => setIsHomeHovered(false)}
      >
        <Link
          to="/society"
          style={backButtonLinkStyle}
          aria-label="Back to Societies List"
        >
          <FiArrowLeft style={styles.backButtonIcon} />
        </Link>
      </motion.div>

      {/* Header Section */}
      <header style={styles.headerSection}>
        <img
          src={
            society.banner ||
            "https://placehold.co/1200x400/1f2937/374151?text=Banner"
          }
          alt={`${society.name} Banner`}
          style={styles.bannerImage}
        />
        <motion.div
          style={styles.profilePicContainer}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <img
            src={
              society.image ||
              "https://placehold.co/120x120/374151/e5e7eb?text=Logo"
            }
            alt={`${society.name} Logo`}
            style={styles.profilePic}
          />
        </motion.div>
        <motion.h1
          style={styles.societyNameHeader}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {society.name}
        </motion.h1>
      </header>

      {/* Content Area */}
      <main style={styles.contentArea}>
        {/* About Section */}
        <motion.section
          style={styles.section}
          variants={sectionFadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 style={styles.sectionTitle}>
            <FiInfo /> About Us
          </h2>
          <p style={styles.bioText}>{society.bio}</p>
        </motion.section>

        {/* Events Section */}
        <motion.section
          style={styles.section}
          variants={sectionFadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 style={styles.sectionTitle}>
            <FiCalendar /> Upcoming Events
          </h2>
          <div style={styles.eventsSection}>
            {/* Calendar View */}
            <div style={styles.calendarContainer}>
              <p
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  color: "#a0a3bd",
                  fontSize: "0.9rem",
                }}
              >
                {today.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div style={styles.calendarGrid}>
                {/* Simple Day Grid - Replace with actual calendar logic if needed */}
                {daysInMonth.map((day) => {
                  const dateStr = `${currentYear}-${String(
                    currentMonth + 1
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvent = eventDates.has(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <motion.button
                      key={day}
                      style={styles.calendarDay} // Apply base styles always
                      onClick={() => handleDateClick(day)}
                      variants={dayButtonVariants} // Reference the variants object
                      initial="initial" // Set initial state
                      animate={isSelected ? "selected" : "initial"} // Animate to 'selected' or back to 'initial'
                      whileHover={!isSelected ? "hover" : ""} // Trigger 'hover' variant only if not selected
                      whileTap={!isSelected ? "tap" : ""} // Trigger 'tap' variant only if not selected
                      aria-label={`Select day ${day}`}
                    >
                      {day}
                      {hasEvent && <span style={styles.eventDot}></span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Event Details View */}
            <div style={styles.eventDetailsContainer}>
              <AnimatePresence mode="wait">
                {" "}
                {/* Animate between states */}
                {selectedEvent ? (
                  <motion.div
                    key={selectedEvent.title} // Key helps AnimatePresence detect changes
                    variants={eventDetailVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h3 style={styles.eventDetailTitle}>
                      {selectedEvent.title}
                    </h3>
                    <div style={styles.eventDetailItem}>
                      <FiClock style={styles.eventDetailIcon} />{" "}
                      <span>{selectedEvent.time || "Not specified"}</span>
                    </div>
                    <div style={styles.eventDetailItem}>
                      <FiMapPin style={styles.eventDetailIcon} />{" "}
                      <span>{selectedEvent.location || "Not specified"}</span>
                    </div>
                    {selectedEvent.description && (
                      <div
                        style={{
                          ...styles.eventDetailItem,
                          alignItems: "flex-start",
                        }}
                      >
                        <FiInfo
                          style={{
                            ...styles.eventDetailIcon,
                            marginTop: "3px",
                          }}
                        />{" "}
                        <span>{selectedEvent.description}</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-event"
                    variants={eventDetailVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p style={styles.noEventSelectedText}>
                      {selectedDate
                        ? "No event scheduled for this date."
                        : "Select a date with a dot to view event details."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Join Society Section */}
        <motion.section
          style={styles.section}
          variants={sectionFadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 style={styles.sectionTitle}>
            <FiUsers /> Get Involved
          </h2>
          <div style={styles.joinButtonContainer}>
            {/* Link this to the actual join/interest form page later */}
            <motion.button
              style={joinButtonStyle}
              onMouseEnter={() => setJoinHovered(true)}
              onMouseLeave={() => setJoinHovered(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlusCircle /> Join {society.name}
            </motion.button>
            {/* Or link to an external form: */}
            {/* <a href="YOUR_FORM_URL" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}> ... button ... </a> */}
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
};

export default SocietyDetailPage;
