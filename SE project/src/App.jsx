import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./welcome.jsx";
import SignIn from "./signin.jsx";
import Signup from "./signup2.jsx";
import SocietyScreen from "./societies.jsx";
import DocsTab from "./documents.jsx";
import Outlines from "./outlines.jsx";
import Calculator from "./calculator.jsx";
import Scheduler from "./scheduler.jsx";
import Dashboard from "./dashboard.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route index element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup2" element={<Signup />} />
        <Route path="/society" element={<SocietyScreen />} />
        <Route path="/documents" element={<DocsTab />} />
        <Route path="/outlines" element={<Outlines />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
