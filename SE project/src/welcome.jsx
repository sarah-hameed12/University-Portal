import React from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./opt2.jpg";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Left Side - Card Image with Rounded Corners */}
      <div style={styles.imageCard}>
        <img
          src={backgroundImage}
          alt="Background"
          style={styles.backgroundImage}
        />
        {/* <h1 style={styles.superLumsText}>SUPER LUMS</h1> */}
      </div>

      {/* Right Side - Buttons */}
      <div style={styles.rightContainer}>
        <h1 style={styles.superLumsText}>SUPER LUMS</h1> {/* Move here */}
        <h2 style={styles.welcomeText}>Welcome Back</h2>
        <button style={styles.signinButton} onClick={() => navigate("/signin")}>
          LOGIN
        </button>
        <p style={styles.newUserText}>New to Super Lums?</p>
        <button style={styles.signupButton} onClick={() => navigate("/signup")}>
          REGISTER
        </button>
      </div>
    </div>
  );
};

// Styling
const styles = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    background: "linear-gradient(to right, #000000, #340f42)",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
  },

  // Left Side - Image Card
  imageCard: {
    width: "50%", // Covers more than half but not full width
    height: "90vh", // A little below top, a little above bottom
    position: "relative",
    borderRadius: "40px", // Rounded corners
    transform: "translateX(-15%)", // Adjust for fine-tuning
    overflow: "hidden",
    boxShadow: "0 30px 30px rgba(0, 0, 0, 0.5)", // Soft shadow for depth
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Keeps image proportionate
  },

  superLumsText: {
    fontSize: "3rem",
    fontWeight: "900",
    font: "Bebas Neue ",
    textTransform: "uppercase",
    letterSpacing: "4px",
    background: "linear-gradient(45deg, #ff00ff, #00ffff)", // Gradient Text
    WebkitBackgroundClip: "text",
    color: "transparent",
    marginTop: "-80px",

    marginBottom: "150px", // Space between "SUPER LUMS" and "Welcome Back"
    textAlign: "right",
  },

  // Right Side - Buttons
  rightContainer: {
    width: "30%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  welcomeText: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: "-70px",
    marginBottom: "20px",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
  },

  newUserText: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    color: "#ffffff",
    // marginTop: "-70px",
    marginBottom: "20px",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
  },

  signinButton: {
    background: "#24f4e5",
    background: "linear-gradient(45deg, #ff00ff, #00ffff)",
    // opacity: "100%",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    borderRadius: "50px",
    cursor: "pointer",
    margin: "15px",
    transition: "0.3s",
    boxShadow: "0 4px 15px purple",
  },

  signupButton: {
    background: "rgba(255, 80, 80, 0.7)",
    background: "linear-gradient(45deg, #ff00ff, #00ffff)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    borderRadius: "30px",
    cursor: "pointer",
    margin: "15px",
    transition: "0.3s",
    boxShadow: "0 4px 15px rgba(255, 50, 50, 0.5)",
  },
};

// **🔹 Global Fix for Any Remaining Borders**
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.documentElement.style.margin = "0";
document.documentElement.style.padding = "0";

export default WelcomePage;
