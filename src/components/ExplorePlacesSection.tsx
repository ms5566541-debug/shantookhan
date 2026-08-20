import React, { useState } from "react";
import { MediaItem } from "../utils/mediaStorage";

interface ExplorePlacesSectionProps {
  onOpenMediaWithFilter?: (category: string) => void;
  onViewPhoto?: (item: MediaItem) => void;
  onNavigate?: (sectionId: string) => void;
  onOpenMediaGallery?: () => void;
}

interface PlaceCard {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  tag: string;
  year: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  icon: string;
  accentColor: string;
}

export const MOSTAR_PLACES: PlaceCard[] = [
  {
    id: "old-town",
    category: "Old Town",
    name: "Old Town (Stari Grad)",
    subtitle: "Cobblestones, Artisan Workshops & Ottoman Heritage",
    tag: "UNESCO World Heritage",
    year: "15th–16th Century",
    description:
      "A labyrinth of gleaming limestone cobblestones (Kujundžiluk) lined with coppersmiths hammering ornate Turkish coffee sets, woven kilim rugs, and authentic Bosnian cuisine aroma.",
    highlights: [
      "Historic Kujundžiluk Bazaar street",
      "Traditional coppersmith master craftsmen",
      "Koski Mehmed Pasha Mosque & panoramic minaret climb",
      "Riverside dining overlooking the canyon",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=1200&auto=format&fit=crop",
    icon: "🏰",
    accentColor: "#f59e0b",
  },
  {
    id: "stari-most",
    category: "Stari Most",
    name: "Stari Most (The Old Bridge)",
    subtitle: "24-Meter Architectural Wonder Over Neretva",
    tag: "Iconic Global Landmark",
    year: "1566 AD",
    description:
      "Engineered by Ottoman master Mimar Hayruddin, the 24-meter-high stone arch bridge is the symbolic heart of Mostar. World-famous for the centuries-old traditional diving championship.",
    highlights: [
      "24-meter daredevil cliff diving tradition",
      "Tara and Halebija fortified watchtowers",
      "Old Bridge Museum with subterranean arch access",
      "Golden hour & sunset reflections",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=1200&auto=format&fit=crop",
    icon: "🌉",
    accentColor: "#38bdf8",
  },
  {
    id: "neretva-river",
    category: "Neretva River",
    name: "Neretva River Canyon",
    subtitle: "Coldest Emerald Waters of Southern Europe",
    tag: "Natural Wonder",
    year: "Primeval Mountain River",
    description:
      "Carving an awe-inspiring canyon through the karst limestone of Herzegovina, the crystal-clear turquoise waters of the Neretva create a dramatic microclimate and breathtaking vistas.",
    highlights: [
      "Emerald glacial-fed crystal waters",
      "Scenic pebble beaches under the Old Bridge",
      "Eco-rafting and wooden boat excursions",
      "Riverside terrace lounging with traditional coffee",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop",
    icon: "🌊",
    accentColor: "#10b981",
  },
  {
    id: "bazaar",
    category: "Streets & Architecture",
    name: "Kujundžiluk Bazaar & Alleys",
    subtitle: "The Living Pulse of Artisan Craftsmanship",
    tag: "Historic Market",
    year: "Established 1570",
    description:
      "The ancient market streets retain their timeless Ottoman spirit, with authentic scents of roasted coffee, vibrant handmade copper lamps, silver filigree jewelry, and sweet lokum delights.",
    highlights: [
      "Hand-chiseled copper platters & cezve pots",
      "Ottoman-era stone shopfronts with wooden shutters",
      "Local spice and Turkish delight tastings",
      "Bustling cultural encounters with local masters",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    icon: "🏺",
    accentColor: "#eab308",
  },
  {
    id: "historic-streets",
    category: "Streets & Architecture",
    name: "Historic Streets & Fortifications",
    subtitle: "Austro-Hungarian & Mediterranean Stone Layers",
    tag: "Architecture Trail",
    year: "18th–19th Century",
    description:
      "Beyond the bazaar lies an intricate tapestry of stone alleyways, Ottoman courtyard residences like Bišćevića House and Muslibegović House, and elegant Austro-Hungarian facades.",
    highlights: [
      "Bišćevića House (authentic Ottoman interior & river porch)",
      "Muslibegović House luxury national monument",
      "Crooked Bridge (Kriva Ćuprija) on the Radobolja river",
      "Hidden stone arch passages and ivy-clad courtyards",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop",
    icon: "🏛️",
    accentColor: "#a855f7",
  },
  {
    id: "local-cafes",
    category: "Food & Cafés",
    name: "Riverside Cafés & Culinary Culture",
    subtitle: "Bosnian Coffee, Ćevapi & Herzegovinian Wines",
    tag: "Culinary Heritage",
    year: "Living Tradition",
    description:
      "Savor rich, slow-brewed Bosnian coffee served in copper fildžan with rahat lokum, freshly grilled ćevapi in warm somun bread, and chilled Blatina and Žilavka regional wines.",
    highlights: [
      "Traditional Bosanska kafa served in copper sets",
      "Authentic grilled ćevabdžinica & pita pies",
      "Cliffside terrace seating with panoramic river views",
      "Herzegovinian Žilavka white wine & sheep's milk cheeses",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    icon: "☕",
    accentColor: "#f97316",
  },
];

export function ExplorePlacesSection({
  onOpenMediaWithFilter,
}: ExplorePlacesSectionProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceCard | null>(null);

  return (
    <section id="places" className="places-section-wrapper" aria-label="Explore Mostar Places">
      {/* Header */}
      <div className="places-section-header">
        <div className="places-badge-pill">
          <span>✨ Iconic Destinations</span>
        </div>
        <h2 className="places-main-title">Explore the Heart of Mostar</h2>
        <p className="places-subtitle">
          From the 16th-century stone arch of Stari Most to hidden Ottoman courtyards and emerald
          canyons, immerse yourself in the living history of Herzegovina.
        </p>
      </div>

      {/* Places Cards Grid */}
      <div className="places-grid-container">
        {MOSTAR_PLACES.map((place) => (
          <article
            key={place.id}
            id={`place-${place.id}`}
            className="place-feature-card"
            style={{
              ["--card-accent" as any]: place.accentColor,
            }}
          >
            {/* Image Preview & Tag */}
            <div className="place-card-image-wrap">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="place-card-image"
                loading="lazy"
              />
              <div className="place-card-overlay-gradient" />
              <div className="place-card-badge-row">
                <span className="place-tag-pill">
                  {place.icon} {place.tag}
                </span>
                <span className="place-year-pill">{place.year}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="place-card-content">
              <div className="place-card-meta">
                <span className="place-category-indicator" style={{ color: place.accentColor }}>
                  {place.category}
                </span>
              </div>
              <h3 className="place-card-name">{place.name}</h3>
              <p className="place-card-subheading">{place.subtitle}</p>
              <p className="place-card-description">{place.description}</p>

              {/* Key Highlights Bullet Tags */}
              <div className="place-highlights-list">
                {place.highlights.slice(0, 3).map((hl, idx) => (
                  <div key={idx} className="place-highlight-item">
                    <span className="highlight-bullet" style={{ background: place.accentColor }} />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="place-card-actions">
                <button
                  type="button"
                  className="place-btn-view-details"
                  onClick={() => setSelectedPlace(place)}
                >
                  <span>Details &amp; Guide</span>
                  <span className="btn-arrow">↗</span>
                </button>
                {onOpenMediaWithFilter && (
                  <button
                    type="button"
                    className="place-btn-view-photos"
                    onClick={() => onOpenMediaWithFilter(place.category)}
                    title={`View all ${place.category} photos and videos in cloud gallery`}
                  >
                    <span>View Media</span>
                    <span>📸</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Selected Place Full Guide Modal */}
      {selectedPlace && (
        <div
          className="modal-overlay place-modal-overlay"
          onClick={() => setSelectedPlace(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedPlace.name}
        >
          <div
            className="modal-container place-detail-modal"
            style={{ borderColor: selectedPlace.accentColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedPlace(null)}
              aria-label="Close place details"
            >
              ✕
            </button>

            <div className="place-modal-hero-cover">
              <img
                src={selectedPlace.imageUrl}
                alt={selectedPlace.name}
                className="place-modal-hero-img"
              />
              <div className="place-modal-hero-overlay" />
              <div className="place-modal-hero-info">
                <span className="place-modal-tag" style={{ background: selectedPlace.accentColor }}>
                  {selectedPlace.icon} {selectedPlace.tag}
                </span>
                <h2 className="place-modal-title">{selectedPlace.name}</h2>
                <p className="place-modal-sub">{selectedPlace.subtitle}</p>
              </div>
            </div>

            <div className="place-modal-body">
              <div className="place-modal-section">
                <h4>Historical Overview &amp; Significance</h4>
                <p>{selectedPlace.description}</p>
              </div>

              <div className="place-modal-section">
                <h4>Must-See Highlights &amp; Insider Tips</h4>
                <ul className="place-modal-highlights">
                  {selectedPlace.highlights.map((hl, idx) => (
                    <li key={idx}>
                      <span className="check-icon" style={{ color: selectedPlace.accentColor }}>
                        ✓
                      </span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="place-modal-footer-actions">
                {onOpenMediaWithFilter && (
                  <button
                    type="button"
                    className="modal-action-btn primary"
                    style={{ background: selectedPlace.accentColor, color: "#000000" }}
                    onClick={() => {
                      const cat = selectedPlace.category;
                      setSelectedPlace(null);
                      onOpenMediaWithFilter(cat);
                    }}
                  >
                    <span>Explore {selectedPlace.name} in Cloud Gallery</span>
                    <span>📸</span>
                  </button>
                )}
                <button
                  type="button"
                  className="modal-action-btn secondary"
                  onClick={() => setSelectedPlace(null)}
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
