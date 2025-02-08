import React from "react";

const SignIn = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Sign In</h1>
      <input type="email" placeholder="Enter your email" style={styles.input} />
      <input
        type="password"
        placeholder="Enter your password"
        style={styles.input}
      />
      <button style={styles.button}>Login</button>
    </div>
  );
};
export default SignIn;
// Styles
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
    // background: "linear-gradient(to bottom,#12100E,#2B4162)",
    background: "#009FC2",
    background: "linear-gradient(to bottom,#0093E9, #80D0C7)", // Purple-Blue Gradient
    color: "white",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    marginBottom: "10px",
    width: "250px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
  },
  button: {
    backgroundColor: "#1e90ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
  },
};
