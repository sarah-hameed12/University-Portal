import React from "react";
import { motion } from "framer-motion";

const CgpaGauge = ({ cgpa }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const validCgpa = Math.max(
    0,
    Math.min(4, typeof cgpa === "number" ? cgpa : 0)
  );
  const offset = circumference - (validCgpa / 4.0) * circumference;

  let strokeColor = "#EF4444";
  if (validCgpa >= 1.0) strokeColor = "#F97316";
  if (validCgpa >= 2.0) strokeColor = "#EAB308";
  if (validCgpa >= 3.0) strokeColor = "#22C55E";
  if (validCgpa >= 3.7) strokeColor = "#3B82F6";

  return (
    <motion.div
      style={styles.gaugeWrapper}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* SVG Filter Definition - Needs to be rendered */}
      <svg
        style={{
          overflow: "visible",
          position: "absolute",
          width: 0,
          height: 0,
        }}
      >
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

      {/* The Gauge SVG */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={styles.gaugeSvg}
      >
        {/* Background Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#4B5563" // Darker background track
          strokeWidth="10"
        />
        {/* Foreground (Progress) Circle */}
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
            stroke: { duration: 0.5 }, // Transition color change
          }}
        />
      </svg>

      {/* CGPA Text */}
      <motion.div
        key={cgpa}
        style={styles.gaugeText}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
      >
        {/* Display calculated CGPA, formatted */}
        {typeof cgpa === "number" ? cgpa.toFixed(2) : "0.00"}
      </motion.div>

      <div style={styles.gaugeLabel}>CGPA</div>
    </motion.div>
  );
};

const styles = {
  gaugeWrapper: {
    position: "relative",
    width: "140px",
    height: "140px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeSvg: {
    transform: "rotate(-90deg)",
    filter: "url(#shadow)",
    overflow: "visible",
  },
  gaugeText: {
    position: "absolute",
    top: "35%",
    left: "35%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#FFF",
    pointerEvents: "none",
  },
  gaugeLabel: {
    position: "absolute",
    bottom: "-20px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "0.75rem",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

export default CgpaGauge;
