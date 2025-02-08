import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Securely store keys in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

  // Real-time validation
  const validateStudentId = () => /^\d{8}$/.test(studentId);
  const validatePassword = () => password.length >= 6;
  const validateConfirmPassword = () => password === confirmPassword;

  const handleNext = () => {
    if (!validateStudentId()) {
      setMessage("❌ Invalid ID! Please enter an 8-digit LUMS ID.");
      return;
    }
    setEmail(`${studentId}@lums.edu.pk`);
    setStep(2);
    setMessage("");
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <h1 style={styles.heading}>REGISTER</h1>

        {step === 1 && (
          <>
            <motion.input
              type="text"
              placeholder="Enter your LUMS ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{
                ...styles.input,
                borderColor:
                  studentId && !validateStudentId() ? "red" : "#667eea",
              }}
              whileFocus={{ scale: 1.05 }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              style={styles.button}
            >
              Next
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
                ...styles.input,
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
                ...styles.input,
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

        {message && (
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

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  card: {
    width: "300px",
    padding: "30px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "2px solid #667eea",
    borderRadius: "20px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    width: "80%",
    padding: "10px",
    background: "black",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
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
