import React, { useState } from "react";
import { TeamMember, TEAM_MEMBERS } from "../data/team";

interface CrewSectionProps {
  onSelectFriendForFilter?: (friendName: string) => void;
  selectedFriendFilter?: string | null;
  onClearFriendFilter?: () => void;
}

export function CrewSection({
  onSelectFriendForFilter,
  selectedFriendFilter,
  onClearFriendFilter,
}: CrewSectionProps) {
  const [crewList, setCrewList] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem("custom_crew_members");
      if (saved) return JSON.parse(saved);
    } catch {}
    return TEAM_MEMBERS;
  });

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendRole, setNewFriendRole] = useState("");
  const [newFriendBio, setNewFriendBio] = useState("");
  const [newFriendTravelStyle, setNewFriendTravelStyle] = useState("");
  const [newFriendInstagram, setNewFriendInstagram] = useState("");
  const [newFriendAvatar, setNewFriendAvatar] = useState("");
  const [newFriendThemeColor, setNewFriendThemeColor] = useState("#38bdf8");

  // Profile avatar updates
  const handleAvatarUpload = (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = crewList.map((m) =>
        m.id === memberId ? { ...m, avatar: result } : m
      );
      setCrewList(updated);
      try {
        localStorage.setItem("custom_crew_members", JSON.stringify(updated));
        localStorage.setItem(`avatar_${memberId}`, result);
        if (memberId === "shanto-khan") {
          localStorage.setItem("shanto_khan_avatar", result);
        }
      } catch {}

      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, avatar: result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    const newMember: TeamMember = {
      id: `crew-${Date.now()}`,
      name: newFriendName.trim(),
      role: newFriendRole.trim() || "Trip Explorer",
      kicker: "CREW MEMBER",
      category: "Operations",
      colorClass: "card-blue",
      themeColor: newFriendThemeColor,
      bio: newFriendBio.trim() || "Passionate adventurer exploring scenic places with the crew.",
      fullDescription: newFriendBio.trim() || "Passionate adventurer exploring scenic places with the crew.",
      experience: "Travel Crew Member",
      skills: ["Road Trips", "Photography", "Camping", "Exploration"],
      avatar: newFriendAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      instagram: newFriendInstagram.trim() || "",
      travelStyle: newFriendTravelStyle.trim() || "🎒 Road Tripper",
      socials: {
        instagram: newFriendInstagram.trim() || "",
      },
    };

    const updated = [...crewList, newMember];
    setCrewList(updated);
    try {
      localStorage.setItem("custom_crew_members", JSON.stringify(updated));
    } catch {}

    // Reset form
    setNewFriendName("");
    setNewFriendRole("");
    setNewFriendBio("");
    setNewFriendTravelStyle("");
    setNewFriendInstagram("");
    setNewFriendAvatar("");
    setIsAddFriendModalOpen(false);
  };

  return (
    <div className="crew-system-container" id="crew-members-section">
      <div className="crew-header-row">
        <div>
          <div className="crew-badge-pill">👥 CREW MEMBERS & FRIENDS</div>
          <h2 className="crew-section-title">Trip Explorers & Travel Squad</h2>
          <p className="crew-section-subtitle">
            Meet the friends who conquer summits, drive endless coasts, and capture cinematic memories together.
          </p>
        </div>
        <div className="crew-actions-group">
          {selectedFriendFilter && (
            <button
              className="clear-crew-filter-btn"
              onClick={onClearFriendFilter}
              title="Clear active friend filter"
            >
              Showing tagged: <strong>{selectedFriendFilter}</strong> ✕
            </button>
          )}
          <button
            className="add-crew-btn"
            onClick={() => setIsAddFriendModalOpen(true)}
            id="add-friend-btn"
          >
            <span>+ Add Friend</span>
          </button>
        </div>
      </div>

      {/* Friends Cards Carousel / Grid */}
      <div className="crew-cards-scroll-track">
        {crewList.map((member) => {
          const isFilterActive = selectedFriendFilter === member.name;
          const instagramUrl = member.instagram
            ? member.instagram.startsWith("http")
              ? member.instagram
              : `https://instagram.com/${member.instagram.replace("@", "")}`
            : null;
          const instagramHandle = member.instagram
            ? member.instagram.startsWith("http")
              ? `@${member.instagram.split("/").filter(Boolean).pop()}`
              : member.instagram.startsWith("@")
              ? member.instagram
              : `@${member.instagram}`
            : null;

          return (
            <div
              key={member.id}
              className={`crew-profile-card ${isFilterActive ? "is-filter-active" : ""}`}
              style={{
                borderColor: isFilterActive ? member.themeColor : `${member.themeColor}33`,
                boxShadow: isFilterActive ? `0 0 25px ${member.themeColor}55` : undefined,
              }}
              id={`crew-card-${member.id}`}
            >
              <div className="crew-card-top">
                <div className="crew-avatar-wrapper">
                  <img
                    src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"}
                    alt={member.name}
                    className="crew-avatar-img"
                    style={{ borderColor: member.themeColor }}
                    onClick={() => setSelectedMember(member)}
                  />
                  <label
                    htmlFor={`avatar-upload-${member.id}`}
                    className="crew-avatar-upload-icon"
                    title="Upload profile photo / GIF"
                  >
                    📷
                  </label>
                  <input
                    id={`avatar-upload-${member.id}`}
                    type="file"
                    accept="image/*,image/gif"
                    hidden
                    onChange={(e) => handleAvatarUpload(member.id, e)}
                  />
                </div>
                <div className="crew-identity">
                  <h3 className="crew-member-name" onClick={() => setSelectedMember(member)}>
                    {member.name}
                  </h3>
                  <span className="crew-role-badge" style={{ color: member.themeColor }}>
                    {member.role}
                  </span>
                  {member.travelStyle && (
                    <span className="crew-travel-style">{member.travelStyle}</span>
                  )}
                </div>
              </div>

              <p className="crew-bio-text">{member.bio}</p>

              {/* Instagram Link & Actions */}
              <div className="crew-card-footer">
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crew-instagram-link"
                    title={`Visit ${member.name} on Instagram`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>{instagramHandle}</span>
                  </a>
                ) : (
                  <span className="crew-instagram-placeholder">No Instagram linked</span>
                )}

                <div className="crew-card-buttons">
                  {onSelectFriendForFilter && (
                    <button
                      className={`crew-filter-btn ${isFilterActive ? "is-active" : ""}`}
                      onClick={() => {
                        if (isFilterActive && onClearFriendFilter) {
                          onClearFriendFilter();
                        } else {
                          onSelectFriendForFilter(member.name);
                        }
                      }}
                      title={`Filter photos & videos featuring ${member.name}`}
                    >
                      {isFilterActive ? "✓ Tagged" : "🔍 Photos"}
                    </button>
                  )}
                  <button
                    className="crew-profile-btn"
                    onClick={() => setSelectedMember(member)}
                    title="View Full Profile & Experience"
                  >
                    Bio →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMember(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-container crew-detail-modal"
            style={{
              borderColor: selectedMember.themeColor,
              boxShadow: `0 25px 70px rgba(0,0,0,0.9), 0 0 40px ${selectedMember.themeColor}33`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedMember(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="crew-modal-header">
              <div className="crew-modal-avatar-box">
                <img
                  src={selectedMember.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"}
                  alt={selectedMember.name}
                  className="crew-modal-avatar-img"
                  style={{ borderColor: selectedMember.themeColor }}
                />
                <label
                  htmlFor={`modal-avatar-upload-${selectedMember.id}`}
                  className="crew-modal-upload-btn"
                  style={{ background: selectedMember.themeColor }}
                >
                  📷 Change Photo / GIF
                </label>
                <input
                  id={`modal-avatar-upload-${selectedMember.id}`}
                  type="file"
                  accept="image/*,image/gif"
                  hidden
                  onChange={(e) => handleAvatarUpload(selectedMember.id, e)}
                />
              </div>

              <div className="crew-modal-info">
                <div className="crew-modal-kicker" style={{ color: selectedMember.themeColor }}>
                  {selectedMember.kicker || "EXPEDITION CREW"}
                </div>
                <h2 className="crew-modal-name">{selectedMember.name}</h2>
                <div className="crew-modal-role">{selectedMember.role}</div>
                {selectedMember.travelStyle && (
                  <div className="crew-modal-style-pill">
                    {selectedMember.travelStyle}
                  </div>
                )}
              </div>
            </div>

            <div className="crew-modal-body">
              <div className="crew-modal-section">
                <h4>About & Travel Bio</h4>
                <p>{selectedMember.fullDescription || selectedMember.bio}</p>
              </div>

              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div className="crew-modal-section">
                  <h4>Expedition Skills & Specialities</h4>
                  <div className="crew-modal-skills-list">
                    {selectedMember.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="crew-skill-chip"
                        style={{ borderColor: `${selectedMember.themeColor}55` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instagram & Links */}
              <div className="crew-modal-section">
                <h4>Social & Contact</h4>
                <div className="crew-modal-socials">
                  {selectedMember.instagram && (
                    <a
                      href={
                        selectedMember.instagram.startsWith("http")
                          ? selectedMember.instagram
                          : `https://instagram.com/${selectedMember.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crew-modal-social-link instagram-highlight"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      <span>
                        Instagram:{" "}
                        {selectedMember.instagram.startsWith("http")
                          ? selectedMember.instagram
                          : `@${selectedMember.instagram.replace("@", "")}`}
                      </span>
                    </a>
                  )}
                  {selectedMember.socials?.email && (
                    <div className="crew-modal-social-link">
                      <span>📧 {selectedMember.socials.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {onSelectFriendForFilter && (
                <div className="crew-modal-footer">
                  <button
                    className="crew-modal-filter-btn"
                    style={{ background: selectedMember.themeColor }}
                    onClick={() => {
                      onSelectFriendForFilter(selectedMember.name);
                      setSelectedMember(null);
                    }}
                  >
                    🔍 View All Photos & Videos with {selectedMember.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Friend / Crew Member Modal */}
      {isAddFriendModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddFriendModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-container add-friend-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsAddFriendModalOpen(false)}
            >
              ✕
            </button>
            <div className="add-friend-header">
              <div className="add-friend-icon">👥</div>
              <div>
                <h3>Add New Crew Friend</h3>
                <p>Add a friend's profile with their photo, travel role, and Instagram.</p>
              </div>
            </div>

            <form onSubmit={handleAddNewFriend} className="add-friend-form">
              <div className="form-group">
                <label>Friend Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Travel Role / Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Drone Pilot / Camp Cook"
                    value={newFriendRole}
                    onChange={(e) => setNewFriendRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Travel Style / Superpower</label>
                  <input
                    type="text"
                    placeholder="e.g. 🚁 Aerial Shooter"
                    value={newFriendTravelStyle}
                    onChange={(e) => setNewFriendTravelStyle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Instagram Link / Handle</label>
                <div className="instagram-input-wrap">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    placeholder="username or https://instagram.com/user"
                    value={newFriendInstagram}
                    onChange={(e) => setNewFriendInstagram(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newFriendAvatar}
                  onChange={(e) => setNewFriendAvatar(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Travel Bio & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Favorite trip memory, travel passions, or personality..."
                  value={newFriendBio}
                  onChange={(e) => setNewFriendBio(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Theme Highlight Color</label>
                <div className="color-selector-row">
                  {[
                    "#38bdf8",
                    "#34d399",
                    "#ef4444",
                    "#d97706",
                    "#c084fc",
                    "#22d3ee",
                    "#fb7185",
                    "#fb923c",
                  ].map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-pick-circle ${newFriendThemeColor === color ? "is-selected" : ""}`}
                      style={{ background: color }}
                      onClick={() => setNewFriendThemeColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddFriendModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add to Crew Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
