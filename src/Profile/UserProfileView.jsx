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
  const [followStatus, setFollowStatus] = useState("not_following"); // 'not_following', 'request_sent_by_me', 'request_received_from_them', 'following', 'self'
  const [actionLoading, setActionLoading] = useState(false); // Generic loading for follow actions
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const getAuthUserAndProfile = async () => {
      console.log("UserProfileView: getAuthUserAndProfile called");
      const {
        data: { user: supabaseUser },
        error: supabaseError,
      } = await supabase.auth.getUser();

      if (supabaseError || !supabaseUser || !supabaseUser.email) {
        console.error(
          "Supabase auth.getUser error or no user:",
          supabaseError || "No user"
        );
        setCurrentUser(null);
        // Still proceed to fetch viewed profile, just without requesting_user context
        fetchUserProfileView(email, null);
        return;
      }

      const emailOfCurrentUserFromSupabase = supabaseUser.email;
      console.log(
        "UserProfileView: Current auth email from Supabase:",
        emailOfCurrentUserFromSupabase
      );
      try {
        // Fetch full profile for current user to get their UUID (user_id)
        // This already uses the apiClient which adds the X-User-Id header if properly configured
        const response = await apiClient.get(
          `/profile/?email=${encodeURIComponent(
            emailOfCurrentUserFromSupabase
          )}`
        );
        console.log(
          "UserProfileView: Fetched current user's full profile:",
          response.data
        );
        setCurrentUser(response.data); // Contains user_id (UUID), name, etc.
        fetchUserProfileView(email, response.data); // Fetch viewed profile *after* current user is known
      } catch (err) {
        console.error(
          `Error fetching current user's (${emailOfCurrentUserFromSupabase}) profile:`,
          err.response?.data || err.message || err
        );
        setCurrentUser({
          email: emailOfCurrentUserFromSupabase,
          user_id: supabaseUser.id,
          errorFetching: true,
        }); // Store Supabase ID as fallback user_id
        fetchUserProfileView(email, {
          email: emailOfCurrentUserFromSupabase,
          user_id: supabaseUser.id,
          errorFetching: true,
        });
      }
    };
    getAuthUserAndProfile();
  }, [email]);

  const fetchUserProfileView = useCallback(
    async (emailToView, currentAuthUser) => {
      if (!emailToView) {
        setError("No user email specified in the URL for viewed profile.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      console.log("fetchUserProfileView: Fetching profile for:", emailToView);

      try {
        const queryParams = { email: emailToView }; // emailToView is already decoded from useParams

        if (currentAuthUser?.email && !currentAuthUser.errorFetching) {
          // currentAuthUser.email is also a raw, decoded email string
          queryParams.requesting_user_email = currentAuthUser.email;
        } else if (currentAuthUser?.errorFetching) {
          console.warn(
            "fetchUserProfileView: Current user profile had an error, not sending requesting_user_email or it might be partial."
          );
        }

        console.log(
          "fetchUserProfileView: Sending queryParams to backend:",
          queryParams
        );

        // Axios will correctly URL-encode the values in the `params` object
        const response = await apiClient.get(`/profile/`, {
          params: queryParams,
        });
        console.log(
          "fetchUserProfileView: Profile data received:",
          response.data
        );
        setProfileData(response.data);
        setFollowStatus(
          response.data.follow_status_with_requester || "not_following"
        );
        setFollowersCount(response.data.followers_count || 0);
      } catch (err) {
        console.error(
          "Error fetching profile view:",
          err.response?.data || err.message || err
        );
        // ... (existing error handling)
        setError(`Profile not found for ${emailToView}.`);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const handleRequestFollow = async () => {
    if (
      !currentUser ||
      !currentUser.user_id || // This is the ID of the person SENDING the request
      !profileData ||
      !profileData.user_id
    ) {
      alert(
        "User information missing for request-follow. CurrentUser or ProfileData is invalid."
      );
      console.log(
        "handleRequestFollow: currentUser:",
        currentUser,
        "profileData:",
        profileData
      );
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        acting_user_id: currentUser.user_id, // This is the ID of the person SENDING the request
      };
      console.log(
        "handleRequestFollow: Sending POST to /users/" +
          profileData.user_id +
          "/request-follow with payload:",
        payload
      );

      // apiClient will add X-User-Id header for the requester (currentUser)
      // AND we are also sending acting_user_id in the body
      await apiClient.post(
        `/users/${profileData.user_id}/request-follow`,
        payload
      ); // Send payload

      setFollowStatus("request_sent_by_me");
      // No change to follower count yet
    } catch (err) {
      console.error(
        "Error sending follow request:",
        err.response?.data || err.message || err
      );
      alert(
        `Failed to send follow request: ${
          err.response?.data?.detail || "Please try again."
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleUnfollow = async () => {
    if (
      !currentUser ||
      !currentUser.user_id ||
      !profileData ||
      !profileData.user_id
    )
      return;
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        `/users/${profileData.user_id}/unfollow`,
        {
          acting_user_id: currentUser.user_id, // This is the ID of the person UNFOLLOWING
        }
      );
      setFollowStatus("not_following");
      setFollowersCount(response.data.follower_count);
    } catch (err) {
      console.error("Error unfollowing user:", err.response?.data || err);
      alert(
        `Failed to unfollow: ${
          err.response?.data?.detail || "Please try again."
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleAcceptRequestFromViewedUser = async () => {
    // This logic is better suited on the current user's profile page (Profile.jsx)
    // or via a notification action.
    // If you want it here, you'd need the request_id.
    alert(
      "Please accept or reject requests from your profile page or notifications."
    );
  };
  const handleCancelFollowRequest = async () => {
    if (
      !currentUser ||
      !currentUser.user_id ||
      !profileData ||
      !profileData.user_id
    )
      return;
    setActionLoading(true);
    try {
      await apiClient.post(
        `/users/${profileData.user_id}/cancel-follow-request`,
        {
          acting_user_id: currentUser.user_id, // This is the ID of the person CANCELLING
        }
      );
      setFollowStatus("not_following");
    } catch (err) {
      console.error(
        "Error cancelling follow request:",
        err.response?.data || err
      );
      alert(
        `Failed to cancel request: ${
          err.response?.data?.detail || "Please try again."
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };
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
    const url = `https://flask-production-1e2d.up.railway.app/api/users/${profileData.user_id}/${action}`;

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

  const renderFollowButton = () => {
    if (
      !currentUser ||
      !profileData ||
      currentUser.user_id === profileData.user_id
    ) {
      return null; // Don't show button for self or if not logged in
    }

    switch (followStatus) {
      case "not_following":
        return (
          <button
            onClick={handleRequestFollow}
            disabled={actionLoading}
            className={`${styles.followButton} ${styles.follow}`}
          >
            {actionLoading ? (
              <FiLoader className={styles.spinner} />
            ) : (
              <FiUserPlus />
            )}
            Request Follow
          </button>
        );
      case "request_sent_by_me":
        return (
          <button
            onClick={handleCancelFollowRequest}
            disabled={actionLoading}
            className={`${styles.followButton} ${styles.pending}`}
          >
            {" "}
            {/* Add 'pending' style */}
            {actionLoading ? (
              <FiLoader className={styles.spinner} />
            ) : (
              <FiClock />
            )}
            Request Sent
          </button>
        );
      case "request_received_from_them":
        // This button might lead to confusion here. Better handled on own profile.
        // For now, just show information or a disabled button.
        return (
          <button
            disabled
            className={`${styles.followButton} ${styles.requestReceived}`}
          >
            {" "}
            {/* Add 'requestReceived' style */}
            <FiUserCheck />
            Follow Request Received
          </button>
        );
      case "following":
        return (
          <button
            onClick={handleUnfollow}
            disabled={actionLoading}
            className={`${styles.followButton} ${styles.unfollow}`}
          >
            {actionLoading ? (
              <FiLoader className={styles.spinner} />
            ) : (
              <FiUserMinus />
            )}
            Unfollow
          </button>
        );
      default:
        return null;
    }
  };
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
        <div className={styles.actionButtons}>{renderFollowButton()}</div>
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
