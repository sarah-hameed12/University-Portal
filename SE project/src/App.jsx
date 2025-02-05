import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./welcome.jsx";
import SignIn from "./signin.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
};

export default App;
