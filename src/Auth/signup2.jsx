import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import styles from "../Styles/Signup.module.css"; // Import the new CSS Module
import { Link } from "react-router-dom";

// Supabase Client (keep as before)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Animation Variants for Steps/Messages
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { opacity: 0, x: -50, transition: { ease: "easeInOut" } },
};

const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Signup = () => {
  // State variables (keep as before)
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [isIdValid, setIsIdValid] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(null);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(null);

  // Validation logic (keep as before)
  const validateStudentId = (id) => /^\d{8}$/.test(id);
  const validatePassword = (pw) => pw.length >= 6;
  const validateConfirmPassword = (pw, confPw) => confPw && pw === confPw;

  useEffect(() => {
    setIsIdValid(studentId ? validateStudentId(studentId) : null);
  }, [studentId]);
  useEffect(() => {
    setIsPasswordValid(password ? validatePassword(password) : null);
  }, [password]);
  useEffect(() => {
    setDoPasswordsMatch(
      confirmPassword
        ? validateConfirmPassword(password, confirmPassword)
        : null
    );
  }, [password, confirmPassword]);

  // Supabase interactions (keep logic, adjust messages/state)
  const checkUserInDB = async (id) => {
    /* ... (keep logic, use setMessage/setIsError) ... */
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("Error checking user:", error);
      setMessage(`❌ DB Error: ${error.message}`);
      setIsError(true);
      return null;
    }
    return !!data; // Return true if data exists, false otherwise
  };
  const insertUserInDB = async (id, userEmail) => {
    /* ... (keep logic, use setMessage/setIsError) ... */
    const { error } = await supabase
      .from("users")
      .insert([{ id: id, email: userEmail }]);
    if (error) {
      setMessage(`❌ Error saving user: ${error.message}`);
      setIsError(true);
      return false;
    }
    return true;
  };

  // Step Handlers (keep core logic)
  const handleNext = async () => {
    /* ... (keep logic, use setMessage/setIsError) ... */
    if (!isIdValid) {
      setMessage("❌ Invalid ID format (8 digits required).");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    const derivedEmail = `${studentId}@lums.edu.pk`;
    setEmail(derivedEmail);
    const exists = await checkUserInDB(studentId);
    setLoading(false);
    if (exists === null) return;
    if (exists) {
      setMessage("❌ ID already registered. Try signing in.");
      setIsError(true);
      setUserExists(true);
    } else {
      setStep(2);
      setMessage("");
      setIsError(false);
      setUserExists(false);
    }
  };
  const handleRegister = async () => {
    /* ... (keep logic, use setMessage/setIsError) ... */
    if (!isPasswordValid) {
      setMessage("❌ Password too short (min 6 chars).");
      setIsError(true);
      return;
    }
    if (!doPasswordsMatch) {
      setMessage("❌ Passwords don't match.");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    );
    if (signUpError) {
      setMessage(`❌ ${signUpError.message}`);
      setIsError(true);
      setLoading(false);
      return;
    }
    if (!signUpData.user) {
      setMessage(`❌ Signup failed. Try again.`);
      setIsError(true);
      setLoading(false);
      return;
    }
    const inserted = await insertUserInDB(studentId, email);
    setLoading(false);
    if (inserted) {
      // setMessage("✅ Verification email sent! Check your inbox.");
      setIsError(false);
      setStep(3);
    } else {
      console.warn(
        "Auth user created but DB insert failed for ID:",
        studentId
      ); /* Message already set */
    }
  };

  // Navigation/Reset (keep as before)
  const handleGoToSignIn = () => {
    window.location.href = "/signin";
  };
  const handleResetAndRegister = () => {
    /* ... (keep logic) ... */
    setUserExists(false);
    setStudentId("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setIsError(false);
    setStep(1);
    setIsIdValid(null);
    setIsPasswordValid(null);
    setDoPasswordsMatch(null);
  };

  // Input class helper (keep as before)
  const getInputClass = (isValid) => {
    /* ... (keep logic using new styles object) ... */
    if (isValid === false) return `${styles.input} ${styles.inputError}`;
    if (isValid === true) return `${styles.input} ${styles.inputValid}`;
    return styles.input;
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.splitLayout}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left Side */}
        <div className={styles.left}>
          {/* ... welcome content ... */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={styles.logo}>
              Uni<span className={styles.logoAccent}>Social</span>
            </div>
            <h2 className={styles.welcomeHeading}>Connect, Share, Discover.</h2>
            <p className={styles.welcomeText}>
              {" "}
              Join the exclusive network for LUMS students. Find events,
              collaborate on projects, and stay connected with campus life.{" "}
            </p>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.right}>
          <div className={styles.formWrapper}>
            <AnimatePresence mode="wait">
              {/* Display Message */}
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

              {/* Step 1: Enter ID */}
              {step === 1 && !userExists && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ width: "100%" }}
                >
                  <h2 className={styles.heading}>Register - Step 1 of 2</h2>
                  <p className={styles.subheading}>
                    Enter your official LUMS Student ID.
                  </p>
                  <form
                    className={styles.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                  >
                    <div className={styles.formGroup}>
                      <input
                        /* ... ID input ... */ id="studentId"
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder="8-Digit Student ID"
                        value={studentId}
                        onChange={(e) =>
                          setStudentId(
                            e.target.value.replace(/\D/g, "").slice(0, 8)
                          )
                        }
                        className={getInputClass(isIdValid)}
                        maxLength={8}
                        required
                      />
                    </div>
                    <motion.button
                      /* ... Next button ... */ whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={loading || !isIdValid}
                    >
                      {" "}
                      {loading ? "Checking..." : "Next"}{" "}
                    </motion.button>
                    {/* --- >>> ADDED SIGN IN LINK FOR STEP 1 <<< --- */}
                    <div className={styles.switchFormContainer}>
                      Already have an account?
                      <Link to="/signin" className={styles.switchFormLink}>
                        Sign In
                      </Link>
                    </div>
                    {/* --- >>> END ADDED LINK <<< --- */}
                  </form>
                </motion.div>
              )}

              {/* Step 1.5: User Exists */}
              {userExists && (
                <motion.div
                  key="userExists"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ width: "100%" }}
                >
                  <h2 className={styles.heading}>Account Found</h2>
                  <p className={styles.subheading}>
                    This ID is already registered.
                  </p>
                  <motion.button
                    /* ... Sign In button ... */ whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={handleGoToSignIn}
                  >
                    {" "}
                    Sign In Instead{" "}
                  </motion.button>
                  <motion.button
                    /* ... Try Different ID button ... */ whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.button} ${styles.buttonAlt}`}
                    onClick={handleResetAndRegister}
                  >
                    {" "}
                    Use Different ID{" "}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Enter Password */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ width: "100%" }}
                >
                  <h2 className={styles.heading}>Register - Step 2 of 2</h2>
                  <p className={styles.subheading}>
                    Create a secure password for your account.
                  </p>
                  <form
                    className={styles.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegister();
                    }}
                  >
                    <div className={styles.formGroup}>
                      <input
                        /* ... Password input ... */ id="password"
                        type="password"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={getInputClass(isPasswordValid)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        /* ... Confirm Password input ... */ id="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={getInputClass(doPasswordsMatch)}
                        required
                      />
                    </div>
                    <motion.button
                      /* ... Register button ... */ whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={
                        loading || !isPasswordValid || !doPasswordsMatch
                      }
                    >
                      {" "}
                      {loading
                        ? "Creating Account..."
                        : "Create & Verify Email"}{" "}
                    </motion.button>
                    {/* --- >>> ADDED SIGN IN LINK FOR STEP 2 <<< --- */}
                    <div className={styles.switchFormContainer}>
                      Already have an account?
                      <Link to="/signin" className={styles.switchFormLink}>
                        Sign In
                      </Link>
                    </div>
                    {/* --- >>> END ADDED LINK <<< --- */}
                  </form>
                </motion.div>
              )}

              {/* Step 3: Verification Sent */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className={styles.heading}>Almost There!</h2>
                  <p className={`${styles.message} ${styles.successMessage}`}>
                    {" "}
                    ✅ Verification email sent to <strong>{email}</strong>!
                    Check your inbox & spam folder to complete registration.{" "}
                  </p>
                  <motion.button
                    /* ... Go To Sign In button ... */ whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={handleGoToSignIn}
                  >
                    {" "}
                    Proceed to Sign In{" "}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Signup;
