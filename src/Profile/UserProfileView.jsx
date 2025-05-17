import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../Styles/UserProfileView.module.css";

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
import apiClient from "../axiosconfig";
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
  FiUserPlus,
  FiUserMinus,
  FiLoader,
  FiClock, // For "Request Sent"
  FiCheckCircle,
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

  const [currentUser, setCurrentUser] = useState(null); // For current logged-in user
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const getAuthUser = async () => {
      console.log("getAuthUser called");
      const {
        data: { user: supabaseUser },
        error: supabaseError,
      } = await supabase.auth.getUser();

      if (supabaseError) {
        console.error("Supabase auth.getUser error:", supabaseError);
        setCurrentUser(null); // Or handle error appropriately
        return;
      }

      if (supabaseUser && supabaseUser.email) {
        const emailOfCurrentUserFromSupabase = supabaseUser.email;
        console.log(
          "getAuthUser: Email from Supabase:",
          emailOfCurrentUserFromSupabase
        );
        console.log(
          "getAuthUser: Preparing to fetch profile for:",
          emailOfCurrentUserFromSupabase
        );
        try {
          const urlToFetch = `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
            emailOfCurrentUserFromSupabase
          )}`;
          console.log(
            "getAuthUser: EXACT URL being fetched for current user:",
            urlToFetch
          ); // Log the exact URL
          const response = await axios.get(urlToFetch);
          console.log(
            "getAuthUser: Successfully fetched current user's profile:",
            response.data
          );
          setCurrentUser(response.data);
        } catch (err) {
          console.error(
            `Error fetching current user's profile for ${emailOfCurrentUserFromSupabase}:`,
            err.response?.data || err.message || err
          );
          setCurrentUser({
            email: emailOfCurrentUserFromSupabase,
            user_id: null,
            errorFetching: true,
          });
        }
      } else {
        console.log("getAuthUser: No Supabase user found or no email.");
        setCurrentUser(null);
      }
    };
    getAuthUser();
  }, []);

  const fetchUserProfileView = useCallback(async () => {
    const viewedProfileEmail = email; // from useParams()
    console.log(
      "fetchUserProfileView: Email of profile to view (from useParams):",
      viewedProfileEmail
    );
    if (!email) {
      setError("No user email specified in the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    "Fetching profile view for email:", email;

    try {
      const queryParams = { email: viewedProfileEmail };
      if (currentUser?.email && !currentUser.errorFetching) {
        // Only add if currentUser was fetched successfully
        queryParams.requesting_user_email = currentUser.email;
      } else if (currentUser?.email && currentUser.errorFetching) {
        console.warn(
          "fetchUserProfileView: Current user profile fetch failed, not sending requesting_user_email."
        );
      }
      console.log(
        "fetchUserProfileView: QueryParams for viewed profile:",
        queryParams
      );
      // const queryParams = { email: email }; // Pass the raw email from useParams
      if (currentUser?.email) {
        // currentUser.email should also be a raw, decoded email string
        queryParams.requesting_user_email = currentUser.email;
      }

      console.log("Sending queryParams to backend:", queryParams);

      const response = await axios.get(`http://127.0.0.1:8000/api/profile/`, {
        params: queryParams, // Axios will handle the necessary URL encoding
      });
      "Profile view data received:", response.data;
      setProfileData(response.data);
      setIsFollowing(response.data.is_followed_by_requester || false);
      setFollowersCount(response.data.followers_count || 0);
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
  }, [email, currentUser]);

  useEffect(() => {
    fetchUserProfileView();
  }, [fetchUserProfileView]);
  const handleFollowToggle = async () => {
    if (
      !currentUser ||
      !currentUser.user_id ||
      !profileData ||
      !profileData.user_id
    ) {
      alert("Cannot perform action. User information missing.");
      return;
    }
    if (currentUser.user_id === profileData.user_id) {
      alert("You cannot follow yourself.");
      return;
    }

    setFollowLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    const url = `http://127.0.0.1:8000/api/users/${profileData.user_id}/${action}`;

    try {
      const response = await axios.post(url, {
        follower_id: currentUser.user_id,
      });
      setIsFollowing(action === "follow");
      setFollowersCount(response.data.follower_count); // Update count from backend response
      // Optionally refetch profile data if more than just count changes:
      // fetchUserProfileView();
    } catch (err) {
      console.error(`Error ${action}ing user:`, err.response?.data || err);
      alert(`Failed to ${action} user. ${err.response?.data?.detail || ""}`);
    } finally {
      setFollowLoading(false);
    }
  };

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

  const canFollow =
    currentUser && profileData && currentUser.user_id !== profileData.user_id;

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
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statCount}>{followersCount}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statCount}>
                  {profileData.following_count || 0}
                </span>
                <span className={styles.statLabel}>Following</span>
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
        {canFollow && (
          <div className={styles.actionButtons}>
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`${styles.followButton} ${
                isFollowing ? styles.unfollow : styles.follow
              }`}
            >
              {followLoading ? (
                <FiLoader className={styles.spinner} />
              ) : isFollowing ? (
                <FiUserMinus />
              ) : (
                <FiUserPlus />
              )}
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        )}
        {/* </div> */}
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
