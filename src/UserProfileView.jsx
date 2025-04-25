import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./UserProfileView.module.css";

import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBookOpen,
  FiAward,
  FiHeart,
  FiBriefcase,
  FiHome,
  FiAlertCircle,
} from "react-icons/fi";

const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};
const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const UserProfileView = () => {
  const { email } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfileView = useCallback(async () => {
    if (!email) {
      setError("No user email specified in the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    console.log("Fetching profile view for email:", email);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(email)}`
      );
      console.log("Profile view data received:", response.data);
      setProfileData(response.data);
    } catch (err) {
      console.error(
        "Error fetching profile view:",
        err.response?.data || err.message || err
      );
      if (err.response && err.response.status === 404) {
        setError(`Profile not found for ${email}.`);
        setProfileData(null);
      } else if (err.response && err.response.status === 403) {
        setError("Permission denied: Could not fetch profile information.");
      } else {
        setError("Failed to load profile data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchUserProfileView();
  }, [fetchUserProfileView]);

  const formatMultiLine = (text) => {
    if (!text)
      return <span className={styles.notSpecified}>Not specified</span>;
    const items = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    return items.length > 0 ? (
      items.join(", ")
    ) : (
      <span className={styles.notSpecified}>Not specified</span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        {" "}
        {/* Outer container for potential future structure */}
        <div className={styles.statusContainer}>
          {" "}
          {/* Centering container */}
          <div className={styles.spinner}></div>
          <p className={styles.statusText}>Loading User Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={styles.pageContainer}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/dashboard"
          title="Back to Dashboard"
          className={styles.backToHomeLink}
        >
          <motion.div
            className={styles.backToHomeButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome className={styles.backToHomeIcon} />
          </motion.div>
        </Link>
        {/* Use motion.div for the error card if you want animations */}
        <motion.div className={styles.errorCard} variants={cardVariants}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Error Loading Profile</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className={styles.backButton}
          >
            Go Back to Dashboard
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!profileData) {
    return (
      <motion.div
        className={styles.pageContainer}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/dashboard"
          title="Back to Dashboard"
          className={styles.backToHomeLink}
        >
          <motion.div
            className={styles.backToHomeButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome className={styles.backToHomeIcon} />
          </motion.div>
        </Link>
        <motion.div className={styles.errorCard} variants={cardVariants}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Profile Unavailable</h2>
          <p className={styles.errorMessage}>
            The profile for this user could not be loaded or does not exist.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className={styles.backButton}
          >
            Go Back to Dashboard
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Successful Data Display
  const avatarSrc =
    profileData?.profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${
      profileData?.name || email || "User" // Fallback seed
    }`;

  return (
    <motion.div
      className={styles.pageContainer}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        to="/dashboard"
        title="Back to Dashboard"
        className={styles.backToHomeLink}
      >
        <motion.div
          className={styles.backToHomeButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiHome className={styles.backToHomeIcon} />
        </motion.div>
      </Link>
      <motion.div className={styles.profileCard} variants={cardVariants}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <motion.div className={styles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt={`${profileData.name || "User"}'s Profile`}
              className={styles.avatar}
            />
          </motion.div>
          <div className={styles.headerInfo}>
            <h1 className={styles.profileName}>
              {profileData.name || "User Profile"}
            </h1>
            <p className={styles.profileSubheading}>
              {profileData.major && profileData.school ? (
                `${profileData.major}, ${profileData.school}`
              ) : profileData.school ? (
                profileData.school
              ) : (
                <span className={styles.notSpecified}>
                  School/Major Not Specified
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Details Grid */}
        <div className={styles.detailsGrid}>
          {/* Batch */}
          <div className={styles.detailItem}>
            <FiAward className={styles.detailIcon} />
            <div className={styles.detailTextContent}>
              {" "}
              {/* Wrap text */}
              <span className={styles.detailLabel}>Batch:</span>
              <span className={styles.detailValue}>
                {profileData.batch || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}
              </span>
            </div>
          </div>

          {/* School */}
          <div className={styles.detailItem}>
            <FiBookOpen className={styles.detailIcon} />
            <div className={styles.detailTextContent}>
              {" "}
              {/* Wrap text */}
              <span className={styles.detailLabel}>School:</span>
              <span className={styles.detailValue}>
                {profileData.school || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}
              </span>
            </div>
          </div>

          {/* Major */}
          <div className={styles.detailItem}>
            {/* Using same icon, adjusted opacity via CSS */}
            <FiBookOpen
              className={styles.detailIcon}
              style={{ opacity: 0.7 }}
            />
            <div className={styles.detailTextContent}>
              {" "}
              {/* Wrap text */}
              <span className={styles.detailLabel}>Major:</span>
              <span className={styles.detailValue}>
                {profileData.major || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className={styles.detailItem}>
            <FiMail className={styles.detailIcon} />
            <div className={styles.detailTextContent}>
              {" "}
              {/* Wrap text */}
              <span className={styles.detailLabel}>Email:</span>
              <span className={`${styles.detailValue} ${styles.emailValue}`}>
                {email || "Not available"} {/* Display email from URL param */}
              </span>
            </div>
          </div>

          {/* Courses - Full Width */}
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <div className={styles.fullWidthLabelContainer}>
              {" "}
              {/* Label/Icon container */}
              <FiBriefcase className={styles.detailIcon} />
              <span className={styles.detailLabel}>Courses:</span>
            </div>
            <p className={`${styles.detailValue} ${styles.multiLine}`}>
              {formatMultiLine(profileData.courses)}
            </p>
          </div>

          {/* Interests - Full Width */}
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <div className={styles.fullWidthLabelContainer}>
              {" "}
              {/* Label/Icon container */}
              <FiHeart className={styles.detailIcon} />
              <span className={styles.detailLabel}>Interests:</span>
            </div>
            <p className={`${styles.detailValue} ${styles.multiLine}`}>
              {formatMultiLine(profileData.interests)}
            </p>
          </div>
        </div>{" "}
        {/* End detailsGrid */}
      </motion.div>{" "}
      {/* End profileCard */}
    </motion.div> // End pageContainer
  );
};

export default UserProfileView;
