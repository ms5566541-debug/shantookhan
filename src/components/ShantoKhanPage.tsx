import React, { useState, useRef, useEffect } from "react";
import { TeamMember, TEAM_MEMBERS } from "../data/team";

interface ShantoKhanPageProps {
  shantoData?: TeamMember;
  customAvatar?: string;
  customName?: string;
  onUploadPhoto?: () => void;
  onOpenGallery?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: "Drone" | "Photography" | "Documentary" | "Expedition";
  location: string;
  image: string;
  desc: string;
  stats: string;
}

const SHANTO_PORTFOLIO: PortfolioItem[] = [
  {
    id: "mostar-bridge-cinematic",
    title: "Stari Most 4K Golden Dawn Aerial",
    category: "Drone",
    location: "Old Bridge, Mostar",
    image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=1200&auto=format&fit=crop",
    desc: "Cinematic dawn flight capturing sunlight hitting the 16th-century stone arch as the Neretva river flows beneath.",
    stats: "4K UHD • 60 FPS • D-Log M",
  },
  {
    id: "neretva-canyon-expedition",
    title: "Neretva River Canyon & Emerald Drift",
    category: "Expedition",
    location: "Neretva Valley, Bosnia",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    desc: "Kayaking navigation through turquoise mountain waters with high-speed action tracking and telemetry logs.",
    stats: "18 km Route • 6-Hour Drift",
  },
  {
    id: "kujundziluk-bazaar-stories",
    title: "Cobblestone Craftsmen of Kujundžiluk",
    category: "Documentary",
    location: "Old Bazaar, Mostar",
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1200&auto=format&fit=crop",
    desc: "Portraits of copper coppersmiths chiseling historic Ottoman motifs onto coffee sets and plates.",
    stats: "35mm Prime • f/1.4 Portrait",
  },
  {
    id: "fortica-skywalk-sunset",
    title: "Fortica Hill Panorama & Sunset Vista",
    category: "Photography",
    location: "Fortica Skywalk, Mostar",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop",
    desc: "Sweeping sunset panorama from the glass skywalk overlooking the valley lights and mountains.",
    stats: "Multi-exposure HDR • 100 ISO",
  },
];

const GEAR_LIST = [
  { name: "DJI Mavic 3 Pro Cine", category: "Aerial Drone", detail: "Tri-camera system, Apple ProRes 422 HQ" },
  { name: "Sony Alpha 7 IV", category: "Primary Camera", detail: "33MP Full-Frame, 4K 60p 10-Bit 4:2:2" },
  { name: "Sony FE 24-70mm f/2.8 GM II", category: "Master Lens", detail: "Ultra-sharp professional travel zoom" },
  { name: "DJI RS 3 Pro Gimbal", category: "Stabilization", detail: "Automated axis locks & active tracking" },
  { name: "Røde Wireless PRO", category: "Audio Gear", detail: "32-bit float onboard recording & timecode" },
  { name: "Garmin inReach Explorer+", category: "Navigation", detail: "Satellite GPS & emergency satellite beacon" },
];

