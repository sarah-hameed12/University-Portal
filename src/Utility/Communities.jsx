import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiPlus,
  FiUsers,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import styles from "../Styles/Communities.module.css"; 

const Communities = ({ user }) => {
  
  const [communities, setCommunities] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCommunityId, setHoveredCommunityId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false); 
  const navigate = useNavigate();

  
  const tabs = [
    { id: "all", label: "All Communities", icon: <FiUsers size={16} /> },
    { id: "trending", label: "Trending", icon: <FiTrendingUp size={16} /> },
    { id: "new", label: "New", icon: <FiClock size={16} /> },
    ...(user
      ? [{ id: "my", label: "My Communities", icon: <FiStar size={16} /> }]
      : []),
  ];

 
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://127.0.0.1:8000/api/feed/communities/"
        );
        
        setCommunities(response.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  
  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (community.description &&
        community.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedCommunities = (() => {
    switch (activeTab) {
      case "trending":
        return [...filteredCommunities].sort(
          (a, b) => (b.member_count || 0) - (a.member_count || 0)
        );
      case "new":
        return [...filteredCommunities].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "my":
        return filteredCommunities.filter(
          (community) => community.creator_id === user?.id
        );
      default:
        return filteredCommunities;
    }
  })();

  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Communities</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.createButton}
          >
            <FiPlus size={18} /> Create Community
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchSection}>
          <div className={styles.searchBarContainer}>
            <FiSearch className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search communities..."
              className={styles.searchInput} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsSection}>
          <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.activeTab : ""
                }`} 
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentSection}>
          {isLoading ? (
            <div className={styles.loader}>
              <div className={styles.loaderDots}>
                <div className={styles.loaderDot}></div>
                <div className={styles.loaderDot}></div>
                <div className={styles.loaderDot}></div>
              </div>
              <div className={styles.loaderText}>Loading communities...</div>
            </div>
          ) : displayedCommunities.length > 0 ? (
            <div className={styles.communityGrid}>
              {displayedCommunities.map((community) => (
                <div
                  key={community.id}
                  className={styles.communityCard} 
                  onMouseEnter={() => setHoveredCommunityId(community.id)}
                  onMouseLeave={() => setHoveredCommunityId(null)}
                  onClick={() => navigate(`/communities/${community.id}`)}
                >
                  <div
                    className={styles.communityBanner}
                    style={{
                      
                      backgroundImage: community.banner_image
                        ? `url(${community.banner_image})`
                        : "linear-gradient(135deg, #374151 0%, #111827 100%)",
                    }}
                  />
                  <div className={styles.communityIconWrapper}>
                    {community.icon_image ? (
                      <img
                        src={community.icon_image}
                        alt={`${community.name} icon`}
                        className={styles.communityIcon}
                      />
                    ) : (
                      <FiUsers size={28} className={styles.communityIcon} />
                    )}
                  </div>
                  <div className={styles.communityInfo}>
                    <h3 className={styles.communityName}>{community.name}</h3>
                    <p className={styles.communityDescription}>
                      {community.description || "No description available"}
                    </p>
                    <div className={styles.communityMeta}>
                      <div className={styles.metaItem}>
                        <FiUsers size={14} />
                        <span>{community.member_count || 0} members</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FiMessageSquare size={14} />
                        {/* Make sure your API provides post_count */}
                        <span>{community.post_count || 0} posts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noCommunitiesContainer}>
              <FiUsers size={48} className={styles.noCommunitiesIcon} />
              <h3 className={styles.noCommunitiesTitle}>
                {/* ... (empty state titles) ... */}
                {searchQuery
                  ? "No communities match your search"
                  : activeTab === "my" && user
                  ? "You haven't created any communities yet"
                  : "No communities available"}
              </h3>
              <p className={styles.noCommunitiesText}>
                {/* ... (empty state text) ... */}
                {searchQuery
                  ? "Try using different keywords or clear your search"
                  : activeTab === "my" && user
                  ? "Create your first community to get started!"
                  : "Be the first to create a community and connect with others!"}
              </p>
              <button
                className={styles.noCommunitiesButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <FiPlus size={16} /> Create Community
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isCreateModalOpen && (
          <CreateCommunityModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCommunityCreated={(newCommunity) => {
              setCommunities([...communities, newCommunity]);
              navigate(`/communities/${newCommunity.id}`);
            }}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
};


const CreateCommunityModal = ({
  isOpen,
  onClose,
  onCommunityCreated,
  currentUser,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [privacyType, setPrivacyType] = useState("public");

  
  const handlePrivacyChange = (e) => {
    setPrivacyType(e.target.value);
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Community name is required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/feed/communities/",
        {
          name: name, 
          description: description, 
          banner_image: bannerImage || null,
          icon_image: iconImage || null,
          creator_id: currentUser?.id, 
          creator_name: currentUser?.email || "Anonymous", 
          privacy_type: privacyType || "public", 
        }
      );
      onCommunityCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Error creating community:", err);
      setError("Failed to create community. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          ×
        </button>
        <h3 className={styles.modalTitle}>Create New Community</h3>

        {error && <p className={styles.modalError}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Community Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.modalFormInput} 
            required
            disabled={isSubmitting}
          />
          <textarea
            placeholder="Community Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.modalFormTextArea} 
            disabled={isSubmitting}
          />
          <input
            type="url"
            placeholder="Banner Image URL (Optional)"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            className={styles.modalFormInput} 
            disabled={isSubmitting}
          />
          <input
            type="url"
            placeholder="Icon Image URL (Optional)"
            value={iconImage}
            onChange={(e) => setIconImage(e.target.value)}
            className={styles.modalFormInput} 
            disabled={isSubmitting}
          />
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Community Privacy:</label>
            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="public"
                  name="privacy"
                  value="public"
                  checked={privacyType === "public"}
                  onChange={handlePrivacyChange}
                  className={styles.radioInput}
                />
                <label htmlFor="public" className={styles.radioLabel}>
                  Public - Anyone can view and join
                </label>
              </div>

              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="restricted"
                  name="privacy"
                  value="restricted"
                  checked={privacyType === "restricted"}
                  onChange={handlePrivacyChange}
                  className={styles.radioInput}
                />
                <label htmlFor="restricted" className={styles.radioLabel}>
                  Restricted - Anyone can view, approval required to join
                </label>
              </div>

              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="private"
                  name="privacy"
                  value="private"
                  checked={privacyType === "private"}
                  onChange={handlePrivacyChange}
                  className={styles.radioInput}
                />
                <label htmlFor="private" className={styles.radioLabel}>
                  Private - Only members can view and join is by invitation only
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={styles.modalSubmitButton} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Communities;
