import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./signin.module.css";

import { FiUser, FiLock, FiMail } from "react-icons/fi";

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
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
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
    if (!isForgotPasswordView && isValid === false) {
      // Only show ID error in login view if needed
      classes += ` ${styles.inputError}`;
    } else if (isForgotPasswordView && userId && isValid === false) {
      // Show ID error in forgot view if typed & invalid
      classes += ` ${styles.inputError}`;
    }
    return classes;
  };
  // Inside the SignIn component function

  const handlePasswordResetRequest = async () => {
    // Basic validation (reuse existing check)
    if (!isIdValid) {
      setMessage("❌ Please enter a valid 8-digit Student ID.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);
    const email = `${userId}@lums.edu.pk`;
    console.log(`Requesting password reset for: ${email}`);
    const redirectURL = window.location.origin + "/update-password";
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL,
      });

      setLoading(false);

      if (error) {
        console.error("Password reset request error:", error);
        setMessage(
          `❌ Error: ${error.message || "Could not send reset link."}`
        );
        setIsError(true);
      } else {
        setMessage(
          `✅ Password reset link sent to ${email}. Please check your inbox/spam folder.`
        );
        setIsError(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error during password reset:", error);
      setMessage("❌ An unexpected error occurred. Please try again.");
      setIsError(true);
    }
  };
  const toggleView = (isForgot) => {
    setIsForgotPasswordView(isForgot);

    setMessage("");
    setIsError(false);
    // Decide if you want to clear userId/password when switching
    // setUserId('');
    // setPassword('');
    setLoading(false); // Ensure loading stops
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.splitLayout}
        variants={splitLayoutVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side (Keep as is) */}
        <div className={styles.left}>
          {/* ... content ... */}
          <div className={styles.logo}>
            Super<span className={styles.logoAccent}>LUMS</span>
          </div>
          <h2 className={styles.welcomeHeading}>Welcome Back!</h2>
          <p className={styles.welcomeText}>
            Sign in to access your personalized dashboard, connect with peers,
            and explore campus events.
          </p>
        </div>
        {/* Right Side: Form Area */}
        <div className={styles.right}>
          <div className={styles.formWrapper}>
            {/* --- Conditional Heading and Subheading --- */}
            {!isForgotPasswordView ? (
              <>
                <h1 className={styles.heading}>Sign In</h1>
                <p className={styles.subheading}>
                  Use your LUMS ID and password.
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.heading}>Reset Password</h1>
                <p className={styles.subheading}>
                  Enter your LUMS ID to receive a reset link.
                </p>
              </>
            )}
            {/* Form - onSubmit can be removed or adapted if needed */}
            {/* Using onClick for buttons is simpler here */}
            <div className={styles.form}>
              {/* Message Display (Works for both views) */}
              <AnimatePresence>
                {message && <motion.p /* ... */> {message} </motion.p>}
              </AnimatePresence>

              {/* --- User ID Input (Used in both views) --- */}
              <div className={styles.formGroup}>
                <label htmlFor="userId" className={styles.label}>
                  Student ID
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
                    // Apply error class based on validity *and* view context if needed
                    className={getInputClass(isIdValid)}
                    maxLength={8}
                    required
                    // Disable input slightly differently maybe? Optional.
                    // disabled={loading && isForgotPasswordView}
                  />
                  {/* --- Conditional Icon --- */}
                  {
                    !isForgotPasswordView ? (
                      <FiUser className={styles.inputIcon} />
                    ) : (
                      <FiMail className={styles.inputIcon} />
                    ) // Use Mail icon for reset
                  }
                </div>
              </div>

              {/* --- Conditional Password Input (Only for Sign In) --- */}
              {!isForgotPasswordView && (
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
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
                      disabled={loading}
                    />
                    <FiLock className={styles.inputIcon} />
                  </div>
                </div>
              )}

              {/* --- Conditional Links --- */}
              {!isForgotPasswordView ? (
                <div
                  className={
                    styles.helperLinkContainer
                  } /* Add a container class if needed for styling */
                >
                  <button
                    type="button" // Important: prevent form submission
                    onClick={() => toggleView(true)} // Switch to forgot password view
                    className={styles.helperLink} // Reuse link style for button
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }} // Basic button reset
                  >
                    Forgot Password?
                  </button>
                </div>
              ) : (
                <div className={styles.helperLinkContainer}>
                  <button
                    type="button"
                    onClick={() => toggleView(false)} // Switch back to sign in view
                    className={styles.helperLink}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* --- Conditional Submit Button --- */}
              {!isForgotPasswordView ? (
                <motion.button
                  type="button" // Changed from submit, handled by onClick
                  onClick={handleSignIn}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={loading || !isIdValid || !password}
                  whileHover={!loading ? { scale: 1.03 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={
                    {
                      /* ... */
                    }
                  }
                >
                  {loading ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button" // Use type="button"
                  onClick={handlePasswordResetRequest} // Call the reset handler
                  className={`${styles.button} ${styles.buttonPrimary}`} // Reuse primary style
                  disabled={loading || !isIdValid || !userId} // Disable if no valid ID or loading
                  whileHover={!loading ? { scale: 1.03 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={
                    {
                      /* ... */
                    }
                  }
                >
                  {loading ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              )}

              {/* --- Link to Sign Up (Keep visible in both views? Adjust as needed) --- */}
              {!isForgotPasswordView && ( // Optionally hide this in forgot password view
                <div className={styles.switchFormContainer}>
                  Don't have an account?
                  <Link to="/signup2" className={styles.switchFormLink}>
                    Sign Up Now
                  </Link>
                </div>
              )}
            </div>{" "}
            {/* End .form */}
          </div>{" "}
          {/* End .formWrapper */}
        </div>{" "}
        {/* End .right */}
      </motion.div>{" "}
      {/* End .splitLayout */}
    </div> // End .container
  );
};

export default SignIn;
