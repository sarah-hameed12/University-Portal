import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

const societies = [
  {
    id: "1",
    name: "Tech Club",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "A hub for coding, AI, and tech enthusiasts.",
  },
  {
    id: "2",
    name: "Music Society",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "Unleashing creativity through melodies and rhythm.",
  },
  {
    id: "3",
    name: "Drama Club",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "Passion for theater, acting, and storytelling.",
  },
  {
    id: "4",
    name: "Sports Club",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "Uniting athletes and fitness lovers of all kinds.",
  },
  {
    id: "5",
    name: "Literature Society",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "For writers, poets, and literature enthusiasts.",
  },
  {
    id: "5",
    name: "Literature Society",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "For writers, poets, and literature enthusiasts.",
  },
  {
    id: "5",
    name: "Literature Society",
    logo: "https://i.imgur.com/8yfu3eT.png",
    description: "For writers, poets, and literature enthusiasts.",
  },
];

const events = [
  { name: "Tech Talk", date: "March 10, 2025" },
  { name: "Music Fest", date: "March 12, 2025" },
  { name: "Drama Performance", date: "March 14, 2025" },
  { name: "Sports Tournament", date: "March 16, 2025" },
  { name: "Literature Reading", date: "March 18, 2025" },
  { name: "Art Exhibition", date: "March 20, 2025" },
];

const SocietyScreen = () => {
  const [search, setSearch] = useState("");
  const [eventIndex, setEventIndex] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const showNextEvents = () => {
    setEventIndex((prevIndex) => {
      if (prevIndex + 3 >= events.length) {
        return 0;
      }
      return prevIndex + 3;
    });
  };
  useEffect(() => {
    const customScrollbar = `
      .scrollable-container::-webkit-scrollbar { width: 8px; background: transparent; }
      .scrollable-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.2); border-radius: 200px; }
      .scrollable-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.5); border-radius: 20px; transition: background 0.3s ease; }
      .scrollable-container:hover::-webkit-scrollbar-thumb { background: white; }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customScrollbar;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const filteredSocieties = societies.filter((society) => {
    const lowerCaseName = society.name.toLowerCase();
    const lowerCaseSearch = search.toLowerCase().trim();

    const regex = new RegExp(`\\b${lowerCaseSearch}\\b`, "i");

    return regex.test(lowerCaseName);
  });

  return (
    <div style={styles.container}>
      {/* Animated Search Bar */}
      <div style={styles.searchContainer}>
        <FaSearch style={styles.searchIcon} />
        <motion.input
          type="text"
          style={styles.searchBar}
          placeholder="Search societies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          whileFocus={{
            scale: 1.02,
          }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* <div style={styles.eventsContainer}>
        <div style={styles.eventsHeader}>Upcoming Events</div>

        <motion.div
          style={styles.eventsList}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {events.slice(eventIndex, eventIndex + 3).map((event, index) => (
            <div key={index} style={styles.eventItem}>
              <div style={styles.eventName}>{event.name}</div>
              <div style={styles.eventDate}>{event.date}</div>
            </div>
          ))}
          <FaArrowRight onClick={showNextEvents} style={styles.arrowIcon} />
        </motion.div>
      </div> */}
      <div style={styles.eventsContainer}>
        <div style={styles.eventsHeader}>Upcoming Events</div>

        <motion.div
          style={styles.eventsList}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {events.slice(eventIndex, eventIndex + 3).map((event, index) => (
            <div
              key={index}
              style={{
                ...styles.eventItem,
                background:
                  hoveredEvent === index
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.15)",
              }}
              onMouseEnter={() => setHoveredEvent(index)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div style={styles.eventName}>
                {hoveredEvent === index ? "View Details" : event.name}
              </div>
              <div style={styles.eventDate}>
                {hoveredEvent === index ? "" : event.date}
              </div>
            </div>
          ))}
          <ArrowCircleRightIcon
            onClick={showNextEvents}
            // style={styles.arrowIcon}
            style={{ ...styles.arrowIcon, fontSize: "40px" }}
          />
        </motion.div>
      </div>

      {/* Scrollable Cards Section */}
      <motion.div
        className="scrollable-container"
        style={styles.scrollable}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={styles.cardGrid}>
          {filteredSocieties.map((society, index) => (
            <motion.div
              key={society.id}
              style={styles.card}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0,
                duration: 0.2,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(255, 255, 255, 0.2)",
              }}
              onClick={() => alert(`Clicked on ${society.name}`)}
            >
              {/* Logo */}
              <div style={styles.logoContainer}>
                <img
                  src={society.logo}
                  alt={society.name}
                  style={styles.logo}
                />
              </div>

              {/* Society Name */}
              <h2 style={styles.societyName}>{society.name}</h2>

              {/* Description */}
              <p style={styles.description}>{society.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SocietyScreen;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
    background: "radial-gradient(circle,#02013B, black)",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "300px",
    display: "flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "50px",
    padding: "2px",
    backdropFilter: "blur(8px)",
    transition: "0.15s ease",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    marginTop: "30px", // Adjust this value to push the search bar down
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    fontSize: "18px",
    color: "white",
    opacity: 0.7,
  },
  searchBar: {
    flex: 1,
    width: "100%",
    fontSize: "16px",
    borderRadius: "50px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "white",
    padding: "10px 15px 10px 40px",
  },
  eventsContainer: {
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: "-30px",
  },
  eventsHeader: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "25px",
  },
  eventsList: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
  },
  eventItem: {
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "40px",
    padding: "10px 20px",
    textAlign: "center",
    transition: "transform 0.5s ease, background 0.3s ease",
    cursor: "pointer",
  },
  eventName: {
    fontSize: "16px",
    fontWeight: "bold",
    transition: "opacity 0.5s ease",
  },
  eventDate: {
    fontSize: "14px",
    opacity: 0.7,
    transition: "opacity 0.5s ease",
  },
  eventItemHovered: {
    background: "rgba(0, 0, 0, 0.7)",
    transform: "scale(1.05)",
  },
  arrowIcon: {
    fontSize: "24px",
    color: "white",
    cursor: "pointer",
    opacity: 0.7,
    transition: "0.7s ease",
    "&:hover": {
      opacity: 1,
    },
  },

  scrollable: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "90%",
    maxWidth: "1200px",
    overflowY: "auto",
    maxHeight: "80vh",
    paddingRight: "60px",
    marginTop: "50px",
    overflowX: "hidden",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "25px",
    padding: "20px",
    paddingLeft: "60px",
    width: "100%",
    justifyContent: "center",
    marginTop: "20px",
  },
  card: {
    maxWidth: "320px",
    width: "100%",
    borderRadius: "18px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0px 5px 20px rgba(255, 255, 255, 0.1)",
  },
  logoContainer: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px auto",
    boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
  },
  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
  },
  societyName: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "10px 0",
  },
  description: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
  },
};
