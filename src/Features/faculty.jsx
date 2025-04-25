import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "../Styles/FacultyOfficeHours.module.css";

import { FiSearch, FiClock, FiArrowLeft } from "react-icons/fi";

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
      delayChildren: 0.3,
      staggerChildren: 0.08,
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
  const navigate = useNavigate();

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

      <motion.div className={styles.resultsGrid} variants={gridVariants}>
        {filteredProfessors.length > 0 ? (
          filteredProfessors.map((prof, idx) => (
            <motion.div
              key={prof.name}
              className={styles.resultCard}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.15 } }}
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

      <motion.button
        className={styles.backButton}
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        variants={searchVariants}
      >
        <FiArrowLeft /> Back
      </motion.button>
    </motion.div>
  );
}
