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
  const [validId, setValidId] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #667eea, #764ba2)";
  }, []);

  // Real-time validation
  useEffect(() => {
    setValidId(/^\d{8}$/.test(studentId));
  }, [studentId]);

  useEffect(() => {
    setValidPassword(password.length >= 6);
    setPasswordsMatch(password === confirmPassword && password.length >= 6);
  }, [password, confirmPassword]);

  const handleNext = () => {
    if (!validId) {
      setMessage("❌ Invalid ID! Please enter an 8-digit LUMS ID.");
      return;
    }
    setEmail(`${studentId}@lums.edu.pk`);
    setStep(2);
    setMessage("");
  };

  const handleRegister = async () => {
    if (!validPassword || !passwordsMatch) {
      setMessage("❌ Fix password errors before proceeding.");
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
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="card"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="heading">REGISTER</h1>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <input
                type="text"
                placeholder="Enter your LUMS ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={validId ? "input valid" : "input invalid"}
              />
              {!validId && studentId.length > 0 && (
                <p className="error">❌ Must be 8-digit LUMS ID.</p>
              )}
              <button
                onClick={handleNext}
                className="button"
                disabled={!validId}
              >
                Next
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={validPassword ? "input valid" : "input invalid"}
              />
              {!validPassword && password.length > 0 && (
                <p className="error">❌ At least 6 characters.</p>
              )}

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={passwordsMatch ? "input valid" : "input invalid"}
              />
              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="error">❌ Passwords must match.</p>
              )}

              <button
                onClick={handleRegister}
                className="button"
                disabled={!validPassword || !passwordsMatch || loading}
              >
                {loading ? "Registering..." : "Verify Email"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.p
              key="step3"
              className="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              ✅ Email verification sent! Check your inbox.
            </motion.p>
          )}
        </AnimatePresence>

        {message && <p className="message">{message}</p>}
      </motion.div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .card {
          width: 280px;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        .heading {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border-radius: 20px;
          font-size: 16px;
          border: 2px solid #ccc;
          transition: border 0.3s ease-in-out;
        }
        .valid {
          border: 2px solid #2ecc71;
        }
        .invalid {
          border: 2px solid #e74c3c;
        }
        .button {
          width: 80%;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .button:disabled {
          background: gray;
          cursor: not-allowed;
        }
        .error {
          color: #e74c3c;
          font-size: 12px;
        }
        .success {
          color: #2ecc71;
          font-size: 16px;
          font-weight: bold;
        }
      `}</style>
    </motion.div>
  );
};

export default Signup;
