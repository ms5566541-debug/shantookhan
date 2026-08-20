import React from "react";

interface AboutSectionProps {
  onMeetTeam?: () => void;
  onExploreGallery?: () => void;
  onContact?: () => void;
  onContactUs?: () => void;
}

export function AboutSection({
  onMeetTeam,
  onExploreGallery,
  onContact,
  onContactUs,
}: AboutSectionProps) {
  const handleContact = onContact || onContactUs;
  return (
    <section id="about" className="about-section-wrapper" aria-label="About Mostar Travel & Heritage">
      <div className="about-container">
        {/* Top Header */}
        <div className="about-header">
          <div className="about-badge-pill">
            <span>🏛️ Our Mission &amp; Heritage</span>
          </div>
          <h2 className="about-main-title">Bridging Centuries of History &amp; Light</h2>
          <p className="about-subtitle">
            Mostar is more than a destination—it is a living cultural sanctuary where Ottoman elegance,
            Mediterranean warmth, and timeless Balkan resilience converge.
          </p>
        </div>

        {/* 2-Column Overview & Vision */}
        <div className="about-split-grid">
          <div className="about-text-column">
            <h3 className="about-col-heading">The Vision Behind Our Archive</h3>
            <p className="about-paragraph">
              Founded as an independent cultural documentation initiative, our project brings together
              passionate photographers, historians, drone pilots, and local storytellers. Our mission is to
              archive, celebrate, and share the architectural wonder of Stari Most, the vibrant alleys of
              Kujundžiluk, and the untouched emerald beauty of the Neretva canyon in crystal-clear 4K Ultra HD.
            </p>
            <p className="about-paragraph">
              Every photograph, cinematic walking tour, and journal entry in our cloud repository is curated with
              deep respect for local heritage, UNESCO conservation standards, and authentic community narratives.
            </p>

            <div className="about-pillars-grid">
              <div className="about-pillar-card">
                <span className="pillar-icon">🏰</span>
                <h4>UNESCO Heritage</h4>
                <p>Documenting protected monuments with archival accuracy and cultural reverence.</p>
              </div>
              <div className="about-pillar-card">
                <span className="pillar-icon">🎥</span>
                <h4>4K Cinematic Archive</h4>
                <p>High-bitrate cloud streaming for travelers, filmmakers, and digital explorers.</p>
              </div>
              <div className="about-pillar-card">
                <span className="pillar-icon">🤝</span>
                <h4>Community &amp; Masters</h4>
                <p>Spotlighting 5th-generation artisan coppersmiths, divers, and culinary keepers.</p>
              </div>
              <div className="about-pillar-card">
                <span className="pillar-icon">☁️</span>
                <h4>Zero-Local-Footprint Cloud</h4>
                <p>Enterprise object storage architecture ensuring secure worldwide accessibility.</p>
              </div>
            </div>
          </div>

          <div className="about-visual-column">
            <div className="about-image-mosaic">
              <div className="mosaic-main-card">
                <img
                  src="https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=1000&auto=format&fit=crop"
                  alt="Stari Most Over Neretva"
                  className="mosaic-img"
                  loading="lazy"
                />
                <div className="mosaic-caption-tag">
                  <span>Stari Most • 1566 AD</span>
                </div>
              </div>

              <div className="mosaic-sub-grid">
                <div className="mosaic-sub-card">
                  <img
                    src="https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=600&auto=format&fit=crop"
                    alt="Kujundžiluk Street Alleys"
                    className="mosaic-img"
                    loading="lazy"
                  />
                  <span className="sub-tag">Old Town Alleys</span>
                </div>
                <div className="mosaic-sub-card">
                  <img
                    src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop"
                    alt="Neretva River"
                    className="mosaic-img"
                    loading="lazy"
                  />
                  <span className="sub-tag">Neretva Canyon</span>
                </div>
              </div>
            </div>

            {/* Quick Fact Counters */}
            <div className="about-stats-bar">
              <div className="stat-item">
                <span className="stat-num">450+</span>
                <span className="stat-label">Years of Bridge History</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">4K UHD</span>
                <span className="stat-label">Master Media Resolution</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Cloud Object Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="about-actions-row">
          {onMeetTeam && (
            <button type="button" className="about-action-btn primary" onClick={onMeetTeam}>
              <span>MEET OUR EXPEDITION TEAM</span>
              <span>👥</span>
            </button>
          )}
          {onExploreGallery && (
            <button type="button" className="about-action-btn secondary" onClick={onExploreGallery}>
              <span>BROWSE CLOUD MEDIA</span>
              <span>📸</span>
            </button>
          )}
          {onContact && (
            <button type="button" className="about-action-btn outline" onClick={onContact}>
              <span>COLLABORATE &amp; CONTACT</span>
              <span>✉</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
