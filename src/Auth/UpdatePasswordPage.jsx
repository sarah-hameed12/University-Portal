// src/UpdatePasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

import styles from "../Styles/signin.module.css";
import { FiLock, FiCheckCircle } from "react-icons/fi";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Check your .env file and VITE_ prefix."
  );
}
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const supabase = createClient(supabaseUrl, supabaseKey);

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      console.log(
        "UpdatePasswordPage mounted. Supabase client will handle hash."
      );
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("UpdatePasswordPage Auth Event:", event);
        if (event === "PASSWORD_RECOVERY") {
          setMessage("Please enter your new password.");
          setIsError(false);
        } else if (event === "USER_UPDATED") {
        } else if (event === "SIGNED_OUT" || !session) {
          setMessage(
            "Session expired or invalid. Please request a new reset link."
          );
          setIsError(true);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters long.");
      setIsError(true);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);
    setIsSuccess(false);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      setLoading(false);

      if (error) {
        throw error;
      }

      console.log("Password updated successfully:", data);
      setMessage("✅ Password updated successfully! You can now sign in.");
      setIsSuccess(true);
      setIsError(false);
      // Clear form
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.error("Password update error:", error);
      setMessage(`❌ ${error.message || "Failed to update password."}`);
      setIsError(true);
      setIsSuccess(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.formOnlyLayout}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Form Wrapper */}
        <div className={styles.formWrapper} style={{ margin: "auto" }}>
          {" "}
          {/* Center content */}
          <div
            className={styles.logo}
            style={{ textAlign: "center", marginBottom: "30px" }}
          >
            Super<span className={styles.logoAccent}>LUMS</span>
          </div>
          <h1 className={styles.heading}>Set New Password</h1>
          <p className={styles.subheading}>
            Enter and confirm your new password below.
          </p>
          <form className={styles.form} onSubmit={handlePasswordUpdate}>
            <AnimatePresence>
              {message && (
                <motion.p
                  key="message"
                  className={`${styles.message} ${
                    isError ? styles.errorMessage : styles.successMessage
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Only show form if not successful */}
            {!isSuccess && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${styles.input} ${styles.inputWithIcon}`}
                      required
                      disabled={loading}
                    />
                    <FiLock className={styles.inputIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${styles.input} ${styles.inputWithIcon} ${
                        password &&
                        confirmPassword &&
                        password !== confirmPassword
                          ? styles.inputError
                          : ""
                      }`} // Basic match validation style
                      required
                      disabled={loading}
                    />
                    <FiLock className={styles.inputIcon} />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={loading || !password || !confirmPassword}
                  // ... animations ...
                  style={
                    {
                      /* ... */
                    }
                  }
                >
                  {loading ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    "Update Password"
                  )}
                </motion.button>
              </>
            )}

            {/* Show link to signin page on success */}
            {isSuccess && (
              <div className={styles.switchFormContainer}>
                <Link to="/signin" className={styles.switchFormLink}>
                  Proceed to Sign In
                </Link>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
