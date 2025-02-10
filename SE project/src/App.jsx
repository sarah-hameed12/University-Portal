import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./welcome.jsx";
import SignIn from "./signin.jsx";
import Signup from "./signup2.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup2" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
