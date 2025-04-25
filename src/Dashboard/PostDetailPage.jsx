// src/PostDetailPage.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiSend,
  FiLoader,
  FiThumbsUp,
  FiMessageCircle,
  FiShare,
  FiTrash2,
  FiX,
} from "react-icons/fi"; // Add necessary icons

// Import shared components (if they exist and are suitable)
import { SideNav } from "./dashboard"; // Assuming SideNav is exportable from Dashboard or separate file
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // Import delete modal
const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Styles --- (Combine relevant styles or create new ones)
// Using a subset/adaptation of styles from Dashboard & SocietyDetail for consistency
const styles = {
  // --- Layout ---
  pageContainer: {
    // Similar to dashboardContainer but might not need fixed height
    display: "flex",
    height: "100vh", // Use minHeight instead of height
    backgroundColor: "#111827",
    color: "#e5e7eb",
    fontFamily: "sans-serif",
  },
  mainContent: {
    // Similar to dashboardMainContent
    flexGrow: 1,
    marginLeft: "256px", // Adjust if SideNav width changes
    display: "flex",
    flexDirection: "column",
  },
  scrollableArea: {
    // Similar to dashboardScrollableArea, but maybe different padding
    flexGrow: 1,
    overflowY: "auto",
    padding: "30px 40px", // Adjust padding
    position: "relative", // For potential absolute elements inside
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(140, 120, 255, 0.6) transparent",
  },
  loadingErrorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 100px)", // Adjust height calculation
    color: "#a0a3bd",
    fontSize: "1.1rem",
  },
  // --- Post Display --- (Adapting PostItem styles)
  postDisplayContainer: {
    backgroundColor: "#1f2937",
    borderRadius: "12px", // Softer radius
    padding: "20px 25px",
    marginBottom: "30px",
    border: "1px solid #2d3748",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  postHeader: { display: "flex", alignItems: "center", marginBottom: "15px" },
  postAuthorAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    marginRight: "15px",
    border: "2px solid #4b5563",
    objectFit: "cover",
  },
  postAuthorName: { fontWeight: "600", color: "#a78bfa", fontSize: "1.05rem" },
  postTimestamp: { fontSize: "0.8rem", color: "#9ca3af" },
  postImage: {
    borderRadius: "10px",
    marginBottom: "15px",
    maxHeight: "450px",
    width: "100%",
    objectFit: "cover",
  },
  postContent: {
    color: "#e5e7eb",
    marginBottom: "20px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    lineHeight: "1.6",
  },
  postActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(74, 77, 109, 0.4)",
    paddingTop: "15px",
    marginTop: "20px",
  },
  postActionButtonGroup: { display: "flex", gap: "25px" }, // Slightly more gap
  postActionButton: {
    background: "none",
    border: "none",
    color: "#a0a3bd",
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.95rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  postActionButtonLiked: { color: "#8c78ff", fontWeight: "600" },
  postActionButtonHover: { color: "#f0f0f5" },
  postDeleteButton: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    cursor: "pointer",
    padding: "5px",
    fontSize: "0.95rem",
    transition: "color 0.2s ease, transform 0.1s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  postDeleteButtonHover: { color: "#f87171", transform: "scale(1.05)" },
  buttonSpinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#f0f0f5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  // --- Comments Section ---
  commentsSection: {
    marginTop: "30px",
  },
  commentsTitle: {
    fontSize: "1.4rem",
    fontWeight: "600",
    color: "#a391ff", // Accent color
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #374151",
  },
  commentsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "20px", // Gap between comments
  },
  // --- Comment Item ---
  commentItem: {
    display: "flex",
    gap: "15px",
    padding: "15px",
    backgroundColor: "#1f2937", // Slightly different bg for comments
    borderRadius: "10px",
    border: "1px solid #2d3748",
  },
  commentAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid #4b5563",
  },
  commentContentWrapper: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  commentHeader: {
    display: "flex",
    alignItems: "baseline", // Align name and time nicely
    gap: "10px",
    marginBottom: "5px",
  },
  commentAuthorName: {
    fontWeight: "600",
    color: "#c7d2fe", // Lighter name color
    fontSize: "0.95rem",
  },
  commentTimestamp: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  commentText: {
    fontSize: "0.9rem",
    color: "#e5e7eb",
    lineHeight: "1.5",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  // --- Comment Form ---
  commentFormSection: {
    marginTop: "30px",
    paddingTop: "25px",
    borderTop: "1px solid #374151",
  },
  commentForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  commentTextarea: {
    width: "100%",
    minHeight: "80px",
    padding: "12px 15px",
    borderRadius: "8px",
    backgroundColor: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #4b5563",
    boxSizing: "border-box",
    resize: "vertical",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  commentTextareaFocus: {
    borderColor: "#8c78ff",
    boxShadow: "0 0 0 3px rgba(140, 120, 255, 0.25)",
  },
  commentSubmitButton: {
    // Using enhanced button style base
    padding: "10px 25px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    backgroundColor: "#8c78ff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
    display: "flex", // Use flex for loader alignment
    alignItems: "center",
    justifyContent: "center", // Center content (text/loader)
    gap: "8px",
    alignSelf: "flex-end", // Align button to the right
    minWidth: "110px", // Give it minimum width
  },
  commentSubmitButtonHover: {
    backgroundColor: "#7a6ae0",
    boxShadow: "0 4px 10px rgba(140, 120, 255, 0.3)",
    transform: "translateY(-1px)",
  },
  commentSubmitButtonDisabled: {
    backgroundColor: "#4b5563",
    color: "#a0a3bd",
    cursor: "not-allowed",
    boxShadow: "none",
    transform: "none",
  },
  commentError: {
    color: "#f87171",
    fontSize: "0.85rem",
    textAlign: "right", // Align error near button
    marginTop: "-10px", // Adjust spacing
  },
  // Keyframes (already defined in Dashboard)
  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
  commentDeleteButton: {
    // Style for the comment delete button
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "3px 5px",
    marginLeft: "auto", // Pushes button to the right
    fontSize: "0.85rem",
    lineHeight: "1",
    borderRadius: "4px",
    transition: "color 0.2s ease, background-color 0.2s ease",
    ":hover": { color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.1)" },
  },
  commentDeleteButtonSpinner: {
    // Smaller spinner for comment delete
    width: "12px",
    height: "12px",
    border: "2px solid rgba(239, 68, 68, 0.3)",
    borderTopColor: "#f87171",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  postActionButtonLiked: { color: "#8c78ff", fontWeight: "600" },
};

// --- Helper Component for Individual Comments ---
const CommentItem = ({
  comment,
  currentUser,
  postAuthorId,
  onDeleteComment,
}) => {
  const avatarSrc =
    comment.author_profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${
      comment.author_name || "anon"
    }`;
  const canDelete =
    currentUser &&
    (currentUser.id === comment.author_id || currentUser.id === postAuthorId);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isConfirmCommentDeleteOpen, setIsConfirmCommentDeleteOpen] =
    useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);
  const openConfirmModal = () => {
    if (!canDelete || isDeletingComment) return;
    setIsConfirmCommentDeleteOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmCommentDeleteOpen(false);
  };

  const handleConfirmCommentDelete = async () => {
    if (!canDelete) return;
    setIsDeletingComment(true);
    try {
      await onDeleteComment(comment.id);
      // Success: component will likely unmount via parent state update
    } catch (error) {
      console.error(
        "Failed to delete comment (in CommentItem confirm):",
        error
      );
      setIsDeletingComment(false); // Reset loading on error
      closeConfirmModal(); // Close modal on error
    }
  };

  // Combine base and hover style for delete button
  const commentDeleteButtonStyle = {
    ...styles.commentDeleteButton,
    ...(hoveredDelete && styles.commentDeleteButton[":hover"]), // Apply hover pseudo-class style
  };
  return (
    <>
      <motion.li
        style={styles.commentItem}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} // Animate exit
        layout // Animate layout shift
        transition={{ duration: 0.3 }} // Control entry animation speed
      >
        <img
          src={avatarSrc}
          alt={comment.author_name || "Commenter"}
          style={styles.commentAvatar}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${
              comment.author_name || "anon"
            }`;
          }}
        />
        <div style={styles.commentContentWrapper}>
          <div style={styles.commentHeader}>
            <span style={styles.commentAuthorName}>
              {comment.author_name || "Anonymous"}
            </span>
            <span style={styles.commentTimestamp}>
              {new Date(comment.timestamp).toLocaleString()}
            </span>
            {/* Delete Button */}
            {canDelete && (
              <button
                style={commentDeleteButtonStyle} // Apply combined style
                onClick={openConfirmModal}
                disabled={isDeletingComment}
                onMouseEnter={() => setHoveredDelete(true)}
                onMouseLeave={() => setHoveredDelete(false)}
                aria-label="Delete comment"
              >
                {isDeletingComment ? (
                  <div style={styles.commentDeleteButtonSpinner}></div> // Use specific smaller spinner
                ) : (
                  <FiTrash2 size="1em" /> // Adjust size as needed
                )}
              </button>
            )}
          </div>
          <p style={styles.commentText}>{comment.content}</p>
        </div>
      </motion.li>
      {/* Confirmation Modal for this specific comment */}
      <AnimatePresence>
        {isConfirmCommentDeleteOpen && (
          <ConfirmDeleteModal
            isOpen={isConfirmCommentDeleteOpen}
            onClose={closeConfirmModal}
            onConfirm={handleConfirmCommentDelete}
            isDeleting={isDeletingComment}
            itemName="comment"
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- Post Detail Page Component ---
const PostDetailPage = () => {
  const { postId } = useParams(); // Get post ID from URL
  const navigate = useNavigate();

  // --- State ---
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Need current user for actions/commenting
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isLikingPost, setIsLikingPost] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); // State for liking
  //   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // For POST deletion
  //     const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Ref for scrolling to comments form or list
  const commentsEndRef = useRef(null);
  const commentFormRef = useRef(null);

  // --- Fetch Current User (similar to Dashboard) ---
  // This assumes you have a way to get the current user's details
  // For simplicity, fetching based on session, adapt if using context/props
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isMounted) {
        // Fetch profile details associated with the session user
        axios
          .get(`/api/profile/?email=${encodeURIComponent(session.user.email)}`)
          .then((response) => {
            if (isMounted) {
              setCurrentUser({
                id: session.user.id,
                email: session.user.email,
                name: response.data?.name || session.user.email,
                profilePicUrl: response.data?.profile_pic_url,
              });
            }
          })
          .catch((err) => {
            console.error("Error fetching current user profile:", err);
            if (isMounted) {
              // Still set basic user if profile fetch fails
              setCurrentUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.email,
                profilePicUrl: null,
              });
            }
          });
      } else if (isMounted) {
        setCurrentUser(null);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Fetch Post and Comments ---
  const fetchPostAndComments = useCallback(async () => {
    if (!postId) return;
    setLoadingPost(true);
    setLoadingComments(true);
    setError(null);
    try {
      // Fetch post and comments concurrently
      const [postResponse, commentsResponse] = await Promise.all([
        axios.get(`/api/feed/posts/${postId}/`),
        axios.get(`/api/feed/posts/${postId}/comments/`),
      ]);
      const fetchedPost = postResponse.data;
      setPost(fetchedPost);
      const initialLikeStatus = fetchedPost?.is_liked_by_user || false;
      const initialLikeCount = fetchedPost?.like_count || 0;
      console.log(
        `[PostDetailPage fetch] Initializing local like state: isLiked=${initialLikeStatus}, likeCount=${initialLikeCount}`
      );
      setComments(commentsResponse.data.results || commentsResponse.data || []);
      setIsLiked(fetchedPost?.is_liked_by_user || false);
      setLikeCount(fetchedPost?.like_count || 0); // Handle pagination/direct list
    } catch (err) {
      console.error("Error fetching post or comments:", err);
      setError(
        err.response?.status === 404
          ? "Post not found."
          : "Failed to load details."
      );
      setPost(null);
      setComments([]);
    } finally {
      setLoadingPost(false);
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]); // Depend on the memoized function

  // --- Handlers ---

  // Like Handler (Adapted from Dashboard)
  const handleLikePost = useCallback(
    async (postIdToLike) => {
      // Renamed param for clarity
      if (!currentUser?.name || currentUser.name === currentUser.email) {
        alert("Please complete your profile before liking.");
        throw new Error("User name missing");
      }
      setIsLikingPost(true);
      const originalIsLiked = isLiked;
      const originalLikeCount = likeCount; // Set loading state for like
      try {
        const response = await axios.post(
          `/api/feed/posts/${postIdToLike}/like/`,
          { user_name: currentUser.name }
        );
        const backendStatus = response.data?.status === "liked";
        const backendCount = response.data?.like_count;
        setIsLiked(backendStatus);
        setLikeCount(backendCount ?? originalLikeCount);
        // Update the post state directly on this page
        setPost((prevPost) => ({
          ...prevPost,
          is_liked_by_user: response.data?.status === "liked",
          like_count: response.data?.like_count ?? prevPost.like_count,
        }));
        // Return value for potential use (though PostItem inside might not use it now)
        return {
          status: response.data?.status,
          like_count: response.data?.like_count,
        };
      } catch (error) {
        console.error(`Like error:`, error.response?.data || error.message);
        alert("Failed to update like status.");
        throw error;
      } finally {
        setIsLikingPost(false);
      }
    },
    [currentUser, likeCount]
  );

  // Delete Handler (Adapted from Dashboard)
  const handleDeletePost = useCallback(
    async (postIdToDelete) => {
      const currentUserId = currentUser?.id;
      if (!currentUserId) {
        alert("User ID not found.");
        return Promise.reject("User ID missing");
      }

      try {
        await axios.delete(`/api/feed/posts/${postIdToDelete}/`, {
          data: { user_id: currentUserId },
        });
        // If deletion is successful, navigate away
        navigate("/"); // Navigate back to dashboard/home after delete
      } catch (error) {
        console.error(`Delete error:`, error.response?.data || error.message);
        let errorMsg = "Could not delete post.";
        if (error.response?.status === 403) errorMsg = "Permission denied.";
        else if (error.response?.status === 401)
          errorMsg = "Authentication failed.";
        else if (error.response?.status === 404) errorMsg = "Post not found.";
        else if (error.response?.status === 400)
          errorMsg = `Bad Request: ${error.response.data?.detail || ""}`;
        alert(errorMsg);
        throw error; // Re-throw so the modal knows it failed
      }
    },
    [currentUser, navigate]
  );
  const handleDeleteComment = useCallback(
    async (commentId) => {
      const currentUserId = currentUser?.id;
      if (!currentUserId) {
        alert("Cannot delete comment: User not identified.");
        throw new Error("User ID missing for comment delete");
      }
      console.log(
        `Attempting delete for comment ${commentId} by user ${currentUserId}`
      );
      // Note: Backend verifies if this user_id is allowed to delete this commentId
      try {
        await axios.delete(`/api/feed/comments/${commentId}/`, {
          data: { user_id: currentUserId }, // Send user_id for backend verification
        });
        setComments((prevComments) =>
          prevComments.filter((c) => c.id !== commentId)
        );
        setPost((prevPost) => ({
          ...prevPost,
          comment_count: Math.max(0, (prevPost.comment_count ?? 1) - 1),
        }));
      } catch (error) {
        console.error(
          `Failed to delete comment ${commentId}:`,
          error.response?.data || error.message
        );
        alert(
          "Could not delete comment. " +
            (error.response?.data?.detail || "Please try again.")
        );
        throw error; // Re-throw for CommentItem to catch
      }
    },
    [currentUser, post?.comment_count]
  );
  const openDeleteModal = () => setIsConfirmModalOpen(true);
  const closeDeleteModal = () => setIsConfirmModalOpen(false);
  const confirmDelete = async () => {
    setIsDeletingPost(true); // Show loading in modal
    try {
      await handleDeletePost(postId); // Call the actual delete logic
      // Navigation happens inside handleDeletePost on success
    } catch (e) {
      // Error already handled/alerted in handleDeletePost
      setIsDeletingPost(false); // Reset loading on error
      closeDeleteModal(); // Close modal on error
    }
    // Don't set isDeletingPost false on success, as we navigate away
  };

  // Handle Comment Submission
  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || isSubmittingComment || !currentUser) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const response = await axios.post(`/api/feed/posts/${postId}/comments/`, {
        content: newComment,
        user_id: currentUser.id, // Send necessary identifiers
        author_name: currentUser.name,
        author_email: currentUser.email,
      });
      const createdComment = response.data;

      // Add the new comment (returned by the API) to the list
      setComments((prevComments) => [...prevComments, response.data]);
      setNewComment(""); // Clear input
      // Optional: Scroll to the new comment
      setPost((prevPost) => ({
        ...prevPost,
        // Increment count safely, use fetched comments length as fallback
        comment_count: (prevPost.comment_count ?? comments.length) + 1,
        // Optionally update latest_comment preview if desired
        latest_comment: {
          author_name: createdComment.author_name,
          content: createdComment.content,
        },
      }));
      setTimeout(
        () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } catch (err) {
      console.error(
        "Error submitting comment:",
        err.response?.data || err.message
      );
      setCommentError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // --- Render Logic ---
  const isLoading = loadingPost || loadingComments; // Combine loading states

  if (isLoading && !post) {
    // Show initial loading only if post isn't loaded yet
    return (
      <div style={{ ...styles.pageContainer, ...styles.loadingErrorContainer }}>
        <FiLoader
          style={{ animation: "spin 1s linear infinite", marginRight: "10px" }}
        />{" "}
        Loading Post...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.pageContainer, ...styles.loadingErrorContainer }}>
        Error: {error}{" "}
        <Link to="/" style={{ marginLeft: "15px", color: "#8c78ff" }}>
          Go Home
        </Link>
      </div>
    );
  }

  if (!post) {
    // Should be caught by error state, but good fallback
    return (
      <div style={{ ...styles.pageContainer, ...styles.loadingErrorContainer }}>
        Post not found.
      </div>
    );
  }

  // Check if current user is the author of the main post
  const isPostAuthor =
    currentUser && post.author_id && currentUser.id === post.author_id;

  // Dynamic Styles
  const submitCommentButtonStyle = {
    ...styles.commentSubmitButton,
    ...(isSubmittingComment
      ? styles.commentSubmitButtonDisabled
      : styles.commentSubmitButtonHover), // Apply disabled or hover
  };
  const commentTextareaStyle = {
    ...styles.commentTextarea,
    // ...(isCommentAreaFocused && styles.commentTextareaFocus) // Add focus state if needed
  };
  const likeButtonStyle = {
    ...styles.postActionButton,
    ...(isLiked && styles.postActionButtonLiked), // Apply liked style based on local 'isLiked' state
  };

  return (
    <div style={styles.pageContainer}>
      <SideNav /> {/* Include SideNav */}
      <main style={styles.mainContent}>
        <div style={styles.scrollableArea}>
          {/* Post Display */}
          <motion.div
            style={styles.postDisplayContainer}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Replicated PostItem Header */}
            <div style={styles.postHeader}>
              <img
                src={
                  post?.author_profile_pic_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                    post.author_name || "anon"
                  }`
                }
                alt={post.author_name || "Author"}
                style={styles.postAuthorAvatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${
                    post.author_name || "anon"
                  }`;
                }}
              />
              <div>
                <p style={styles.postAuthorName}>
                  {post.author_name || "Anonymous"}
                </p>
                <p style={styles.postTimestamp}>
                  {new Date(post.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            {/* Post Content & Image */}
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post content"
                style={styles.postImage}
              />
            )}
            <p style={styles.postContent}>{post.content}</p>
            {/* Post Actions (Like, Comment Count, Share, Delete) */}
            <div style={styles.postActions}>
              <div style={styles.postActionButtonGroup}>
                <button
                  style={likeButtonStyle} // Apply dynamic style
                  onClick={() => handleLikePost(post.id)}
                  disabled={isLikingPost || !currentUser}
                >
                  {isLikingPost ? (
                    <div style={styles.buttonSpinnerSmall}></div>
                  ) : (
                    <FiThumbsUp />
                  )}
                  <span style={{ marginLeft: isLikingPost ? "8px" : "0" }}>
                    {likeCount} Like{likeCount !== 1 ? "s" : ""}{" "}
                    {/* Use local likeCount */}
                  </span>
                </button>
                <button
                  style={styles.postActionButton}
                  onClick={() => commentFormRef.current?.focus()}
                >
                  {" "}
                  {/* Focus input on click */}
                  <FiMessageCircle /> {comments.length} Comment
                  {comments.length !== 1 ? "s" : ""}
                </button>
                {/* Add Share Button Logic if needed */}
                {/* <button style={styles.postActionButton}><FiShare /> Share</button> */}
              </div>
              {isPostAuthor && (
                <button
                  style={styles.postDeleteButton}
                  onClick={openDeleteModal}
                  disabled={isDeletingPost}
                  title="Delete Post"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            style={styles.commentsSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 style={styles.commentsTitle}>Comments ({comments.length})</h3>

            {/* Comment Form */}
            <div style={styles.commentFormSection}>
              <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                <textarea
                  ref={commentFormRef} // Ref to allow focus
                  style={commentTextareaStyle}
                  placeholder={
                    currentUser
                      ? `Add a comment as ${
                          currentUser.name || currentUser.email
                        }...`
                      : "Log in to comment..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment || !currentUser}
                  rows={3}
                  // onFocus={...} onBlur={...} // Add focus state if desired
                />
                {commentError && (
                  <p style={styles.commentError}>{commentError}</p>
                )}
                <motion.button
                  type="submit"
                  style={submitCommentButtonStyle}
                  disabled={
                    !newComment.trim() || isSubmittingComment || !currentUser
                  }
                  whileHover={
                    !newComment.trim() || isSubmittingComment || !currentUser
                      ? {}
                      : { scale: 1.03 }
                  }
                  whileTap={
                    !newComment.trim() || isSubmittingComment || !currentUser
                      ? {}
                      : { scale: 0.97 }
                  }
                >
                  {isSubmittingComment ? (
                    <FiLoader
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <FiSend />
                  )}
                  <span style={{ marginLeft: "8px" }}>Comment</span>
                </motion.button>
              </form>
            </div>

            {/* Comments List */}
            {loadingComments && !comments.length ? ( // Show loading only if comments aren't loaded yet
              <p
                style={{
                  textAlign: "center",
                  color: "#a0a3bd",
                  marginTop: "20px",
                }}
              >
                Loading comments...
              </p>
            ) : (
              <ul style={styles.commentsList}>
                <AnimatePresence>
                  {comments.length > 0 ? (
                    [...comments]
                      .reverse()
                      .map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          currentUser={currentUser}
                          postAuthorId={post?.author_id}
                          onDeleteComment={handleDeleteComment}
                        />
                      ))
                  ) : (
                    <motion.p
                      key="no-comments"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ textAlign: "center", color: "#a0a3bd" }}
                    >
                      Be the first to comment!
                    </motion.p>
                  )}
                </AnimatePresence>
                <div ref={commentsEndRef} /> {/* Target for scrolling */}
              </ul>
            )}
          </motion.div>
        </div>
      </main>
      {/* Render Confirmation Modal */}
      <AnimatePresence>
        {" "}
        {isConfirmModalOpen && (
          <ConfirmDeleteModal
            isOpen={isConfirmModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            isDeleting={isDeletingPost}
            itemName="post"
          />
        )}{" "}
      </AnimatePresence>
      {/* Keyframes style tag */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Keyframes style tag needed if using inline animation */}
    </div>
  );
};

export default PostDetailPage;
