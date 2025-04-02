import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus } from "react-icons/fa";

const gradePoints = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
  U: 0.0,
};

// --- Helper Component for the CGPA Gauge (Minor style adjustment) ---
const CgpaGauge = ({ cgpa }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const validCgpa = Math.max(0, Math.min(4, cgpa || 0));
  const offset = circumference - (validCgpa / 4.0) * circumference;

  let strokeColor = "#EF4444"; // Red-500 (F)
  if (validCgpa >= 1.0) strokeColor = "#F97316"; // Orange-500 (D)
  if (validCgpa >= 2.0) strokeColor = "#EAB308"; // Yellow-500 (C)
  if (validCgpa >= 3.0) strokeColor = "#22C55E"; // Green-500 (B)
  if (validCgpa >= 3.7) strokeColor = "#3B82F6"; // Blue-500 (A)

  return (
    <motion.div
      // Use modified style key: gaugeWrapper
      style={styles.gaugeWrapper}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <svg
        style={{
          overflow: "visible",
          position: "absolute",
          width: 0,
          height: 0,
        }}
      >
        {" "}
        {/* Hide defs */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.3"
            />
          </filter>
        </defs>
      </svg>

      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={styles.gaugeSvg} // Use style key
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#4B5563"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset, stroke: strokeColor }}
          transition={{
            strokeDashoffset: { type: "spring", stiffness: 80, damping: 20 },
            stroke: { duration: 0.5 },
          }}
        />
      </svg>
      <motion.div
        key={cgpa}
        style={styles.gaugeText} // Use style key
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
      >
        {cgpa}
      </motion.div>
      {/* Changed gaugeLabel style - now part of styles object */}
      <div style={styles.gaugeLabel}>CGPA</div>
    </motion.div>
  );
};

// --- Main Calculator Component ---
const Calculator = () => {
  const [courses, setCourses] = useState([
    { id: Date.now() + 1, courseName: "", grade: "", credits: "" },
    { id: Date.now() + 2, courseName: "", grade: "", credits: "" },
    { id: Date.now() + 3, courseName: "", grade: "", credits: "" },
  ]);
  const [cgpa, setCgpa] = useState("0.00");

  useEffect(() => {
    calculateCGPA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]); // Added eslint disable comment

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(({ grade, credits }) => {
      const points = gradePoints[grade];
      const credit = parseFloat(credits);
      if (grade && points !== undefined && !isNaN(credit) && credit > 0) {
        totalPoints += points * credit;
        totalCredits += credit;
      }
    });
    const calculatedCgpa =
      totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    setCgpa(calculatedCgpa);
  };

  const handleChange = (id, field, value) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now() + Math.random(),
        courseName: "",
        grade: "",
        credits: "",
      },
    ]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const isDeleteDisabled = courses.length <= 1;

  return (
    <div style={styles.container}>
      <motion.h1
        style={styles.header}
        animate={{ opacity: [0, 1], y: [-20, 0] }}
      >
        CGPA Calculator
      </motion.h1>

      <div style={styles.contentWrapper}>
        {/* Left Side: Course Inputs (No changes needed here) */}
        <div style={styles.coursesSection}>
          {/* ... (course inputs code remains the same) ... */}
          <h2 style={styles.sectionTitle}>Courses</h2>
          <div style={styles.coursesList}>
            {" "}
            {/* Added className for CSS targeting if needed */}
            <AnimatePresence>
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  style={styles.courseCard}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                  layout
                >
                  <input
                    type="text"
                    value={course.courseName}
                    onChange={(e) =>
                      handleChange(course.id, "courseName", e.target.value)
                    }
                    placeholder={`Course ${index + 1}`}
                    style={{ ...styles.input, ...styles.courseNameInput }}
                  />
                  <select
                    value={course.grade}
                    onChange={(e) =>
                      handleChange(course.id, "grade", e.target.value)
                    }
                    style={{ ...styles.input, ...styles.select }}
                  >
                    <option value="" disabled style={styles.optionDefault}>
                      Grade
                    </option>
                    {Object.keys(gradePoints).map((grade) => (
                      <option key={grade} value={grade} style={styles.option}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <input
                    className="creditsInput" // Keep class if using CSS for spinners
                    type="number"
                    min="0"
                    step="0.5"
                    value={course.credits}
                    onChange={(e) =>
                      handleChange(course.id, "credits", e.target.value)
                    }
                    placeholder="Credits"
                    style={{ ...styles.input, ...styles.creditsInput }}
                  />
                  <motion.button
                    style={{
                      ...styles.deleteButton,
                      ...(isDeleteDisabled ? styles.deleteButtonDisabled : {}),
                    }}
                    onClick={() => removeCourse(course.id)}
                    whileHover={
                      !isDeleteDisabled ? { scale: 1.1, color: "#E74C3C" } : {}
                    }
                    title="Remove Course"
                    disabled={isDeleteDisabled}
                  >
                    <FaTrash />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.button
            style={styles.addButton}
            onClick={addCourse}
            whileHover={{ scale: 1.05, backgroundColor: "#3D3DE2" }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add Course
          </motion.button>
        </div>

        {/* Right Side: CGPA Result (Simplified Structure) */}
        <div style={styles.resultSection}>
          {/* Title */}
          <h2 style={{ ...styles.sectionTitle, ...styles.resultSectionTitle }}>
            Result
          </h2>

          {/* Gauge Component */}
          {/* Apply animation directly if needed, or rely on internal animation */}
          <motion.div
            // Add animation to the gauge container if desired for initial load
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 120,
              delay: 0.1,
            }} // Add delay
          >
            <CgpaGauge cgpa={parseFloat(cgpa)} />
          </motion.div>

          {/* Total Credits Text */}
          <p style={styles.totalCreditsText}>
            Total Credits:{" "}
            {courses
              .reduce((acc, course) => {
                const credit = parseFloat(course.credits);
                return acc + (!isNaN(credit) && credit > 0 ? credit : 0);
              }, 0)
              .toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;

// --- Enhanced Styles (Key Changes Highlighted) ---
const styles = {
  // ... (container, header, contentWrapper, coursesSection styles remain the same)
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "30px 15px",
    background: "radial-gradient(circle, #02013B, black)",
    color: "#E5E7EB",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    fontSize: "clamp(2rem, 6vw, 2.8rem)",
    fontWeight: "600",
    marginBottom: "30px",
    color: "#FFF",
    textAlign: "center",
    letterSpacing: "1px",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "40px",
    width: "100%",
    maxWidth: "1000px",
    flexWrap: "wrap",
  },
  coursesSection: {
    flex: "2",
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
  },
  // --- Result Section Style Changes ---
  resultSection: {
    flex: "1",
    minWidth: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Keep items centered horizontally
    paddingTop: "0px", // REMOVED padding - use margins instead
    gap: "20px", // ADDED gap between flex children (Title, Gauge Wrapper, Total Credits)
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#9CA3AF",
    borderBottom: "1px solid #4B5563",
    paddingBottom: "8px",
    width: "100%",
    textAlign: "left",
    // REMOVED marginBottom here, rely on gap in parent
  },
  resultSectionTitle: {
    textAlign: "center",
    borderBottom: "none", // Keep borderless
    width: "auto", // Allow title to size naturally
    // Ensure it takes space in the flex column:
    marginTop: "0", // Adjust if needed based on alignment with courses title
    marginBottom: "0", // Let gap handle spacing below
  },
  // --- Gauge Style Changes ---
  gaugeWrapper: {
    // Renamed from gaugeContainer
    position: "relative", // Keep relative for internal absolute positioning
    width: "140px", // Slightly larger for breathing room? Adjust as needed
    height: "140px", // Match width
    display: "flex", // Use flex to help center SVG if needed
    justifyContent: "center",
    alignItems: "center",
    // REMOVED margin here, rely on gap in parent (resultSection)
  },
  gaugeSvg: {
    transform: "rotate(-90deg)",
    filter: "url(#shadow)",
    overflow: "visible", // Ensure shadow isn't clipped
    // SVG itself shouldn't need position absolute now
  },
  gaugeText: {
    position: "absolute", // Keep absolute to overlay on SVG center
    top: "35%",
    left: "35%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#FFF",
    pointerEvents: "none", // Prevent text interfering with hover on wrapper
  },
  gaugeLabel: {
    position: "absolute", // Keep absolute
    bottom: "-20px", // Position relative to bottom of wrapper
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "0.75rem", // Slightly smaller label
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  // --- Total Credits Text Style Changes ---
  totalCreditsText: {
    fontSize: "1rem",
    color: "#D1D5DB",
    textAlign: "center",
    // REMOVED marginTop, rely on gap in parent (resultSection)
    marginBottom: "10px", // Optional small margin at the very bottom
  },

  // ... (coursesList, courseCard, input, select, option, button styles remain mostly the same)
  // Ensure scrollbar styles are handled via CSS file or library if needed
  coursesList: {
    width: "100%",
    maxHeight: "55vh",
    overflowY: "auto",
    paddingRight: "10px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    // scrollbarWidth: "thin", // Use CSS file
    // scrollbarColor: "#6B7280 #374151", // Use CSS file
  },
  courseCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(55, 65, 81, 0.7)",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  input: {
    padding: "10px 12px",
    fontSize: "0.95rem",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#F3F4F6",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    outline: "none",
    transition: "background 0.3s, border-color 0.3s",
    flexGrow: 1,
    minWidth: "60px",
  },
  inputFocus: {
    background: "rgba(255, 255, 255, 0.15)",
    borderColor: "#60A5FA",
  },
  courseNameInput: { flexBasis: "40%" },
  select: {
    appearance: "none",
    cursor: "pointer",
    textAlign: "left",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.7rem center",
    backgroundSize: "1.2em 1.2em",
    paddingRight: "2.5rem",
    flexBasis: "25%",
  },
  optionDefault: { color: "#9CA3AF" },
  option: { color: "#1F2937", background: "#F9FAFB" },
  creditsInput: {
    textAlign: "center",
    flexBasis: "20%",
    MozAppearance: "textfield",
    WebkitAppearance: "none",
    margin: 0,
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: "1.1rem",
    padding: "5px",
    marginLeft: "5px",
    transition: "color 0.3s, opacity 0.3s",
    flexShrink: 0,
    opacity: 1,
  },
  deleteButtonDisabled: { opacity: 0.3, cursor: "not-allowed" },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 25px",
    fontSize: "1rem",
    fontWeight: "500",
    color: "white",
    background: "#4F46E5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.3s, transform 0.1s",
    alignSelf: "flex-start",
  },
  // REMOVED resultDisplay style object as it's no longer used
};
