import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import BackgroundImage from "./opt2.jpg";

const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);

const Signup = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #1e1e2f, #0f0f1a)";
  }, []);
  const validateStudentId = () => /^\d{8}$/.test(studentId);
  const validatePassword = () => password.length >= 6;
  const validateConfirmPassword = () => password === confirmPassword;
  const checkUserInDB = async (studentId) => {
    console.log(studentId);
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", studentId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking user:", error);
      return null;
    }

    return data ? true : false;
  };

  const handleNext = async () => {
    if (!validateStudentId()) {
      setMessage("❌ Invalid ID! Please enter an 8-digit LUMS ID.");
      return;
    }

    setEmail(`${studentId}@lums.edu.pk`);
    const exists = await checkUserInDB(studentId);

    if (exists) {
      setMessage("❌ User already registered.");

      setUserExists(true);
    } else {
      const { error } = await supabase
        .from("users")
        .insert([{ id: studentId, email }]);
      if (error) {
        setMessage(`❌ Error registering user: ${error.message}`);
        return;
      }
      setStep(2);
      setMessage("");
    }
  };

  const handleRegister = async () => {
    if (!validatePassword()) {
      setMessage("❌ Password must be at least 6 characters.");
      return;
    }
    if (!validateConfirmPassword()) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Verification email sent! Please check your inbox.");
      setStep(3);
    }
  };
  return (
    <motion.div
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      {/* Left Side (Image Section) */}
      <motion.div className="left" style={styles.left}>
        <img src={BackgroundImage} alt="Signup" style={styles.image} />
      </motion.div>

      {/* Right Side (Signup Form) */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.right}
      >
        <h1 style={styles.heading}>REGISTER</h1>

        {step === 1 && !userExists && (
          <>
            <motion.input
              type="text"
              placeholder="Enter your LUMS ID (8 digits)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{
                ...styles.input,
                borderWidth: "3px",
                borderColor:
                  studentId && !validateStudentId() ? "red" : "green",
              }}
              whileFocus={{ scale: 1.05 }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              style={styles.button2}
              disabled={loading}
            >
              {loading ? "Checking..." : "Next"}
            </motion.button>
          </>
        )}

        {userExists && (
          <>
            <p style={styles.errorMessage}>{message}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={styles.button}
              onClick={() => (window.location.href = "/signin")}
            >
              SIGN IN
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={styles.buttonAlt}
              onClick={() => {
                setUserExists(false);
                setStudentId("");
                setEmail("");
                setMessage("");
              }}
            >
              REGISTER ACCOUNT
            </motion.button>
          </>
        )}

        {step === 2 && (
          <>
            <motion.input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input2,
                borderColor:
                  password && !validatePassword() ? "red" : "#667eea",
              }}
              whileFocus={{ scale: 1.05 }}
            />
            <motion.input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                ...styles.input3,
                borderColor:
                  confirmPassword && !validateConfirmPassword()
                    ? "red"
                    : "#667eea",
              }}
              whileFocus={{ scale: 1.05 }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRegister}
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Registering..." : "Verify Email"}
            </motion.button>
          </>
        )}

        {step === 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={styles.success}
          >
            ✅ Email verification sent! Check your inbox.
          </motion.p>
        )}

        {message && step !== 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={styles.message}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

/* Styles */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to right, #170923, #340f42)",
    alignItems: "center",
    justifyContent: "center",
  },
  left: {
    flex: 1,
    height: "95%",
    display: "flex",
    marginLeft: "-200px",
    // boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.2)",
    // marginRight: "-150px",
    // boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "60%",
    height: "95%",
    borderRadius: "40px",
  },
  right: {
    flex: 1,
    maxWidth: "400px",
    minHeight: "400px",
    background: "#1a092b",
    marginRight: "180px",
    marginLeft: "-200px",
    padding: "30px",
    borderRadius: "90px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
  },
  input: {
    width: "70%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "30px",
    border: "1px solid #667eea",
    background: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
  },
  button: {
    width: "30%",
    background: "#667eea",
    color: "#fff",
    padding: "9px 2px",
    marginTop: "20px",
    borderRadius: "40px",
    cursor: "pointer",
    border: "none",
    fontSize: "16px",
  },
  input: {
    width: "70%",
    padding: "10px",
    margin: "10px 0",
    border: "2px solid #667eea",
    marginBottom: "25px",
    borderRadius: "20px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  input2: {
    width: "80%",
    padding: "10px",
    margin: "0 0",
    border: "2px solid #667eea",
    borderRadius: "20px",
    fontSize: "16px",
  },
  input3: {
    width: "80%",
    padding: "10px",
    margin: " 0",
    marginTop: "5px",
    marginBottom: "30px",
    border: "2px solid #667eea",
    borderRadius: "20px",
    fontSize: "16px",
  },
  button: {
    width: "40%",
    padding: "10px",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #ff00ff, #00ffff)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  button2: {
    width: "30%",
    padding: "10px",
    background: "#00FFC3",
    background: "linear-gradient(45deg,#ff00ff, #00FFC3)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    // margin: "10px",
  },
  buttonAlt: {
    width: "53%",
    fontWeight: "bold",
    padding: "10px",
    background: "blue",
    background: "#00FFC3",
    background: "linear-gradient(45deg,#ff00ff, #00FFC3)",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "30px",
    transition: "0.3s ease",
  },
  message: {
    marginTop: "10px",
    color: "#e74c3c",
    fontSize: "14px",
  },
  success: {
    color: "#2ecc71",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Signup;
