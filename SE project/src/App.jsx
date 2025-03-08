import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./welcome.jsx";
import SignIn from "./signin.jsx";
import Signup from "./signup2.jsx";
import SocietyScreen from "./societies.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup2" element={<Signup />} />
        <Route path="/society" element={<SocietyScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
