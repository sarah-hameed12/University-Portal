import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Use Link and useNavigate
import { motion } from "framer-motion";
import styles from "./FacultyOfficeHours.module.css"; // Import the CSS Module

// --- Import Icons ---
import { FiSearch, FiClock, FiArrowLeft } from "react-icons/fi";

// Animation Variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
  },
};

const searchVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3, // Start staggering slightly later
      staggerChildren: 0.08, // Stagger cards a bit faster
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 10 },
  },
};

export default function FacultyOfficeHours() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // Hook for back button

  // Static data (can be replaced with API fetch later)
  const professors = [
    { name: "Dr. Waqar", officeHours: "Mon & Wed 2:00 PM - 4:00 PM" },
    { name: "Prof. Maryam", officeHours: "Tue & Thu 1:00 PM - 3:00 PM" },
    { name: "Dr. Fareed", officeHours: "Friday 10:00 AM - 12:00 PM" },
    { name: "Dr. Adam", officeHours: "Monday 3:00 PM - 5:00 PM" },
    { name: "Prof. Suleman", officeHours: "Wed 1:00 PM - 3:00 PM" },
    { name: "Dr. Naveed", officeHours: "Thursday 10:00 AM - 12:00 PM" },
    { name: "Dr. Ayesha", officeHours: "Tuesday 9:00 AM - 11:00 AM" },
    { name: "Prof. Bilal", officeHours: "Mon & Fri 11:00 AM - 12:00 PM" },
  ];

  const filteredProfessors = professors.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className={styles.pageContainer}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.header} variants={headerVariants}>
        Faculty Office Hours
      </motion.h1>
      <motion.p className={styles.subHeader} variants={headerVariants}>
        Find out when your professors are available.
      </motion.p>

      <motion.div className={styles.searchWrapper} variants={searchVariants}>
        <input
          type="text"
          placeholder="Search by professor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <FiSearch className={styles.searchIcon} />
      </motion.div>

      <motion.div
        className={styles.resultsGrid}
        variants={gridVariants}
        // No need for initial/animate here if parent has staggerChildren
      >
        {filteredProfessors.length > 0 ? (
          filteredProfessors.map((prof, idx) => (
            <motion.div
              key={prof.name} // Use name if unique, otherwise idx
              className={styles.resultCard}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.15 } }} // Framer motion hover lift
            >
              {/* Card content structure */}
              <div className={styles.cardHeader}>
                <FiClock className={styles.cardIcon} />
                <h3 className={styles.cardTitle}>{prof.name}</h3>
              </div>
              <p className={styles.cardHours}>{prof.officeHours}</p>
            </motion.div>
          ))
        ) : (
          <p
            style={{
              color: "var(--text-secondary)",
              gridColumn: "1 / -1",
              textAlign: "center",
            }}
          >
            No professors found matching "{search}".
          </p>
        )}
      </motion.div>

      {/* Use button styled Link or useNavigate */}
      <motion.button
        className={styles.backButton}
        onClick={() => navigate(-1)} // Go back to previous page
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        variants={searchVariants} // Reuse search animation variant
      >
        <FiArrowLeft /> Back
      </motion.button>
      {/* Or use Link if preferred:
       <Link to="/utilities" className={styles.backButton}>
           <FiArrowLeft /> Back to Utilities
       </Link>
       */}
    </motion.div>
  );
}
