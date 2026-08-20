import React from "react";
import { MediaItem } from "../utils/mediaStorage";

interface HomeFeaturedSectionsProps {
  featuredMedia: MediaItem[];
  onOpenGallery?: () => void;
  onOpenVideos?: () => void;
  onOpenPlaces?: () => void;
  onOpenPhoto?: (item: MediaItem) => void;
  onOpenVideo?: (item: MediaItem) => void;
  onOpenMediaItem?: (item: MediaItem) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export function HomeFeaturedSections({
  featuredMedia,
  onOpenGallery,
  onOpenVideos,
  onOpenPlaces,
  onOpenPhoto,
  onOpenVideo,
  onOpenMediaItem,
  onNavigateSection,
  onOpenAdmin,
}: HomeFeaturedSectionsProps) {
  const handlePhotoClick = onOpenPhoto || onOpenMediaItem || ((_) => onOpenGallery && onOpenGallery());
  const handleVideoClick = onOpenVideo || onOpenMediaItem || ((_) => onOpenVideos && onOpenVideos());
  const handleGallery = onOpenGallery || (() => onNavigateSection && onNavigateSection("media-gallery"));
  const handleVideos = onOpenVideos || (() => onNavigateSection && onNavigateSection("video-gallery-sub"));
  const handlePlaces = onOpenPlaces || (() => onNavigateSection && onNavigateSection("places"));
  const handleAdmin = onOpenAdmin || (() => onNavigateSection && onNavigateSection("admin"));
  const featuredPhotos = featuredMedia.filter((i) => i.type === "photo").slice(0, 4);
  const featuredVideos = featuredMedia.filter((i) => i.type === "video").slice(0, 3);

  return (
    <div className="home-featured-wrapper">
      {/* 1. FEATURED GALLERY SECTION */}
      <section className="home-featured-gallery-section" aria-label="Featured Cloud Gallery">
        <div className="home-featured-container">
          <div className="home-featured-header-row">
            <div>
              <div className="home-badge-pill">
                <span>🌟 Curated Highlights</span>
              </div>
              <h2 className="home-featured-title">Featured Moments from Cloud Archive</h2>
              <p className="home-featured-subtitle">
                Hand-picked high-resolution captures and 4K perspectives showcasing the soul of Mostar.
              </p>
            </div>
            <button
              type="button"
              className="home-cta-btn btn-gold"
              onClick={handleGallery}
              id="btn-explore-gallery-top"
            >
              <span>EXPLORE GALLERY</span>
              <span className="btn-icon">📸</span>
            </button>
          </div>

          <div className="home-featured-grid">
            {featuredPhotos.map((photo) => (
              <article
                key={photo.id}
                className="featured-media-card"
                onClick={() => handlePhotoClick(photo)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePhotoClick(photo);
                  }
                }}
              >
                <div className="card-thumb-wrap">
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title}
                    className="card-thumb-img"
                    loading="lazy"
                  />
                  <div className="card-thumb-overlay" />
                  <span className="card-res-badge">{photo.resolution || "4K"}</span>
                  <span className="card-cat-badge">{photo.category || "Old Town"}</span>
                  <div className="card-hover-indicator">
                    <span>🔍 View Fullscreen</span>
                  </div>
                </div>
                <div className="card-info">
                  <h3 className="card-title">{photo.title}</h3>
                  <p className="card-caption">{photo.caption || photo.location}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="home-featured-bottom-action">
            <button
              type="button"
              className="home-cta-btn btn-outline"
              onClick={handleGallery}
            >
              <span>VIEW FULL PHOTO &amp; VIDEO ARCHIVE</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED VIDEOS SECTION */}
      <section className="home-featured-videos-section" aria-label="Featured Videos">
        <div className="home-featured-container">
          <div className="home-featured-header-row">
            <div>
              <div className="home-badge-pill video-badge">
                <span>🎥 4K Ultra HD in Motion</span>
              </div>
              <h2 className="home-featured-title">Mostar in Motion</h2>
              <p className="home-featured-subtitle">
                Cinematic walking tours, drone flyovers, and traditional diving championships.
              </p>
            </div>
            <button
              type="button"
              className="home-cta-btn btn-blue"
              onClick={handleVideos}
              id="btn-watch-videos-top"
            >
              <span>WATCH VIDEOS</span>
              <span className="btn-icon">▶</span>
            </button>
          </div>

          <div className="home-videos-grid">
            {featuredVideos.map((video) => (
              <article
                key={video.id}
                className="featured-video-card"
                onClick={() => handleVideoClick(video)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleVideoClick(video);
                  }
                }}
              >
                <div className="video-card-thumb-wrap">
                  <img
                    src={
                      video.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=800&auto=format&fit=crop"
                    }
                    alt={video.title}
                    className="video-thumb-img"
                    loading="lazy"
                  />
                  <div className="video-thumb-overlay" />
                  <div className="play-button-circle">
                    <span className="play-icon-triangle">▶</span>
                  </div>
                  <span className="video-duration-pill">{video.duration || "4K Stream"}</span>
                  <span className="video-res-pill">{video.resolution || "4K UHD"}</span>
                </div>
                <div className="video-card-info">
                  <div className="video-meta-row">
                    <span className="video-category">{video.category || "Walking Tour"}</span>
                    <span className="video-creator">By {video.creator || video.uploaderName || "Mostar Explorer"}</span>
                  </div>
                  <h3 className="video-card-title">{video.title}</h3>
                  <p className="video-card-desc">{video.description || video.caption}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="home-featured-bottom-action">
            <button
              type="button"
              className="home-cta-btn btn-primary-gradient"
              onClick={handleVideos}
            >
              <span>WATCH ALL 4K CLOUD VIDEOS</span>
              <span>▶</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. FINAL CTA: DISCOVER THE HEART OF MOSTAR */}
      <section className="home-final-cta-section" aria-label="Discover the Heart of Mostar CTA">
        <div className="home-final-cta-container">
          <div className="final-cta-card">
            <div className="final-cta-glow" />
            <div className="final-cta-content">
              <span className="final-cta-eyebrow">Experience Herzegovina's Jewel</span>
              <h2 className="final-cta-title">Discover the Heart of Mostar</h2>
              <p className="final-cta-paragraph">
                Immerse yourself in centuries of living culture, Ottoman architecture, and emerald river
                panoramas. Explore our cloud galleries, travel notes, and iconic sights.
              </p>
              <div className="final-cta-buttons-row">
                <button
                  type="button"
                  className="final-cta-btn-primary"
                  onClick={handlePlaces}
                  id="btn-explore-mostar-final"
                >
                  <span>EXPLORE MOSTAR</span>
                  <span>✨</span>
                </button>
                <button
                  type="button"
                  className="final-cta-btn-secondary"
                  onClick={handleGallery}
                >
                  <span>EXPLORE GALLERY</span>
                  <span>📸</span>
                </button>
                <button
                  type="button"
                  className="final-cta-btn-secondary"
                  onClick={handleVideos}
                >
                  <span>WATCH VIDEOS</span>
                  <span>▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPREHENSIVE FOOTER */}
      <footer className="website-comprehensive-footer" aria-label="Site Footer">
        <div className="footer-container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="footer-logo-row">
                <span className="footer-logo-icon">🏰</span>
                <span className="footer-logo-text">MOSTAR OLD TOWN</span>
              </div>
              <p className="footer-brand-desc">
                A premium, cinematic modern travel portal celebrating the UNESCO World Heritage of Mostar,
                Stari Most, and the emerald Neretva river.
              </p>
              <div className="footer-cloud-badge">
                <span className="cloud-dot" />
                <span>Zero-Local-Footprint Cloud Media Archive</span>
              </div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => onNavigateSection("home")}>
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("media-gallery")}>
                    Gallery
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("media-gallery")}>
                    Videos
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("places")}>
                    Places / Explore Mostar
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("stories")}>
                    Stories / Old Town Notes
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Heritage &amp; Sights</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => onNavigateSection("bridge")}>
                    Stari Most (Old Bridge)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("bazaar")}>
                    Old Town (Bazaar)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("places")}>
                    Neretva River Canyon
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("team")}>
                    Meet Expedition Team
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("shanto-khan")}>
                    ⭐ Shanto Khan
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Connect &amp; Admin</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => onNavigateSection("about")}>
                    About Mostar
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateSection("contact")}>
                    Contact &amp; Inquiries
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-admin-link"
                    onClick={onOpenAdmin}
                  >
                    🔒 Admin Media Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="footer-copyright">
              © Mostar Old Town — All Rights Reserved
            </p>
            <div className="footer-sub-links">
              <span>Cloud Object Storage Enabled</span>
              <span>•</span>
              <span>4K Ultra HD Media Pipeline</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
