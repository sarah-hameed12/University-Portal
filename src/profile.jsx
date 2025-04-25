// src/pages/Profile.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
// Assuming src/supabaseClient.js exists and exports supabase
import { createClient } from "@supabase/supabase-js";
// --- >>> Import the single Supabase client instance <<< ---
// import { supabase } from "./supabaseClient"; // Make sure the path is correct

// --- >>> Import Icons <<< ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
import styles from "./Profile.module.css";
import {
  FiUser, // Added FiUser just in case, though not explicitly used in final render maybe
  FiEdit2,
  FiSave,
  FiXCircle,
  FiUploadCloud,
  FiHome,
} from "react-icons/fi";

// Data for Dropdowns
const currentYear = new Date().getFullYear();
const batchYears = Array.from({ length: 8 }, (_, i) => currentYear + 3 - i); // e.g., [2027, 2026, ..., 2020]

const schoolOptions = ["", "SSE", "SDSB", "HSS", "SAHSOL", "SOE"]; // Add empty option

const majorsBySchool = {
  SSE: [
    "",
    "Computer Science",
    "Electrical Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Physics",
    "Biology",
    "Chemistry",
  ],
  SDSB: ["", "Management Sciences (MGMG)", "Accounting & Finance (ACF)"],
  HSS: [
    "",
    "Economics",
    "Political Science",
    "History",
    "Anthropology & Sociology",
    "Literature",
    "Philosophy",
  ],
  SAHSOL: ["", "Law (LLB)"],
  SOE: ["", "Education"], // Add specific majors if known
  "": [], // No majors if no school selected
};

