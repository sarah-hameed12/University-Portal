import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom"; // Removed Link if not used
import axios from "axios";
import { FiUsers, FiMessageSquare, FiThumbsUp, FiPlus, FiTrash2, FiHeadphones } from "react-icons/fi";
import styles from './CommunityDetail.module.css'; // Import the CSS module
import modalStyles from './Communities.module.css'; // Import shared modal styles

// Add this utility function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Add at top of file
const CommunityContext = React.createContext(null);

// Main component
const CommunityDetail = ({ currentUser }) => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [membership, setMembership] = useState(null);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [showJoinRequestForm, setShowJoinRequestForm] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [voiceChannels, setVoiceChannels] = useState([]);

  // Fetch community and its posts
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch community details
        const communityResponse = await axios.get(`http://127.0.0.1:8000/api/feed/communities/${communityId}/`);
        setCommunity(communityResponse.data);
        console.log("Community data:", communityResponse.data);
        
        // Fetch posts specific to this community
        const postsResponse = await axios.get(`http://127.0.0.1:8000/api/feed/communities/${communityId}/posts/`);
        console.log("Community posts raw data:", postsResponse.data);

        // Check if we're getting an array or if we need to parse it
        const postsData = Array.isArray(postsResponse.data) 
          ? postsResponse.data 
          : postsResponse.data.results || [];
        console.log("Processed posts data:", postsData);

        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching community details:", err);
        setError("Failed to load community. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (communityId) {
      console.log("Fetching data for community:", communityId);
      fetchCommunityDetails();
      fetchVoiceChannels(); // Add this line
    }
  }, [communityId]);

  // Check if user is admin
  const isAdmin = currentUser && community && community.creator_id === currentUser.id;

  // Check membership and request status on load
  useEffect(() => {
    if (currentUser && communityId) {
      const checkMembershipStatus = async () => {
        try {
          // Use the correct endpoint from your urls.py
          const membershipResponse = await axios.get(
            `http://127.0.0.1:8000/api/feed/communities/${communityId}/membership/`,
            {
              params: { user_id: currentUser.id }
            }
          );
          
          if (membershipResponse.data.is_member) {
            setMembership(membershipResponse.data);
          } else {
            // Check for pending join requests
            const requestResponse = await axios.get(
              `http://127.0.0.1:8000/api/feed/join-requests/`,
              {
                params: {
                  community: communityId,
                  user_id: currentUser.id,
                  status: 'pending'
                }
              }
            );
            
            if (requestResponse.data.length > 0) {
              setJoinRequestStatus('pending');
            } else {
              setJoinRequestStatus(null);
            }
          }
        } catch (error) {
          console.error("Error checking membership status:", error);
        }
      };
      
      checkMembershipStatus();
    }
  }, [currentUser, communityId]);

  // Fetch pending requests if user is admin
  useEffect(() => {
    if (isAdmin && communityId) {
      const fetchPendingRequests = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/feed/join-requests/`, {
            params: {
              community: communityId,
              status: 'pending'
            }
          });
          setPendingRequests(response.data);
        } catch (error) {
          console.error("Error fetching pending requests:", error);
        }
      };
      
      fetchPendingRequests();
    }
  }, [isAdmin, communityId]);

  // Function to handle liking a post
  const handleLikePost = async (postId) => {
    if (!currentUser) {
      alert("You need to sign in to like posts.");
      return;
    }

    try {
      // Send both user_id and user_name to support the backend
      await axios.post(`http://127.0.0.1:8000/api/feed/posts/${postId}/like/`, {
        user_id: currentUser.id,
        user_name: currentUser.email || currentUser.id // Use email as name if available
      });
      
      // Refresh the posts to update likes
      const postsResponse = await axios.get(`http://127.0.0.1:8000/api/feed/communities/${communityId}/posts/`);
      const postsData = Array.isArray(postsResponse.data) 
        ? postsResponse.data 
        : postsResponse.data.results || [];
      setPosts(postsData);
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like post. Please try again.");
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Function to handle deleting a post
  const handleDeletePost = async (postId) => {
    try {
      // Include user_id in the request body using axios config
      await axios.delete(`http://127.0.0.1:8000/api/feed/posts/${postId}/`, {
        data: { user_id: currentUser.id }  // This is how you send data with DELETE requests
      });
      
      // Update posts state, removing the deleted post
      setPosts(posts.filter(post => post.id !== postId));
      
      // Show success notification
      alert("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Handle join request submission
  const handleJoinRequest = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("You need to sign in to join communities");
      return;
    }
    
    try {
      await axios.post(`http://127.0.0.1:8000/api/feed/join-requests/`, {
        community: communityId,
        user_id: currentUser.id,
        user_name: currentUser.email || currentUser.id,
        message: joinRequestMessage
      });
      
      setJoinRequestStatus('pending');
      setShowJoinRequestForm(false);
      alert("Join request submitted successfully");
    } catch (error) {
      console.error("Error submitting join request:", error);
      alert("Failed to submit join request. Please try again.");
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/feed/join-requests/${requestId}/approve/`, {
        admin_id: currentUser.id
      });
      
      // Update pending requests list
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      alert("Request approved");
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/feed/join-requests/${requestId}/reject/`, {
        admin_id: currentUser.id
      });
      
      // Update pending requests list
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      alert("Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    }
  };

  // In your CommunityDetail component
  const handleCreatePost = async (postData) => {
    try {
      setIsCreatingPost(true);
      
      // Make sure community is included
      const payload = {
        ...postData,
        author_id: currentUser?.id,
        author_name: currentUser?.email || 'Anonymous',
      };
      
      console.log("Creating post with data:", payload);
      
      // Use the community-specific posts endpoint
      const response = await axios.post(
        `http://127.0.0.1:8000/api/feed/communities/${communityId}/posts/`,
        payload
      );
      
      console.log("Post created successfully:", response.data);
      
      // Add the new post to the state
      setPosts(prevPosts => [response.data, ...prevPosts]);
      setIsCreatePostModalOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Add function to fetch voice channels
  const fetchVoiceChannels = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/feed/communities/${communityId}/voice-channels/`
      );
      setVoiceChannels(response.data);
    } catch (error) {
      console.error("Error fetching voice channels:", error);
    }
  };

  // Add function to create voice channel
  const createVoiceChannel = async (name) => {
    try {
      if (!name || name.trim() === '') {
        alert("Please enter a valid channel name");
        return;
      }
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/feed/communities/${communityId}/voice-channels/`,
        { name: name.trim() }
      );
      
      console.log("Voice channel created:", response.data);
      setVoiceChannels([...voiceChannels, response.data]);
    } catch (error) {
      console.error("Error creating voice channel:", error);
      alert("Failed to create voice channel. Please try again.");
    }
  };

  // Add this function to your CommunityDetail component
  const deleteVoiceChannel = async (channelId) => {
    if (!window.confirm("Are you sure you want to delete this voice channel?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/feed/voice-channels/${channelId}/?user_id=${currentUser.id}`);
      
      // Update local state to remove the deleted channel
      setVoiceChannels(prevChannels => 
        prevChannels.filter(channel => channel.id !== channelId)
      );
      
    } catch (error) {
      console.error("Error deleting voice channel:", error);
      alert("Failed to delete voice channel. Please try again.");
    }
  };

  if (isLoading) {
    return <div className={styles.loadingOrError}>Loading...</div>;
  }

  if (error) {
    return <div className={`${styles.loadingOrError} ${styles.errorText}`}>{error}</div>;
  }

  if (!community) {
    return <div className={styles.loadingOrError}>Community not found</div>;
  }

  // Update the action buttons section to show appropriate join options
  const renderJoinButton = () => {
    if (!currentUser) {
      return (
        <button 
          className={styles.joinButton}
          onClick={() => alert("Please sign in to join communities")}
        >
          <FiUsers size={16} />
          Sign in to Join
        </button>
      );
    }
    
    if (membership) {
      return (
        <button className={`${styles.joinButton} ${styles.alreadyMember}`}>
          <FiUsers size={16} />
          Member
        </button>
      );
    }
    
    if (joinRequestStatus === 'pending') {
      return (
        <button className={`${styles.joinButton} ${styles.pendingRequest}`}>
          <FiUsers size={16} />
          Join Request Pending
        </button>
      );
    }
    
    if (community?.privacy_type === 'public') {
      // For public communities, join directly
      return (
        <button 
          className={styles.joinButton}
          onClick={async () => {
            try {
              await axios.post(`http://127.0.0.1:8000/api/feed/community-members/`, {
                community: communityId,
                user_id: currentUser.id,
                display_name: currentUser.email || currentUser.id
              });
              setMembership({
                user_id: currentUser.id,
                member_type: 'member'
              });
              alert("You've joined the community!");
            } catch (error) {
              console.error("Error joining community:", error);
            }
          }}
        >
          <FiUsers size={16} />
          Join Community
        </button>
      );
    } else {
      // For restricted communities, show request button
      return (
        <>
          <button 
            className={styles.joinButton}
            onClick={() => setShowJoinRequestForm(true)}
          >
            <FiUsers size={16} />
            Request to Join
          </button>
          
          {/* Join Request Form Modal */}
          {showJoinRequestForm && (
            <div className={modalStyles.modalOverlay} onClick={() => setShowJoinRequestForm(false)}>
              <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                <h3 className={modalStyles.modalTitle}>Request to Join {community.name}</h3>
                <button 
                  className={modalStyles.modalCloseButton} 
                  onClick={() => setShowJoinRequestForm(false)}
                >
                  ×
                </button>
                <form onSubmit={handleJoinRequest}>
                  <p className={styles.joinRequestInfo}>
                    This community requires approval from an administrator to join.
                  </p>
                  <textarea
                    placeholder="Message to community administrators (optional)"
                    className={modalStyles.modalFormTextArea}
                    value={joinRequestMessage}
                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                  />
                  <button type="submit" className={modalStyles.modalSubmitButton}>
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      );
    }
  };

  // Add pending requests section for admins
  const renderPendingRequestsSection = () => {
    if (!isAdmin || pendingRequests.length === 0) return null;
    
    return (
      <div className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <h3>Pending Join Requests ({pendingRequests.length})</h3>
          <button 
            className={styles.toggleButton}
            onClick={() => setShowPendingRequests(!showPendingRequests)}
          >
            {showPendingRequests ? "Hide" : "Show"}
          </button>
        </div>
        
        {showPendingRequests && (
          <div className={styles.requestsList}>
            {pendingRequests.map(request => (
              <div key={request.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <span className={styles.userName}>{request.user_name}</span>
                  <span className={styles.requestDate}>
                    {formatDate(request.created_at)}
                  </span>
                </div>
                
                {request.message && (
                  <p className={styles.requestMessage}>"{request.message}"</p>
                )}
                
                <div className={styles.requestActions}>
                  <button 
                    className={`${styles.requestButton} ${styles.approveButton}`}
                    onClick={() => handleApproveRequest(request.id)}
                  >
                    Approve
                  </button>
                  <button 
                    className={`${styles.requestButton} ${styles.rejectButton}`}
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <CommunityContext.Provider value={{ community }}>
      <div className={styles.pageContainer}>
        {/* Community Banner */}
        <div
          className={styles.communityBanner}
          style={{ backgroundImage: community.banner_image ? `url(${community.banner_image})` : undefined }}
        />

        {/* Community Header */}
        <div className={styles.communityHeader}>
          <div className={styles.communityIconWrapper}>
            {community.icon_image ? (
              <img src={community.icon_image} alt={`${community.name} icon`} className={styles.communityIcon} />
            ) : (
              <FiUsers size={40} className={styles.communityIcon} /> // Adjusted size
            )}
          </div>
          <div className={styles.communityHeaderText}>
            <h1 className={styles.communityName}>{community.name}</h1>
            <div className={styles.communityStats}>
              <span><FiUsers size={16} /> {community.member_count || 0} members</span>
              <span>•</span>
              <span>Created {formatDate(community.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Admin section for pending requests */}
        {renderPendingRequestsSection()}

        {/* Community Description */}
        {community.description && (
          <p className={styles.communityDescription}>{community.description}</p>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtonsContainer}>
          {/* Dynamic join button based on community type */}
          {renderJoinButton()}
          
          {/* Only show create post button to members */}
          {(membership || isAdmin) && (
            <button
              className={styles.createPostButton}
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              <FiPlus size={16} />
              Create Post
            </button>
          )}
        </div>

        {/* Voice Channels Section */}
        <div className={styles.voiceChannelsSection}>
          <h3>Voice Channels</h3>
          
          {voiceChannels.length > 0 ? (
            <div className={styles.voiceChannelList}>
              {voiceChannels.map(channel => (
                <div key={channel.id} className={styles.voiceChannelItem}>
                  <div className={styles.channelInfo}>
                    <FiHeadphones size={16} />
                    <span>{channel.name}</span>
                    <span className={styles.userCount}>
                      {channel.participant_count} users
                    </span>
                  </div>
                  
                  <div className={styles.channelActions}>
                    <Link to={`/communities/${communityId}/voice/${channel.id}`}>
                      <button className={styles.joinButton}>Join</button>
                    </Link>
                    
                    {/* Only show delete button for admins */}
                    {isAdmin && (
                      <button 
                        className={styles.deleteButton}
                        onClick={() => deleteVoiceChannel(channel.id)}
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No voice channels yet.</p>
          )}
          
          {(membership || isAdmin) && (
            <button 
              className={styles.createChannelButton}
              onClick={() => {
                const name = prompt("Enter voice channel name:");
                if (name) createVoiceChannel(name);
              }}
            >
              <FiPlus size={16} />
              Create Voice Channel
            </button>
          )}
        </div>

        {/* Posts - only show if public or user is member */}
        {(community.privacy_type === 'public' || membership || isAdmin) ? (
          <div className={styles.postsContainer}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={handleDeletePost}
                  currentUser={currentUser}  // Make sure to pass this prop
                  handleLikePost={handleLikePost} // Add this prop
                  onCommentDeleted={(updatedPosts) => setPosts(updatedPosts)} // Add this line
                />
              ))
            ) : (
              <div className={styles.noPosts}>
                No posts in this community yet. Be the first to post!
              </div>
            )}
          </div>
        ) : (
          <div className={styles.privateCommunityMessage}>
            <FiUsers size={32} />
            <h3>This is a restricted community</h3>
            <p>You must be a member to view posts.</p>
          </div>
        )}

        {/* Create Post Modal */}
        {isCreatePostModalOpen && (
          <CreateCommunityPostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
            onPostCreated={(newPost) => {
              setPosts([newPost, ...posts]); // Add new post to the top
            }}
            communityId={communityId}
            currentUser={currentUser}
          />
        )}
      </div>
    </CommunityContext.Provider>
  );
};

// Post Card Component
const PostCard = ({ post, onDelete, currentUser, handleLikePost, onCommentDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Add this line to access the community from context
  const { community } = React.useContext(CommunityContext);
  
  // Safe check for currentUser and community
  const canDelete = currentUser && (
    post.author_id === currentUser.id || 
    (community && community.creator_id === currentUser.id)
  );
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inside the PostCard component, add these state variables at the top
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Add this handleSubmitComment function
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You need to sign in to comment.");
      return;
    }
    
    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    
    try {
      setIsSubmittingComment(true);
      const response = await axios.post(`http://127.0.0.1:8000/api/feed/posts/${post.id}/comments/`, {
        content: commentText,
        author_name: currentUser.email || currentUser.id,
        author_email: currentUser.email
      });
      
      // Check if we got a successful response
      if (response.status === 201) {
        setCommentText('');
        setShowCommentForm(false);
        
        // Refresh the community posts to show the new comment
        const refreshResponse = await axios.get(`http://127.0.0.1:8000/api/feed/communities/${community.id}/posts/`);
        if (refreshResponse.data) {
          const updatedPosts = Array.isArray(refreshResponse.data) 
            ? refreshResponse.data 
            : refreshResponse.data.results || [];
          setPosts(updatedPosts);
          alert("Comment posted successfully!");
        }
      } else {
        alert("Error posting comment. Please try again.");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(`Failed to post comment: ${error.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Add this function inside the PostCard component
  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      alert("You need to be signed in to delete comments");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/feed/comments/${commentId}/`, {
        data: { 
          user_id: currentUser.id,
          author_email: currentUser.email  // Add this line
        }
      });
      
      // Refresh posts to update comments
      const refreshResponse = await axios.get(`http://127.0.0.1:8000/api/feed/communities/${community.id}/posts/`);
      if (refreshResponse.data) {
        const updatedPosts = Array.isArray(refreshResponse.data) 
          ? refreshResponse.data 
          : refreshResponse.data.results || [];
        
        // We need to access the setPosts function from the parent component
        if (typeof onCommentDeleted === 'function') {
          onCommentDeleted(updatedPosts);
        }
        
        alert("Comment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(`Failed to delete comment: ${error.response?.data?.detail || error.message}`);
    }
  };
  
  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          Posted by {post.author_name || 'Anonymous'} • {formatDate(post.created_at || post.timestamp)}
        </div>
        {/* Add post menu for delete (only for author/admin) */}
        {canDelete && (
          <div className={styles.postMenu} ref={menuRef}>
            <button 
              className={styles.postMenuButton} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Post options"
            >
              {/* Three dots menu icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className={styles.postMenuDropdown}>
                <button 
                  className={styles.postMenuOption}
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      onDelete(post.id);
                    }
                  }}
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add conditional rendering for title */}
      {post.title && <h2 className={styles.postTitle}>{post.title}</h2>}
      
      {/* Keep the content rendering */}
      {post.content && <p className={styles.postContent}>{post.content}</p>}
      
      {/* Handle both image and image_url */}
      {(post.image_url || post.image) && (
        <img 
          src={post.image_url || post.image} 
          alt={post.title || 'Post image'} 
          className={styles.postImage} 
        />
      )}
      
      <div className={styles.postActions}>
        <button
          className={styles.postActionButton}
          onClick={() => handleLikePost(post.id)}
          title="Like Post"
        >
          <FiThumbsUp size={16} />
          {post.like_count || 0}
        </button>
        
        <button 
          className={styles.postActionButton} 
          onClick={() => setShowCommentForm(!showCommentForm)}
          title={showCommentForm ? "Cancel" : "Add Comment"}
        >
          <FiMessageSquare size={16} />
          {showCommentForm ? "Cancel" : "Comment"}
        </button>
      </div>

      {/* Display comments section */}
      <div className={styles.commentsSection}>
        {post.latest_comment ? (
          <>
            <h4 className={styles.commentsSectionTitle}>Comments</h4>
            <div className={styles.commentsList}>
              {/* Display latest comment */}
              <div className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>{post.latest_comment.author_name}</span>
                  <span className={styles.commentDate}>
                    {formatDate(post.latest_comment.timestamp)}
                  </span>
                </div>
                <div className={styles.commentContent}>
                  {post.latest_comment.content}
                </div>
                
                {/* Add delete button if current user is author or admin */}
                {(currentUser && 
                 (post.latest_comment.author_email === currentUser.email || 
                  community.creator_id === currentUser.id)) && (
                  <div className={styles.commentActions}>
                    <button 
                      className={styles.commentDeleteButton}
                      onClick={() => handleDeleteComment(post.latest_comment.id)}
                      title="Delete comment"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
              
              {/* Link to view all comments if there are more */}
              <button 
                onClick={() => window.location.href = `/post/${post.id}/comments`}
                className={styles.viewMoreCommentsButton}
              >
                View all comments
              </button>
            </div>
          </>
        ) : (
          <div className={styles.noComments}>No comments yet</div>
        )}
      </div>

      {/* Add comment form */}
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <textarea
            className={styles.commentInput}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isSubmittingComment}
            required
          />
          <button 
            type="submit" 
            className={styles.commentSubmitButton}
            disabled={isSubmittingComment || !commentText.trim()}
          >
            {isSubmittingComment ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}
    </div>
  );
};

// Create Post Modal Component
const CreateCommunityPostModal = ({ isOpen, onClose, onPostCreated, communityId, currentUser }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      
      console.log("Creating post with title:", title);
      console.log("Post content:", content);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('community', communityId);
      formData.append('author_id', currentUser?.id || '');
      formData.append('author_name', currentUser?.email || 'Anonymous');
      
      if (image) {
        formData.append('image', image);
      }

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // CHANGE THIS: Use community-specific endpoint
      const response = await axios.post(
        `http://127.0.0.1:8000/api/feed/communities/${communityId}/posts/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Close the modal and update the post list
      onPostCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Use modal styles from Communities module
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={modalStyles.modalCloseButton} onClick={onClose}>×</button>
        <h2 className={modalStyles.modalTitle}>Create a New Post</h2>

        {error && <div className={modalStyles.modalError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Post title"
            className={modalStyles.modalFormInput} // Use imported style
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <textarea
            placeholder="What's on your mind? (Optional)"
            className={modalStyles.modalFormTextArea} // Use imported style
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          {/* Use detail page styles for file input */}
          <div className={styles.fileUploadContainer}>
            <label className={styles.fileUploadLabel}>Add an image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput} // Style the input itself
              disabled={isSubmitting}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className={styles.filePreview}
              />
            )}
          </div>
          <button
            type="submit"
            className={modalStyles.modalSubmitButton} // Use imported style
            disabled={isSubmitting || !title.trim()} // Disable if no title
          >
            {isSubmitting ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityDetail;