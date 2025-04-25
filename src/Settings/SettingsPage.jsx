import React, { useState } from 'react';
import './settings.css';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion'; 

const SettingsPage = () => {
  const [profileInfo, setProfileInfo] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileInfo({ ...profileInfo, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    // Send profile data to backend
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    // Send password change request to backend
  };

  return (
    <div className="settings-container">
      <Link to="/" title="Back to Home">
        <motion.div
          className="back-to-home-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <FiHome className="back-to-home-icon" />
        </motion.div>
      </Link>

      <h1 className="settings-title">Settings</h1>

      <form className="settings-card" onSubmit={handleSubmitProfile}>
        <h2>Profile Settings</h2>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="name">Name:</label>
          <input
            className="settings-input"
            type="text"
            id="name"
            name="name"
            value={profileInfo.name}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="email">Email:</label>
          <input
            className="settings-input"
            type="email"
            id="email"
            name="email"
            value={profileInfo.email}
            onChange={handleProfileChange}
            required
          />
        </div>
        <button className="settings-button" type="submit">Update Profile</button>
      </form>

      {/* Change Password */}
      <form className="settings-card" onSubmit={handleSubmitPassword}>
        <h2>Change Password</h2>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="oldPassword">Old Password:</label>
          <input
            className="settings-input"
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={password.oldPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="newPassword">New Password:</label>
          <input
            className="settings-input"
            type="password"
            id="newPassword"
            name="newPassword"
            value={password.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            className="settings-input"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={password.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button className="settings-button" type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default SettingsPage;
