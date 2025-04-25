import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./signin.module.css"; // Reuse the Signup styles!

import { FiUser, FiLock } from "react-icons/fi";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const splitLayoutVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const leftPanelVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3 } },
};

const SignIn = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isIdValid, setIsIdValid] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const validateStudentId = (id) => /^\d{8}$/.test(id);
  useEffect(() => {
    setIsIdValid(userId ? validateStudentId(userId) : null);
  }, [userId]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!isIdValid) {
      setMessage("❌ User ID must be 8 digits.");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    const email = `${userId}@lums.edu.pk`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message || "Invalid credentials."}`);
      setIsError(true);
    } else {
      setMessage("✅ Login successful! Welcome back.");
      setIsError(false);
      navigate(from, { replace: true });
      // navigate("/dashboard");
    }
  };

  const getInputClass = (isValid) => {
    let classes = `${styles.input} ${styles.inputWithIcon}`;
    if (isValid === false) classes += ` ${styles.inputError}`;
    return classes;
  };

  return (
    // Apply container style for background and centering
    <div className={styles.container}>
      {/* Apply split layout and animation */}
      <motion.div
        className={styles.splitLayout} // Use the split layout style
        variants={splitLayoutVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side: Welcome Message (Consistent with Signup) */}
        <div className={styles.left}>
          <motion.div variants={leftPanelVariants}>
            {" "}
            {/* Optional animation for left panel content */}
            <div className={styles.logo}>
              Super<span className={styles.logoAccent}>LUMS</span>
            </div>
            <h2 className={styles.welcomeHeading}>Welcome Back!</h2>
            <p className={styles.welcomeText}>
              Sign in to access your personalized dashboard, connect with peers,
              and explore campus events.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className={styles.right}>
          <div className={styles.formWrapper}>
            {" "}
            {/* Wrapper to control form width */}
            <h1 className={styles.heading}>Sign In</h1>
            <p className={styles.subheading}>Use your LUMS ID and password.</p>
            <form className={styles.form} onSubmit={handleSignIn}>
              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.p
                    key="message"
                    className={`${styles.message} ${
                      isError ? styles.errorMessage : styles.successMessage
                    }`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {" "}
                    {message}{" "}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Input Fields with Icons */}
              <div className={styles.formGroup}>
                <label htmlFor="userId" className={styles.label}>
                  {" "}
                  Student ID{" "}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="userId"
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="Your 8-digit LUMS ID"
                    value={userId}
                    onChange={(e) =>
                      setUserId(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    className={getInputClass(isIdValid)}
                    maxLength={8}
                    required
                  />
                  <FiUser className={styles.inputIcon} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  {" "}
                  Password{" "}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${styles.input} ${styles.inputWithIcon}`}
                    required
                  />
                  <FiLock className={styles.inputIcon} />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div
                style={{
                  width: "100%",
                  textAlign: "right",
                  marginBottom: "20px",
                  marginTop: "-10px",
                }}
              >
                <Link to="/forgot-password" className={styles.helperLink}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={loading || !isIdValid || !password}
                whileHover={!loading ? { scale: 1.03 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <div className={styles.buttonSpinner}></div>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              {/* Link to Sign Up */}
              <div className={styles.switchFormContainer}>
                {" "}
                {/* Reuse container style for link */}
                Don't have an account?
                <Link to="/signup2" className={styles.switchFormLink}>
                  Sign Up Now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
