import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaStickyNote,
  FaClock,
  FaCalculator,
} from "react-icons/fa";
import styles from "../Styles/DocsTab.module.css";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2, // Start staggering after container fades in
      staggerChildren: 0.1, // Stagger animation of each card
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const DocsTab = () => {
  const navigate = useNavigate();
  const docs = [
    {
      title: "Course Scheduler",
      description: "Plan your courses efficiently.",
      icon: <FaCalendarAlt />,
      path: "/scheduler",
    },
    {
      title: "Course Outlines",
      description: "Detailed syllabus for each course.",
      icon: <FaFileAlt />,
      path: "/outlines",
    },
    {
      title: "Course Memo",
      description: "Important notes and updates.",
      icon: <FaStickyNote />,
      path: "/memos",
    }, // Example: Added path
    {
      title: "Faculty Office Hours",
      description: "Meet your professors on time.",
      icon: <FaClock />,
      path: "/faculty",
    }, // Example: Added path
    {
      title: "CGPA Calculator",
      description: "Estimate your GPA.",
      icon: <FaCalculator />,
      path: "/calculator",
    },
  ];

  // Updated navigation handler
  const handleNavigation = (doc) => {
    if (doc.path) {
      // Navigate if a path is defined
      navigate(doc.path);
    } else {
      console.warn(`No path defined for card: ${doc.title}`);
      // Optionally show a message like "Coming soon"
    }
  };

  return (
    <motion.div
      className={styles.container}
      // Animate the container itself if needed, though staggering children might be enough
      // initial="hidden"
      // animate="visible"
      // variants={containerVariants} // Example for overall container animation
    >
      <Link to="/dashboard" title="Back to Dashboard">
        {/* {" "} */}
        {/* Or path="/" if that's your dashboard route */}
        <motion.div
          className={styles.backToHomeButton}
          whileHover={{ scale: 1.1 }} // Framer motion hover
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }} // Slight delay
        >
          <FiHome className={styles.backToHomeIcon} />
        </motion.div>
      </Link>
      <motion.h1
        className={styles.header}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        University Utilities
      </motion.h1>

      {/* Apply variants to the grid for staggering */}
      <motion.div
        className={styles.grid}
        variants={containerVariants} // Use container variants for stagger effect
        initial="hidden"
        animate="visible"
      >
        {docs.map(
          (
            doc // Removed index as key if title is unique
          ) => (
            <motion.div
              key={doc.title} // Use a unique identifier like title if possible
              className={styles.card}
              variants={cardVariants} // Apply card animation variant
              whileHover={{
                y: -8,
                scale: 1.03,
                transition: { duration: 0.15 },
              }} // Simpler Framer Motion hover
              // transition={{ duration: 0.15 }} // Handled by variants now
              onClick={() => handleNavigation(doc)}
            >
              <div className={styles.iconWrapper}>
                {" "}
                {/* Wrapper for icon background */}
                <div className={styles.icon}>{doc.icon}</div>
              </div>
              <h2 className={styles.cardTitle}>{doc.title}</h2>
              <p className={styles.cardText}>{doc.description}</p>
            </motion.div>
          )
        )}
      </motion.div>
    </motion.div>
  );
};

export default DocsTab;
