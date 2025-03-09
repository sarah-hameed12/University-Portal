import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaStickyNote,
  FaClock,
  FaCalculator,
} from "react-icons/fa";

const DocsTab = () => {
  const navigate = useNavigate();
  const docs = [
    {
      title: "Course Scheduler",
      description: "Plan your courses efficiently.",
      icon: <FaCalendarAlt />,
    },
    {
      title: "Course Outlines",
      description: "Detailed syllabus for each course.",
      icon: <FaFileAlt />,
    },
    {
      title: "Course Memo",
      description: "Important notes and updates.",
      icon: <FaStickyNote />,
    },
    {
      title: "Faculty Office Hours",
      description: "Meet your professors on time.",
      icon: <FaClock />,
    },
    {
      title: "CGPA Calculator",
      description: "Fully optional GPA Calculator and Estimator",
      icon: <FaCalculator />,
    },
  ];
  const handleNavigation = (doc) => {
    if (doc.title === "Course Outlines") {
      navigate("/outlines");
    }
  };
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Documents</h1>
      <div style={styles.grid}>
        {docs.map((doc, index) => (
          <motion.div
            key={index}
            style={styles.card}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleNavigation(doc)}
          >
            <div style={styles.icon}>{doc.icon}</div>
            <h2 style={styles.cardTitle}>{doc.title}</h2>
            <p style={styles.cardText}>{doc.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DocsTab;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "40px 20px",
    minHeight: "100vh",
    background: "radial-gradient(circle, #02013B, black)",
    color: "white",
    fontFamily: "'Poppins', sans-serif",
    overflow: "hidden",
  },
  header: {
    fontSize: "2.8rem",
    fontWeight: "700",
    marginBottom: "30px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    width: "85%",
    maxWidth: "1100px",
    justifyContent: "center",
  },
  card: {
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "90px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    transition: "all 0.15s ease",
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  icon: {
    fontSize: "2.5rem",
    marginBottom: "12px",
    color: "white",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  cardText: {
    fontSize: "0.95rem",
    opacity: "0.9",
  },
};
