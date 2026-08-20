import React, { useState, useRef, useEffect } from "react";
import { MediaItem } from "../utils/mediaStorage";

interface ModernVideoPlayerModalProps {
  item: MediaItem;
  itemsList?: MediaItem[];
  onClose: () => void;
  onNavigate?: (newItem: MediaItem) => void;
  onToggleFavorite?: (itemId: string) => void;
}

export function ModernVideoPlayerModal({
  item,
  itemsList = [],
  onClose,
  onNavigate,
  onToggleFavorite,
}: ModernVideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(item.resolution || "4K");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Keyboard navigation & playback shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipTime(-5);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  // Handle video element time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + seconds),
      duration
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
    if (!newMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    a.download = `${cleanTitle}_mostar_video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const qualities = ["4K Ultra HD", "1440p QHD", "1080p Full HD", "720p HD", "Auto (Optimized)"];

  return (
    <div
      className="modern-video-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${item.title}`}
    >
      <div
        ref={containerRef}
        className="modern-video-modal-card"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Top Floating Bar */}
        <div className={`video-modal-top-bar ${showControls ? "is-visible" : "is-hidden"}`}>
          <div className="video-modal-title-group">
            <span className="video-badge-pill">
              {item.videoCategory || item.category || "Mostar Motion"}
            </span>
            <span className="video-quality-tag">{selectedQuality}</span>
            <h3 className="video-modal-title">{item.title}</h3>
          </div>

          <div className="video-modal-top-actions">
            {onToggleFavorite && (
              <button
                className={`video-btn-icon ${item.isFavorite ? "is-fav" : ""}`}
                onClick={() => onToggleFavorite(item.id)}
                title={item.isFavorite ? "Favorited" : "Add to favorites"}
              >
                {item.isFavorite ? "❤️" : "🤍"}
              </button>
            )}

            <button
              className="video-btn-icon"
              onClick={handleDownload}
              title="Download Video File"
            >
              ⬇️
            </button>

            <button
              className="video-modal-close-btn"
              onClick={onClose}
              title="Close Player (Esc)"
              aria-label="Close video player"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Canvas & Media Player */}
        <div className="video-viewport-wrapper" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={item.url}
            poster={item.thumbnailUrl}
            className="modern-video-element"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Buffering Spinner */}
          {isBuffering && (
            <div className="video-buffering-indicator">
              <div className="buffering-spinner" />
              <span>Optimizing 4K Stream...</span>
            </div>
          )}

          {/* Center Play/Pause Ripple Button */}
          {!isPlaying && !isBuffering && (
            <div className="video-center-play-overlay">
              <button
                className="center-big-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label="Play video"
              >
                <span>▶</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Custom Controller Bar */}
        <div className={`video-custom-controls ${showControls ? "is-visible" : "is-hidden"}`}>
          {/* Progress Timeline Scrubber */}
          <div className="video-scrubber-bar-wrap">
            <div className="video-progress-track">
              {duration > 0 && (
                <div
                  className="video-buffer-fill"
                  style={{ width: `${(bufferedEnd / duration) * 100}%` }}
                />
              )}
              <div
                className="video-played-fill"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="video-seek-slider"
              aria-label="Video scrubber slider"
            />
          </div>

          <div className="video-controls-bottom-row">
            {/* Left Controls: Play/Pause, Rewind, Forward, Time */}
            <div className="controls-left-group">
              <button
                className="ctrl-btn play-pause-btn"
                onClick={togglePlay}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                className="ctrl-btn skip-btn"
                onClick={() => skipTime(-5)}
                title="Rewind 5s (Left Arrow)"
              >
                ↺ 5s
              </button>

              <button
                className="ctrl-btn skip-btn"
                onClick={() => skipTime(5)}
                title="Forward 5s (Right Arrow)"
              >
                5s ↻
              </button>

              <div className="video-time-display">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="sep">/</span>
                <span className="duration-time">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Volume, Quality, Fullscreen */}
            <div className="controls-right-group">
              {/* Volume Slider */}
              <div className="volume-control-wrap">
                <button
                  className="ctrl-btn volume-btn"
                  onClick={toggleMute}
                  title={isMuted ? "Unmute (M)" : "Mute (M)"}
                >
                  {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  aria-label="Volume slider"
                />
              </div>

              {/* Quality Selector */}
              <div className="quality-selector-wrap">
                <button
                  className="ctrl-btn quality-btn"
                  onClick={() => setShowQualityMenu((prev) => !prev)}
                  title="Video Quality"
                >
                  ⚙️ {selectedQuality}
                </button>

                {showQualityMenu && (
                  <div className="quality-dropdown-menu">
                    <div className="quality-dropdown-header">Stream Resolution</div>
                    {qualities.map((q) => (
                      <button
                        key={q}
                        className={`quality-item-btn ${selectedQuality === q || (q.startsWith(selectedQuality) && selectedQuality !== "") ? "is-selected" : ""}`}
                        onClick={() => {
                          setSelectedQuality(q.split(" ")[0]);
                          setShowQualityMenu(false);
                        }}
                      >
                        <span>{q}</span>
                        {selectedQuality === q || (q.startsWith(selectedQuality) && selectedQuality !== "") ? "✓" : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                className="ctrl-btn fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? "🗗" : "⛶"}
              </button>
            </div>
          </div>
        </div>

        {/* Video Description & Story Info */}
        <div className="video-modal-footer-meta">
          <div className="footer-meta-chips">
            {item.location && (
              <span className="footer-meta-chip">📍 {item.location}</span>
            )}
            {item.date && (
              <span className="footer-meta-chip">
                📅 {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
            {(item.creator || item.uploaderName) && (
              <span className="footer-meta-chip">🎥 {item.creator || item.uploaderName}</span>
            )}
            {item.fileSize && (
              <span className="footer-meta-chip">📦 {item.fileSize}</span>
            )}
          </div>
          {item.description && (
            <p className="video-footer-description">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