// Animation Variants
const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    // Initialize with empty strings
    name: "",
    batch: "",
    school: "",
    major: "",
    courses: "",
    interests: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [authUserEmail, setAuthUserEmail] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Keep for potential future use
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get Supabase Auth User EMAIL on component mount
  useEffect(() => {
    const getAuthUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        setError("Could not verify user session.");
        setLoading(false);
        return;
      }
      if (user?.email) {
        console.log("Authenticated User Email:", user.email);
        setAuthUserEmail(user.email);
        setCurrentUser(user);
      } else {
        console.error("User not authenticated or email not found");
        setError("You must be logged in to view your profile.");
        setLoading(false);
      }
    };
    getAuthUser();
  }, [navigate]);

  // Fetch Profile Data using EMAIL
  const fetchProfile = useCallback(async () => {
    if (!authUserEmail) return;
    setLoading(true);
    setError(null);
    console.log("Fetching profile for email:", authUserEmail);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
          authUserEmail
        )}`
      );
      console.log("Profile data received:", response.data);
      setProfileData(response.data);
      setFormData(response.data); // Initialize form data with fetched data
    } catch (err) {
      console.error(
        "Error fetching profile:",
        err.response?.data || err.message || err
      );
      if (err.response && err.response.status === 404) {
        setError("Profile not found. Please fill in and save your details.");
        setProfileData({}); // Set to empty object to indicate fetch occurred but no data
        // Initialize form with defaults, keep previously entered email if any
        setFormData({
          name: "",
          batch: "",
          school: "",
          major: "",
          courses: "",
          interests: "",
          email: authUserEmail,
        });
        setIsEditing(true); // Force into edit mode
      } else if (err.response && err.response.status === 403) {
        setError(
          "Could not fetch profile: Email identifier missing or invalid."
        );
      } else {
        setError("Failed to load profile data.");
      }
    } finally {
      setLoading(false);
    }
  }, [authUserEmail]);

  useEffect(() => {
    if (authUserEmail) {
      fetchProfile();
    }
  }, [authUserEmail, fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "school") {
        const validMajors = majorsBySchool[value] || [];
        if (!validMajors.includes(newData.major)) {
          newData.major = "";
        } // Reset major
      }
      return newData;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      // Basic type check
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (file) alert("Please select a valid image file (png, jpg, gif).");
    }
  };

  // Trigger file input
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // Handle Save Changes using EMAIL
  const handleSave = async () => {
    if (!authUserEmail) {
      setError("Cannot save, user email not found.");
      return;
    }
    setSaving(true);
    setError(null);
    const profilePayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        ![
          "profile_pic_url",
          "profile_pic",
          "user_id",
          "email",
          "updated_at",
        ].includes(key)
      ) {
        profilePayload.append(key, value);
      }
    });
    if (selectedFile) {
      profilePayload.append("profile_pic", selectedFile);
    }
    const updateUrl = `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
      authUserEmail
    )}`;
    try {
      const response = await axios.patch(updateUrl, profilePayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileData(response.data);
      setFormData(response.data);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(
        "Error saving profile:",
        err.response?.data || err.message || err
      );
      let specificError = "Failed to save profile. Please check input.";
      if (err.response?.data) {
        const errors = err.response.data;
        specificError = Object.entries(errors)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join("; ");
      } else if (err.response?.status === 403) {
        specificError = "Identifier missing or invalid for update.";
      } else if (err.response?.status === 404) {
        specificError = "Profile to update not found.";
      }
      setError(specificError);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(
      profileData || {
        name: currentUser.name,
        batch: "",
        school: "",
        major: "",
        courses: "",
        interests: "",
        email: authUserEmail,
      }
    );
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const availableMajors = majorsBySchool[formData?.school || ""] || [];

  const isBatchDisabled = !formData?.name?.trim();
  const isSchoolDisabled = isBatchDisabled || !formData?.batch;
  const isMajorDisabled =
    isSchoolDisabled || !formData?.school || availableMajors.length <= 1;
  const isOptionalFieldsDisabled = isMajorDisabled || !formData?.major;

  const isSaveDisabled =
    saving ||
    !formData?.name?.trim() ||
    !formData?.batch ||
    !formData?.school ||
    !formData?.major;

  // Loading State
  if (loading) {
    return <div className={styles.loadingState}>Loading Profile...</div>;
  }

  // Avatar source
  const avatarSrc =
    currentUser.name ||
    previewUrl ||
    profileData?.profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${
      authUserEmail || "default"
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiHome className={styles.backToHomeIcon} />
        </motion.div>
      </Link>

      <motion.div className={styles.profileCard} variants={cardVariants}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <motion.div
            className={`${styles.avatarWrapper} ${
              isEditing ? styles.avatarEditable : ""
            }`}
            onClick={handleAvatarClick}
            title={isEditing ? "Click to change photo" : ""}
            whileHover={isEditing ? { scale: 1.05, opacity: 0.8 } : {}}
          >
            <img src={avatarSrc} alt="Profile" className={styles.avatar} />
            {isEditing && <FiUploadCloud className={styles.uploadIcon} />}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/png, image/jpeg, image/gif"
            />
          </motion.div>
          {!isEditing ? (
            <h1 className={styles.profileName}>
              {" "}
              {profileData?.name || authUserEmail || "User Profile"}{" "}
            </h1>
          ) : (
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Your Name"
              className={`${styles.input} ${styles.nameInput}`}
              disabled={saving}
              required
            />
          )}
          {!isEditing && profileData !== null && (
            <motion.button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Edit Profile"
            >
              {" "}
              <FiEdit2 /> Edit{" "}
            </motion.button>
          )}
        </div>

        <hr className={styles.separator} />

        {/* Error Message */}
        <AnimatePresence>
          {" "}
          {error && (
            <motion.p
              key="error"
              className={styles.errorMessage}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {" "}
              {error}{" "}
            </motion.p>
          )}{" "}
        </AnimatePresence>

        {/* Details Grid */}
        <div className={styles.detailsGrid}>
          {/* Batch */}
          <div className={styles.detailItem}>
            <label htmlFor="batch" className={styles.detailLabel}>
              Batch:
            </label>
            {!isEditing ? (
              <span className={styles.detailValue}>
                {" "}
                {profileData?.batch || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}{" "}
              </span>
            ) : (
              <select
                id="batch"
                name="batch"
                value={formData.batch || ""}
                onChange={handleChange}
                className={styles.select}
                disabled={saving || isBatchDisabled}
                required
              >
                <option value="" disabled>
                  Select Year
                </option>
                {batchYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* School */}
          <div className={styles.detailItem}>
            <label htmlFor="school" className={styles.detailLabel}>
              School:
            </label>
            {!isEditing ? (
              <span className={styles.detailValue}>
                {" "}
                {profileData?.school || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}{" "}
              </span>
            ) : (
              <select
                id="school"
                name="school"
                value={formData.school || ""}
                onChange={handleChange}
                className={styles.select}
                disabled={saving || isSchoolDisabled}
                required
              >
                {schoolOptions.map((school) => (
                  <option key={school} value={school} disabled={school === ""}>
                    {school || "Select School"}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* Major */}
          <div className={styles.detailItem}>
            <label htmlFor="major" className={styles.detailLabel}>
              Major:
            </label>
            {!isEditing ? (
              <span className={styles.detailValue}>
                {" "}
                {profileData?.major || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}{" "}
              </span>
            ) : (
              <select
                id="major"
                name="major"
                value={formData.major || ""}
                onChange={handleChange}
                className={styles.select}
                disabled={saving || isMajorDisabled}
                required
              >
                <option value="" disabled>
                  {" "}
                  {formData.school
                    ? "Select Major"
                    : "Select School First"}{" "}
                </option>
                {availableMajors.map(
                  (major) =>
                    major !== "" && (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    )
                )}
              </select>
            )}
          </div>
          {/* Email */}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Email:</span>
            <span className={`${styles.detailValue} ${styles.readOnlyValue}`}>
              {" "}
              {authUserEmail || "Not available"}{" "}
            </span>
          </div>
          {/* Courses */}
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <label htmlFor="courses" className={styles.detailLabel}>
              Courses (Optional):
            </label>
            {!isEditing ? (
              <p className={`${styles.detailValue} ${styles.multiLine}`}>
                {" "}
                {(profileData?.courses || "").replace(/,/g, ", ") || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}{" "}
              </p>
            ) : (
              <textarea
                id="courses"
                name="courses"
                value={formData.courses || ""}
                onChange={handleChange}
                placeholder="List courses..."
                className={`${styles.input} ${styles.textArea}`}
                disabled={saving || isOptionalFieldsDisabled}
              ></textarea>
            )}
          </div>
          {/* Interests */}
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <label htmlFor="interests" className={styles.detailLabel}>
              Interests (Optional):
            </label>
            {!isEditing ? (
              <p className={`${styles.detailValue} ${styles.multiLine}`}>
                {" "}
                {(profileData?.interests || "").replace(/,/g, ", ") || (
                  <span className={styles.notSpecified}>Not specified</span>
                )}{" "}
              </p>
            ) : (
              <textarea
                id="interests"
                name="interests"
                value={formData.interests || ""}
                onChange={handleChange}
                placeholder="List interests..."
                className={`${styles.input} ${styles.textArea}`}
                disabled={saving || isOptionalFieldsDisabled}
              ></textarea>
            )}
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className={styles.editActions}>
            <motion.button
              className={`${styles.actionButton} ${styles.cancelButton}`}
              onClick={handleCancel}
              disabled={saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {" "}
              <FiXCircle /> Cancel{" "}
            </motion.button>
            <motion.button
              className={`${styles.actionButton} ${styles.saveButton}`}
              onClick={handleSave}
              disabled={isSaveDisabled}
              whileHover={!isSaveDisabled ? { scale: 1.05 } : {}}
              whileTap={!isSaveDisabled ? { scale: 0.95 } : {}}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {saving ? (
                <div className={styles.buttonSpinner}></div>
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Profile;