export const ShantoKhanPage: React.FC<ShantoKhanPageProps> = ({
  shantoData,
  customAvatar,
  customName,
  onUploadPhoto,
  onOpenGallery,
  onNavigateSection,
}) => {
  const member = shantoData || TEAM_MEMBERS[0];
  const displayName = customName || member.name;
  const displayAvatar = customAvatar || member.avatar;

  const [activeTab, setActiveTab] = useState<"portfolio" | "expeditions" | "gear" | "contact">("portfolio");
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(() => {
    return localStorage.getItem("shanto_custom_title") || "Trip Leader & Lead Creator";
  });

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("shanto_custom_title", customTitle);
    setIsEditingTitle(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: "", email: "", message: "" });
    }, 4000);
  };

  return (
    <section id="shanto-khan" className="shanto-khan-page-section" aria-label="Shanto Khan Official Page">
      <div className="shanto-page-container">
        {/* Background Ambient Glows */}
        <div className="shanto-ambient-glow glow-cyan" />
        <div className="shanto-ambient-glow glow-gold" />

        {/* HERO BANNER */}
        <header className="shanto-hero-card">
          <div className="shanto-hero-cover">
            <img
              src="https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=1400&auto=format&fit=crop"
              alt="Mostar Sky Panorama"
              className="shanto-cover-img"
            />
            <div className="shanto-cover-overlay" />
            <div className="shanto-cover-badge">
              <span className="shanto-badge-dot" />
              <span>OFFICIAL PROFILE PAGE</span>
            </div>
          </div>

          <div className="shanto-hero-body">
            <div className="shanto-avatar-wrapper">
              <div className="shanto-avatar-circle" onClick={onUploadPhoto} title="Click to update Shanto Khan photo">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="shanto-avatar-img"
                />
                <div className="shanto-avatar-hover-overlay">
                  <span className="shanto-cam-icon">📷</span>
                  <span className="shanto-cam-text">Change Photo</span>
                </div>
              </div>
              <span className="shanto-online-indicator" title="Active Explorer" />
            </div>

            <div className="shanto-hero-info">
              <div className="shanto-title-row">
                <h1 className="shanto-main-name">{displayName}</h1>
                <span className="shanto-verified-badge" title="Verified Trip Leader">
                  ✓ Verified Lead
                </span>
              </div>

              {isEditingTitle ? (
                <form onSubmit={handleSaveTitle} className="shanto-edit-title-form">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="shanto-title-input"
                    autoFocus
                  />
                  <button type="submit" className="shanto-save-btn">Save</button>
                  <button type="button" onClick={() => setIsEditingTitle(false)} className="shanto-cancel-btn">Cancel</button>
                </form>
              ) : (
                <div className="shanto-role-subtitle-wrap">
                  <p className="shanto-role-subtitle">{customTitle}</p>
                  <button
                    className="shanto-edit-role-btn"
                    onClick={() => setIsEditingTitle(true)}
                    title="Customize role title"
                  >
                    ✏️ Edit Title
                  </button>
                </div>
              )}

              <p className="shanto-short-bio">
                Founder, lead explorer, and digital filmmaker behind the Mostar Cinematic Project. Specializing in high-altitude drone choreography, mountain navigation, and rich visual storytelling across Bosnia & Herzegovina.
              </p>

              <div className="shanto-quick-tags">
                <span className="shanto-tag">🧭 Expedition Navigator</span>
                <span className="shanto-tag">🚁 4K Drone Pilot</span>
                <span className="shanto-tag">🎬 Cinematic Storyteller</span>
                <span className="shanto-tag">📍 Mostar & Neretva Valley</span>
              </div>

              <div className="shanto-hero-actions">
                <button
                  className="shanto-cta-primary"
                  onClick={() => {
                    setActiveTab("portfolio");
                    const el = document.getElementById("shanto-tabs-content");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Portfolio &amp; Work
                </button>
                <button
                  className="shanto-cta-secondary"
                  onClick={() => {
                    setActiveTab("contact");
                    const el = document.getElementById("shanto-tabs-content");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get In Touch
                </button>
                {onUploadPhoto && (
                  <button className="shanto-cta-ghost" onClick={onUploadPhoto}>
                    📷 Upload New Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* STATS HIGHLIGHTS GRID */}
        <section className="shanto-stats-grid" aria-label="Key Achievements & Numbers">
          <div className="shanto-stat-card">
            <span className="stat-number">24+</span>
            <span className="stat-label">Expeditions Led</span>
            <span className="stat-sub">Across Balkans & Europe</span>
          </div>
          <div className="shanto-stat-card highlight">
            <span className="stat-number">1,800+</span>
            <span className="stat-label">4K Cinematic Aerials</span>
            <span className="stat-sub">Captured on DJI Cine</span>
          </div>
          <div className="shanto-stat-card">
            <span className="stat-number">12</span>
            <span className="stat-label">Historic Routes Mapped</span>
            <span className="stat-sub">Stari Most & Valley Trails</span>
          </div>
          <div className="shanto-stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Crew Satisfaction</span>
            <span className="stat-sub">Safe & Memorable Trips</span>
          </div>
        </section>

        {/* INTERACTIVE NAVIGATION TABS */}
        <nav className="shanto-tabs-bar" aria-label="Shanto Khan Profile Sections">
          <button
            className={`shanto-tab-btn ${activeTab === "portfolio" ? "is-active" : ""}`}
            onClick={() => setActiveTab("portfolio")}
          >
            📸 Featured Portfolio
          </button>
          <button
            className={`shanto-tab-btn ${activeTab === "expeditions" ? "is-active" : ""}`}
            onClick={() => setActiveTab("expeditions")}
          >
            🗺️ Expedition Log
          </button>
          <button
            className={`shanto-tab-btn ${activeTab === "gear" ? "is-active" : ""}`}
            onClick={() => setActiveTab("gear")}
          >
            🎥 Gear &amp; Equipment
          </button>
          <button
            className={`shanto-tab-btn ${activeTab === "contact" ? "is-active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            ✉️ Contact Shanto
          </button>
        </nav>

        {/* DYNAMIC TAB CONTENT AREA */}
        <div id="shanto-tabs-content" className="shanto-tab-content-card">
          {/* TAB 1: FEATURED PORTFOLIO */}
          {activeTab === "portfolio" && (
            <div className="shanto-portfolio-tab animate-fadeIn">
              <div className="tab-header-row">
                <div>
                  <h3 className="tab-heading">Curated Works &amp; Cinematic Frames</h3>
                  <p className="tab-sub-text">A selection of aerial, landscape, and documentary captures crafted by Shanto Khan.</p>
                </div>
                {onOpenGallery && (
                  <button className="shanto-open-gallery-btn" onClick={onOpenGallery}>
                    View Complete 4K Gallery →
                  </button>
                )}
              </div>

              <div className="portfolio-cards-grid">
                {SHANTO_PORTFOLIO.map((item) => (
                  <article
                    key={item.id}
                    className="portfolio-item-card"
                    onClick={() => setSelectedPortfolio(item)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="portfolio-thumb-wrap">
                      <img src={item.image} alt={item.title} className="portfolio-thumb-img" />
                      <span className="portfolio-cat-pill">{item.category}</span>
                      <span className="portfolio-stats-pill">{item.stats}</span>
                    </div>
                    <div className="portfolio-body">
                      <span className="portfolio-loc">📍 {item.location}</span>
                      <h4 className="portfolio-title">{item.title}</h4>
                      <p className="portfolio-desc">{item.desc}</p>
                      <span className="portfolio-click-hint">Click to enlarge preview ↗</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXPEDITIONS LOG */}
          {activeTab === "expeditions" && (
            <div className="shanto-expeditions-tab animate-fadeIn">
              <h3 className="tab-heading">Expedition Timeline &amp; Field Records</h3>
              <p className="tab-sub-text">Documenting key milestones, terrain challenges, and crew journeys led by Shanto Khan.</p>

              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-marker">2026</div>
                  <div className="timeline-card">
                    <span className="timeline-tag">LATEST MISSION</span>
                    <h4>Mostar Old Town &amp; Neretva 4K Archival Project</h4>
                    <p>
                      Comprehensive 4K drone mapping of Stari Most, the surrounding Ottoman bazaar, and downstream canyon vistas. Coordinated with local heritage guides and artisans.
                    </p>
                    <div className="timeline-meta">
                      <span>🗓️ 14 Days Active</span>
                      <span>📍 Mostar, Bosnia</span>
                      <span>👥 9 Crew Members</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker">2025</div>
                  <div className="timeline-card">
                    <h4>Balkan Highlands &amp; Tara River Canyon Traverse</h4>
                    <p>
                      Off-road 4x4 navigation, river rafting filming, and high-altitude star trail captures over remote mountain lakes.
                    </p>
                    <div className="timeline-meta">
                      <span>🗓️ 21 Days Active</span>
                      <span>📍 Dinaric Alps</span>
                      <span>⛺ 12 Campsites</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker">2024</div>
                  <div className="timeline-card">
                    <h4>Adriatic Coastal &amp; Historic Citadel Film Tour</h4>
                    <p>
                      Golden hour architectural series documenting coastal fortifications, stone harbours, and maritime culture across the Adriatic rim.
                    </p>
                    <div className="timeline-meta">
                      <span>🗓️ 18 Days Active</span>
                      <span>📍 Mediterranean Route</span>
                      <span>📸 4,200+ Frames</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEAR & EQUIPMENT */}
          {activeTab === "gear" && (
            <div className="shanto-gear-tab animate-fadeIn">
              <div className="tab-header-row">
                <div>
                  <h3 className="tab-heading">Field Equipment &amp; Production Tech</h3>
                  <p className="tab-sub-text">The professional kit powering Shanto Khan's aerial, cinematic, and off-grid explorations.</p>
                </div>
              </div>

              <div className="gear-grid">
                {GEAR_LIST.map((gear, idx) => (
                  <div key={idx} className="gear-card">
                    <div className="gear-icon">🛠️</div>
                    <div className="gear-info">
                      <span className="gear-category">{gear.category}</span>
                      <h4 className="gear-name">{gear.name}</h4>
                      <p className="gear-detail">{gear.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT & COLLABORATION */}
          {activeTab === "contact" && (
            <div className="shanto-contact-tab animate-fadeIn">
              <div className="shanto-grid-2col">
                <div>
                  <h3 className="tab-heading">Connect with Shanto Khan</h3>
                  <p className="tab-lead-para">
                    Interested in collaborating on a travel documentary, licensing aerial 4K footage, or organizing an expedition?
                  </p>
                  <p className="tab-body-para">
                    Feel free to send a direct message or reach out via social media channels.
                  </p>

                  <div className="contact-info-list">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Direct Email</strong>
                        <a href="mailto:shanto.khan@platform.com">shanto.khan@platform.com</a>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📸</span>
                      <div>
                        <strong>Instagram</strong>
                        <a href="https://instagram.com/shantokhan.official" target="_blank" rel="noreferrer">
                          @shantokhan.official
                        </a>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📍</span>
                      <div>
                        <strong>Current Location</strong>
                        <span>Mostar, Bosnia and Herzegovina</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contact-form-col">
                  {contactSubmitted ? (
                    <div className="contact-success-card">
                      <span className="success-icon">✓</span>
                      <h4>Message Sent Successfully!</h4>
                      <p>Thank you for reaching out. Shanto will review your message and reply promptly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="shanto-message-form">
                      <h4 className="form-title">Send a Direct Message</h4>
                      <div className="form-group">
                        <label>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Alex Miller"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g., alex@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Message / Project Details</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Tell Shanto about your project, trip, or collaboration idea..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="form-submit-btn">
                        ✉️ Send Message to Shanto
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIGHTBOX FOR PORTFOLIO ITEMS */}
        {selectedPortfolio && (
          <div className="shanto-modal-backdrop" onClick={() => setSelectedPortfolio(null)}>
            <div className="shanto-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="shanto-modal-close" onClick={() => setSelectedPortfolio(null)}>✕</button>
              <img src={selectedPortfolio.image} alt={selectedPortfolio.title} className="modal-img" />
              <div className="modal-content">
                <span className="modal-tag">{selectedPortfolio.category} • {selectedPortfolio.location}</span>
                <h3 className="modal-title">{selectedPortfolio.title}</h3>
                <p className="modal-desc">{selectedPortfolio.desc}</p>
                <div className="modal-footer-stats">
                  <span>📸 Tech Specs: {selectedPortfolio.stats}</span>
                  <button className="modal-close-action" onClick={() => setSelectedPortfolio(null)}>Close Preview</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
