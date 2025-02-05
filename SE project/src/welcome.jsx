import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  //   const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to Super LUMS</h1>
      <p style={styles.subtext}>Already have an account?</p>
      <button style={styles.signinButton} onClick={() => navigate("/signin")}>
        Sign In
      </button>
      <p style={styles.subtext}>New to SLUMM?</p>
      <button style={styles.signupButton}>Sign Up</button>
    </div>
  );
};
export default WelcomePage;
// Styling
const styles = {
  container: {
    display: "flex",
    position: "fixed",
    flexDirection: "column",
    top: 0,
    left: 0,
    width: "100vw", // Full width
    height: "100vh", // Full height

    alignItems: "center",
    justifyContent: "center",
    // minHeight: "100vh", // Ensures full height coverage
    // width: "100vw", // Ensures full width coverage
    // margin: 0, // Remove any default margin
    // padding: 0, // Remove any default padding
    // height: "100vh",
    background: "linear-gradient(to bottom,#314755,#26a0da)",
    // background: "linear-gradient(to bottom,#0093E9, #80D0C7)", // Purple-Blue Gradient
    color: "white",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  subtext: {
    fontSize: "1.2rem",
    marginBottom: "10px",
  },
  signupButton: {
    backgroundColor: "#ff7f50",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "15px",
    transition: "0.3s",
  },
  signinButton: {
    backgroundColor: "#1e90ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },
};

// Add hover effects
styles.signupButton[":hover"] = { backgroundColor: "#ff6347" };
styles.signinButton[":hover"] = { backgroundColor: "#007bff" };
