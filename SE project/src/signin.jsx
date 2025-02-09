import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);

const SignIn = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [borderColor, setBorderColor] = useState("#ccc");

  const navigate = useNavigate();

  // Handle Sign-In
  const handleSignIn = async () => {
    if (userId.length !== 8) {
      setMessage("❌ User ID must be 8 characters long.");
      setBorderColor("#FF4500"); // Red border if invalid
      return;
    }

    setLoading(true);
    setMessage("");

    const email = `${userId}@lums.edu.pk`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("❌ Invalid User ID or Password.");
      setBorderColor("#FF4500"); // Red border if login fails
    } else {
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          style={styles.heading}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          SIGN IN
        </motion.h1>

        <motion.input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setBorderColor(userId.length >= 7 ? "#32CD32" : "#FF4500"); // Green if valid, red if invalid
          }}
          style={{ ...styles.input, borderColor }}
          whileFocus={{ scale: 1.05 }}
        />

        <motion.input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          whileFocus={{ scale: 1.05 }}
        />

        <motion.button
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          onClick={handleSignIn}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={styles.spinner}
            />
          ) : (
            "Login"
          )}
        </motion.button>

        {message && (
          <motion.p
            style={styles.message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default SignIn;

// Styles
const styles = {
  container: {
    position: "fixed", // Ensures full coverage
    top: 0,
    left: 0,
    width: "100vw", // Full width
    height: "100vh", // Full height
    margin: 0,
    padding: 0,
    overflow: "hidden", // Prevents unwanted scrollbars
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to bottom, #0093E9, #80D0C7)",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    width: "320px",
  },
  heading: {
    fontSize: "1.8rem",
    color: "#333",
    marginBottom: "20px",
  },
  input: {
    width: "70%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "25px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "39px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
    width: "40%",
  },
  message: {
    marginTop: "10px",
    fontSize: "14px",
    color: "red",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid white",
    borderTop: "3px solid transparent",
    borderRadius: "50%",
    display: "inline-block",
  },
};
