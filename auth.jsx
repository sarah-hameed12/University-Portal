import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #667eea, #764ba2)";
  }, []);

  const handleNext = () => {
    if (!/^\d{8}$/.test(studentId)) {
      setMessage("❌ Invalid ID! Please enter an 8-digit LUMS ID.");
      return;
    }
    setEmail(`${studentId}@lums.edu.pk`);
    setStep(2);
    setMessage("");
  };

  const handleRegister = async () => {
    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Verification email sent! Please check your inbox.");
      setStep(3);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>REGISTER</h1>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter your LUMS ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleNext} style={styles.button}>
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input2}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input3}
            />
            <button
              onClick={handleRegister}
              style={styles.button2}
              disabled={loading}
            >
              {loading ? "Registering..." : "Verify Email"}
            </button>
          </>
        )}

        {step === 3 && (
          <p style={styles.success}>
            ✅ Email verification sent! Check your inbox.
          </p>
        )}

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  card: {
    width: "250px",
    padding: "30px",
    marginLeft: "50px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    animation: "fadeIn 0.5s ease-in-out",
  },
  heading: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  input: {
    width: "90%",
    padding: "10px",
    margin: "10px 0",
    border: "2px solid #667eea",
    borderRadius: "20px",
    fontSize: "16px",
  },
  input2: {
    width: "90%",
    padding: "10px",
    margin: "0 0",
    border: "2px solid #667eea",
    borderRadius: "20px",
    fontSize: "16px",
  },
  input3: {
    width: "90%",
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
    background: "black",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    // margin: "10px",
  },
  button2: {
    width: "60%",
    padding: "10px",
    background: "black",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    // margin: "10px",
  },
  buttonHover: {
    background: "#5563d2",
  },
  message: {
    marginTop: "5px",
    color: "#e74c3c",
  },
  success: {
    color: "#2ecc71",
  },
};

export default Signup;
