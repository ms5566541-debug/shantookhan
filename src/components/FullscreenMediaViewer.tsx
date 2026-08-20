import React, { useEffect, useRef, useState } from "react";
import { MediaItem, MediaFolder } from "../utils/mediaStorage";

interface FullscreenMediaViewerProps {
  item: MediaItem;
  itemsList: MediaItem[];
  folders: MediaFolder[];
  onClose: () => void;
  onNavigate: (newItem: MediaItem) => void;
  onToggleFavorite: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onSelectFriend?: (friendName: string) => void;
}

export function FullscreenMediaViewer({
  item,
  itemsList,
  folders,
  onClose,
  onNavigate,
  onToggleFavorite,
  onDelete,
  onSelectFriend,
}: FullscreenMediaViewerProps) {
  const currentIndex = itemsList.findIndex((i) => i.id === item.id);
  const totalCount = itemsList.length;
  const currentFolder = folders.find((f) => f.id === item.folderId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, itemsList]);

  const handleNext = () => {
    if (totalCount <= 1) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    onNavigate(itemsList[nextIdx]);
  };

  const handlePrev = () => {
    if (totalCount <= 1) return;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    onNavigate(itemsList[prevIdx]);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${item.type === "video" ? "mp4" : "jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div
      className="fullscreen-viewer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} full screen viewer`}
    >
      <div className="fullscreen-viewer-stage" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="viewer-top-bar">
          <div className="viewer-counter-badge">
            <span className="counter-current">{currentIndex + 1}</span>
            <span className="counter-sep">/</span>
            <span className="counter-total">{totalCount}</span>
            {currentFolder && (
              <span className="viewer-album-pill" style={{ borderColor: currentFolder.color }}>
                {currentFolder.icon || "🗂️"} {currentFolder.name}
              </span>
            )}
          </div>

          <div className="viewer-top-actions">
            <button
              className={`viewer-action-btn ${item.isFavorite ? "is-favorite" : ""}`}
              onClick={() => onToggleFavorite(item.id)}
              title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              {item.isFavorite ? "❤️ Favorited" : "🤍 Favorite"}
            </button>
            <button
              className="viewer-action-btn"
              onClick={handleDownload}
              title="Download full quality"
            >
              ⬇️ Download
            </button>
            <button
              className="viewer-action-btn"
              onClick={handleCopyLink}
              title="Copy Media URL"
            >
              {copiedNotification ? "✓ Link Copied!" : "🔗 Share Link"}
            </button>
            {onDelete && (
              <button
                className="viewer-action-btn btn-danger"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this media item?")) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                title="Delete media item"
              >
                🗑️
              </button>
            )}
            <button
              className="viewer-close-btn"
              onClick={onClose}
              aria-label="Close full screen viewer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Media Showcase Area */}
        <div className="viewer-media-viewport">
          {/* Previous Button */}
          {totalCount > 1 && (
            <button
              className="viewer-nav-btn nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous (Left Arrow key)"
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* Media Player / Image Display */}
          <div className="viewer-content-holder">
            {item.type === "video" ? (
              <div className="viewer-video-wrapper">
                {item.embedUrl ? (
                  <iframe
                    src={item.embedUrl}
                    title={item.title}
                    className="viewer-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={item.url}
                    controls
                    autoPlay
                    loop
                    className={`viewer-video-element ${item.aspectRatio === "9:16" ? "is-vertical-video" : ""}`}
                  />
                )}
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="viewer-image-element"
              />
            )}
          </div>

          {/* Next Button */}
          {totalCount > 1 && (
            <button
              className="viewer-nav-btn nav-next"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next (Right Arrow key)"
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom Metadata Bar: Date, Location, Caption, Tagged Friends */}
        <div className="viewer-bottom-meta">
          <div className="viewer-meta-main">
            <div className="viewer-meta-chips-row">
              {item.location && (
                <span className="meta-chip location-chip">
                  📍 <strong>{item.location}</strong>
                </span>
              )}
              {item.date && (
                <span className="meta-chip date-chip">
                  📅 {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {item.fileSize && (
                <span className="meta-chip size-chip">
                  📦 {item.fileSize}
                </span>
              )}
              {item.duration && (
                <span className="meta-chip duration-chip">
                  ⏱️ {item.duration}
                </span>
              )}
            </div>

            <h2 className="viewer-title">{item.title}</h2>

            {item.caption && (
              <p className="viewer-caption-quote">
                "{item.caption}"
              </p>
            )}

            {item.description && item.description !== item.caption && (
              <p className="viewer-description-text">{item.description}</p>
            )}

            {/* Tagged Crew Members */}
            {item.taggedCrew && item.taggedCrew.length > 0 && (
              <div className="viewer-tagged-crew-row">
                <span className="tagged-crew-label">👥 Tagged Friends:</span>
                <div className="tagged-crew-pills">
                  {item.taggedCrew.map((friend, fIdx) => (
                    <button
                      key={fIdx}
                      className="tagged-friend-pill"
                      onClick={() => {
                        if (onSelectFriend) {
                          onSelectFriend(friend);
                          onClose();
                        }
                      }}
                      title={`Filter all memories with ${friend}`}
                    >
                      {friend}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="viewer-tags-row">
                {item.tags.map((t, idx) => (
                  <span key={idx} className="viewer-tag-badge">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
