import React, { useEffect, useState, useRef } from "react";
import { MediaItem } from "../utils/mediaStorage";

interface LightboxPhotoViewerProps {
  item: MediaItem;
  itemsList: MediaItem[];
  onClose: () => void;
  onNavigate: (newItem: MediaItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (itemId: string) => void;
}

export function LightboxPhotoViewer({
  item,
  itemsList,
  onClose,
  onNavigate,
  onToggleFavorite,
  onEdit,
  onDelete,
}: LightboxPhotoViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isPanActive, setIsPanActive] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Only photos for lightbox sequence
  const photoItems = itemsList.filter((i) => i.type === "photo");
  const currentIndex = photoItems.findIndex((i) => i.id === item.id);
  const totalPhotos = photoItems.length > 0 ? photoItems.length : 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photoItems, zoomLevel]);

  // Reset zoom when navigating to new item
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [item.id]);

  const handleNext = () => {
    if (photoItems.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photoItems.length;
    onNavigate(photoItems[nextIdx]);
  };

  const handlePrev = () => {
    if (photoItems.length <= 1) return;
    const prevIdx = (currentIndex - 1 + photoItems.length) % photoItems.length;
    onNavigate(photoItems[prevIdx]);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.3, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    a.download = `${cleanTitle}_mostar_${item.resolution || "highres"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: item.caption || item.description || "Discover Mostar through our lens.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(item.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Mouse pan handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanActive(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanActive && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanActive(false);
  };

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${item.title}`}
    >
      <div className="lightbox-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <header className="lightbox-header">
          <div className="lightbox-header-left">
            <div className="lightbox-counter">
              <span className="current-num">{currentIndex >= 0 ? currentIndex + 1 : 1}</span>
              <span className="sep">/</span>
              <span className="total-num">{totalPhotos}</span>
            </div>
            {item.category && (
              <span className="lightbox-category-badge">{item.category}</span>
            )}
            {item.resolution && (
              <span className="lightbox-res-badge">{item.resolution}</span>
            )}
          </div>

          {/* Center Zoom Controls */}
          <div className="lightbox-zoom-bar">
            <button
              className="lightbox-ctrl-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              title="Zoom Out (-)"
              aria-label="Zoom Out"
            >
              🔍-
            </button>
            <button
              className="lightbox-ctrl-btn zoom-level-display"
              onClick={handleResetZoom}
              title="Reset Zoom (0)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              className="lightbox-ctrl-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              🔍+
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="lightbox-header-right">
            {onToggleFavorite && (
              <button
                className={`lightbox-action-btn ${item.isFavorite ? "is-fav" : ""}`}
                onClick={() => onToggleFavorite(item.id)}
                title={item.isFavorite ? "Favorited" : "Add to favorites"}
                aria-label="Toggle Favorite"
              >
                {item.isFavorite ? "❤️" : "🤍"}
              </button>
            )}

            <button
              className="lightbox-action-btn"
              onClick={handleDownload}
              title="Download Full Resolution"
              aria-label="Download Photo"
            >
              ⬇️ <span className="action-text">Download</span>
            </button>

            <button
              className="lightbox-action-btn"
              onClick={handleShare}
              title="Share / Copy Link"
              aria-label="Share Photo"
            >
              {copiedLink ? "✓ Copied" : "🔗 Share"}
            </button>

            <button
              className={`lightbox-action-btn ${isDetailsOpen ? "is-active" : ""}`}
              onClick={() => setIsDetailsOpen((prev) => !prev)}
              title="Toggle Details Panel"
              aria-label="Toggle Info Details"
            >
              ℹ️
            </button>

            <button
              className="lightbox-close-btn"
              onClick={onClose}
              title="Close Viewer (Esc)"
              aria-label="Close Lightbox"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Main Stage */}
        <div className="lightbox-stage">
          {/* Previous Arrow */}
          {photoItems.length > 1 && (
            <button
              className="lightbox-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous Photo (Left Arrow)"
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* Image Canvas Container */}
          <div
            className={`lightbox-canvas ${zoomLevel > 1 ? "is-zoomed" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoomLevel > 1 ? (isPanActive ? "grabbing" : "grab") : "default" }}
          >
            <img
              src={item.url}
              alt={item.title}
              className="lightbox-main-img"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transition: isPanActive ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              draggable={false}
            />
          </div>

          {/* Next Arrow */}
          {photoItems.length > 1 && (
            <button
              className="lightbox-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next Photo (Right Arrow)"
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom Details Drawer */}
        {isDetailsOpen && (
          <div className="lightbox-details-drawer">
            <div className="details-content-box">
              <div className="details-header-row">
                <div className="details-meta-chips">
                  {item.location && (
                    <span className="meta-chip location">
                      📍 <strong>{item.location}</strong>
                    </span>
                  )}
                  {item.date && (
                    <span className="meta-chip date">
                      📅 {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  )}
                  {(item.creator || item.uploaderName) && (
                    <span className="meta-chip creator">
                      👤 {item.creator || item.uploaderName}
                    </span>
                  )}
                  {item.fileSize && (
                    <span className="meta-chip size">
                      📦 {item.fileSize}
                    </span>
                  )}
                </div>

                <h2 className="details-title">{item.title}</h2>
              </div>

              {item.caption && (
                <p className="details-caption">"{item.caption}"</p>
              )}

              {item.description && item.description !== item.caption && (
                <p className="details-desc">{item.description}</p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="details-tags-row">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="details-tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
