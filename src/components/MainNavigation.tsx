import React, { useState } from "react";

interface MainNavigationProps {
  activeSection: string;
  theme: string;
  onThemeChange: (theme: any) => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenUpload: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
  badge?: string;
  isSpecial?: boolean;
  isAdmin?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: "🏠", description: "Main landing & hero experience" },
  { id: "media-gallery", label: "Gallery", icon: "📸", description: "Cloud photo archive & high-res views" },
  { id: "video-gallery-sub", label: "Videos", icon: "🎥", description: "4K Mostar in motion & walking tours" },
  { id: "places", label: "Places / Explore", icon: "✨", description: "Old Town, Stari Most, Neretva, Bazaar" },
  { id: "bazaar", label: "Old Town", icon: "🏰", description: "Cobblestone alleys & Ottoman bazaar" },
  { id: "bridge", label: "Stari Most", icon: "🌉", description: "16th-century stone arch & diving" },
  { id: "places-neretva", label: "Neretva River", icon: "🌊", description: "Emerald waters & canyon vistas" },
  { id: "stories", label: "Stories & Notes", icon: "📜", description: "Travel chronicles & cultural notes" },
  { id: "shanto-khan", label: "⭐ Shanto Khan", icon: "⭐", description: "Lead expedition explorer page", isSpecial: true },
  { id: "team", label: "Team", icon: "👥", description: "Expedition crew & photographers" },
  { id: "about", label: "About", icon: "🏛️", description: "Heritage mission & vision" },
  { id: "contact", label: "Contact", icon: "📫", description: "Collaborations & inquiries" },
  { id: "admin", label: "Admin Dashboard", icon: "🔒", description: "Cloud media management & storage", isAdmin: true },
];

export function MainNavigation({
  activeSection,
  theme,
  onThemeChange,
  onNavigate,
  onOpenAdmin,
  onOpenUpload,
}: MainNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navRipples, setNavRipples] = useState<Record<string, Array<{ x: number; y: number; id: number }>>>({});

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();

    // Trigger ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now() + Math.random();

    setNavRipples((prev) => ({
      ...prev,
      [item.id]: [...(prev[item.id] || []), { x, y, id: rippleId }],
    }));

    setTimeout(() => {
      setNavRipples((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || []).filter((r) => r.id !== rippleId),
      }));
    }, 700);

    if (item.isAdmin) {
      onOpenAdmin();
      setIsMobileMenuOpen(false);
      return;
    }

    if (item.id === "video-gallery-sub") {
      onNavigate("media-gallery");
      setTimeout(() => {
        const vidEl = document.getElementById("video-gallery-sub");
        if (vidEl) {
          vidEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
      setIsMobileMenuOpen(false);
      return;
    }

    if (item.id === "places-neretva") {
      onNavigate("places");
      setTimeout(() => {
        const pEl = document.getElementById("place-neretva-river");
        if (pEl) {
          pEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
      setIsMobileMenuOpen(false);
      return;
    }

    onNavigate(item.id);
    setIsMobileMenuOpen(false);
  };

  const THEMES = [
    { id: "dark", label: "Obsidian Gold", icon: "✨" },
    { id: "black", label: "Pure Black", icon: "🌑" },
    { id: "blue", label: "Azure River", icon: "🌊" },
    { id: "white", label: "Stone Light", icon: "☀️" },
    { id: "emerald", label: "Emerald Canyon", icon: "🍃" },
    { id: "purple", label: "Royal Sunset", icon: "🍇" },
  ];

  return (
    <>
      {/* Sticky Top Navigation Bar */}
      <header className="global-site-navbar" role="banner">
        <div className="global-navbar-container">
          {/* Brand Logo */}
          <a
            href="#home"
            className="global-nav-brand"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("home");
            }}
          >
            <span className="brand-logo-icon">🏰</span>
            <span className="brand-logo-title">MOSTAR</span>
          </a>

          {/* Desktop Primary Nav Menu */}
          <nav className="global-nav-desktop-links" aria-label="Main Navigation">
            {MAIN_NAV_ITEMS.filter((item) => !item.isAdmin && item.id !== "places-neretva").map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-pill-modern ${item.isSpecial ? "is-special-shanto" : ""} ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={(e) => handleItemClick(e, item)}
                >
                  {navRipples[item.id]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="global-nav-right-controls">
            {/* Quick Upload Button */}
            <button
              type="button"
              className="quick-upload-header-btn"
              onClick={onOpenUpload}
              title="Upload Photos or 4K Videos to Cloud"
            >
              <span>+ Upload</span>
            </button>

            {/* Admin Key Button */}
            <button
              type="button"
              className="admin-key-header-btn"
              onClick={onOpenAdmin}
              title="Admin Media Dashboard"
            >
              <span>⚙️ Admin</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className={`mobile-menu-toggle-btn ${isMobileMenuOpen ? "is-open" : ""}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="burger-line line-1" />
              <span className="burger-line line-2" />
              <span className="burger-line line-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Sliding Panel */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div className="drawer-brand">
                <span className="brand-icon">🏰</span>
                <div>
                  <span className="drawer-brand-name">Mostar Old Town</span>
                  <span className="drawer-brand-sub">4K Travel Portal</span>
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Quick Action Cloud Row */}
            <div className="drawer-quick-actions">
              <button
                type="button"
                className="drawer-action-btn primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenUpload();
                }}
              >
                <span>➕ Upload 4K Media</span>
              </button>
              <button
                type="button"
                className="drawer-action-btn admin"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
              >
                <span>🔒 Admin Dashboard</span>
              </button>
            </div>

            {/* Complete 11-Destination Navigation List */}
            <div className="mobile-drawer-nav-list">
              <span className="drawer-nav-heading">WEBSITE DESTINATIONS</span>
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`drawer-nav-item ${item.isSpecial ? "is-shanto" : ""} ${
                      item.isAdmin ? "is-admin" : ""
                    } ${isActive ? "is-active" : ""}`}
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <span className="drawer-item-icon">{item.icon}</span>
                    <div className="drawer-item-text">
                      <span className="drawer-item-title">{item.label}</span>
                      {item.description && (
                        <span className="drawer-item-desc">{item.description}</span>
                      )}
                    </div>
                    {isActive && <span className="drawer-active-dot" />}
                  </button>
                );
              })}
            </div>

            {/* Theme Selector inside Mobile Drawer */}
            <div className="mobile-drawer-theme-section">
              <span className="drawer-nav-heading">COLOR &amp; ATMOSPHERE</span>
              <div className="drawer-themes-grid">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`drawer-theme-pill ${theme === t.id ? "is-active" : ""}`}
                    onClick={() => onThemeChange(t.id)}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="mobile-drawer-footer">
              <p>© Mostar Old Town — All Rights Reserved</p>
              <span>Zero-Local-Footprint Cloud Media</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
