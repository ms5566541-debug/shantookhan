import React, { useState } from "react";

export interface TravelStory {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  readTime: string;
  date: string;
  category: string;
  excerpt: string;
  fullContent: string[];
  coverImage: string;
  tags: string[];
  quote: string;
}

export const OLD_TOWN_STORIES: TravelStory[] = [
  {
    id: "bridge-divers-tradition",
    title: "Centuries Above the Neretva: The Mostar Bridge Divers",
    subtitle: "A 450-year-old rite of courage and Ottoman engineering mastery",
    author: "Tarik Hadžić",
    readTime: "5 min read",
    date: "May 2026",
    category: "Living Heritage",
    excerpt:
      "For over four centuries, young men of Mostar have stood atop the apex of Stari Most, gazing down 24 meters into the emerald waters of the Neretva before launching into flight.",
    quote:
      "To leap from Stari Most is not merely an athletic feat; it is a baptism into the soul of Mostar.",
    coverImage:
      "https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=1200&auto=format&fit=crop",
    tags: ["Stari Most", "Tradition", "Diving", "UNESCO"],
    fullContent: [
      "The first recorded jump from Stari Most dates back to 1664, noted by the legendary Ottoman traveler Evliya Çelebi, who wrote that the brave youths appeared like birds diving through the sky.",
      "Standing on the slippery white Tenelija stone arch, 24 meters above the canyon, the diver must calculate the mountain breeze and the icy temperature of the glacial-fed Neretva. The dive lasts less than three seconds, but requires years of discipline and mastery.",
      "Every July, the official diving championship draws thousands of spectators along the riverbanks. As the crowd holds its breath in absolute silence, the diver arches gracefully against the azure Balkan sky.",
      "The Mostar Diving Club (Mostari) continues to safeguard this intangible heritage, passing the precise biomechanics and respect for the river from grandfathers to grandsons.",
    ],
  },
  {
    id: "bosnian-coffee-ritual",
    title: "The Art of Bosnian Coffee: Cejf & River Conversations",
    subtitle: "Why coffee in Mostar is never rushed, but savored drop by drop",
    author: "Elena Rostova",
    readTime: "4 min read",
    date: "May 2026",
    category: "Culinary Culture",
    excerpt:
      "In the shaded alleys of Kujundžiluk, the rhythm of life slows to the tempo of a copper cezve simmering over hot coals. Bosnian coffee is not just a beverage; it is a philosophy of presence.",
    quote:
      "Ćejf cannot be bought in a hurry; it is the deliberate pleasure of being completely in the moment.",
    coverImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    tags: ["Coffee", "Kujundžiluk", "Lifestyle", "Tradition"],
    fullContent: [
      "Unlike Turkish coffee, traditional Bosanska kafa involves roasting beans finely, boiling water in a dzezva, and carefully pouring the hot foam (kajmak) into delicate handleless ceramic cups known as fildzan.",
      "Alongside the copper tray comes a glass of cold Neretva spring water and cubes of rose-scented rahat lokum (Turkish delight) with sugar cubes meant to be dipped before taking a sip.",
      "Locals speak of 'ćejf'—a profound state of contentment where deadlines dissolve, and meaningful conversation flows effortlessly above the soothing sound of the river.",
      "Sitting on a wooden terrace overlooking the Old Bridge during the late afternoon golden hour is one of the quintessential travel experiences in southeastern Europe.",
    ],
  },
  {
    id: "coppersmiths-kujundziluk",
    title: "Echoes of Hammered Metal in Kujundžiluk",
    subtitle: "Meeting the 5th-generation master artisans keeping Ottoman metalcraft alive",
    author: "Marko Vasić",
    readTime: "6 min read",
    date: "May 2026",
    category: "Artisan Craft",
    excerpt:
      "Walking down Kujundžiluk in the early morning, the first sound you hear is the rhythmic tap-tap-tap of small steel hammers shaping intricate floral arabesques onto glowing copper plates.",
    quote:
      "Each chiseled groove tells a story of patience, geometry, and five hundred years of artisan heritage.",
    coverImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    tags: ["Artisans", "Copper", "Bazaar", "Handmade"],
    fullContent: [
      "Kujundžiluk (the coppersmiths' bazaar) has been the commercial heart of Mostar since the mid-16th century. Named after the Ottoman word for goldsmiths and jewelers, it expanded to encompass world-renowned coppersmiths.",
      "Master artisans use traditional compasses and chisels to engrave motifs inspired by pomegranates, Ottoman calligraphic flourishes, and the silhouette of Stari Most onto plates, lamps, and coffee sets.",
      "Despite the arrival of modern mass production, the true masters refuse shortcuts. A single elaborate tray can require three weeks of meticulous hand-hammering.",
      "Visitors who take the time to step inside the small workshops are often invited to sit on low wool-cushioned benches and witness the ancient alchemy of metalworking firsthand.",
    ],
  },
  {
    id: "hidden-courtyards-mostar",
    title: "Behind Stone Walls: The Secret Courtyards of Old Mostar",
    subtitle: "Discovering private Ottoman residential gems and tranquil water gardens",
    author: "Shanto Khan",
    readTime: "5 min read",
    date: "May 2026",
    category: "Architecture & History",
    excerpt:
      "Beyond the bustling public thoroughfares lie serene private oases: enclosed courtyard homes designed around running water, fig trees, and carved wooden verandahs.",
    quote:
      "Mostar's true architecture was designed from the inside out, guarding family serenity behind fortress-like stone walls.",
    coverImage:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop",
    tags: ["Courtyards", "Architecture", "Ottoman", "Hidden Gems"],
    fullContent: [
      "The residential architecture of Ottoman Mostar followed a strict harmonious philosophy dividing public business from private family sanctuary (selamluk and haremluk).",
      "Two of the finest preserved examples are the 17th-century Bišćevića House and the 18th-century Muslibegović House, both featuring cantilevered wooden viewing chambers (doksat) jutting out directly over the rushing Neretva or shaded cobblestone gardens.",
      "Intricate river-pebble mosaic floors, cooled by constant mountain breezes channeling through stone courtyards, provided natural air conditioning during hot Herzegovinian summers.",
      "Today, walking through these courtyards offers a quiet meditation on timeless design, where architecture and nature exist in complete equilibrium.",
    ],
  },
];

interface OldTownNotesSectionProps {
  onOpenGallery?: () => void;
  onOpenMediaGallery?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export function OldTownNotesSection({
  onOpenGallery,
  onOpenMediaGallery,
  onNavigateSection,
}: OldTownNotesSectionProps) {
  const [activeStory, setActiveStory] = useState<TravelStory | null>(null);

  return (
    <section id="stories" className="stories-section-wrapper" aria-label="Stories and Old Town Notes">
      {/* Header */}
      <div className="stories-section-header">
        <div className="stories-badge-pill">
          <span>📜 Old Town Notes &amp; Travel Stories</span>
        </div>
        <h2 className="stories-main-title">Chronicles of Mostar</h2>
        <p className="stories-subtitle">
          Intimate essays, historical insights, and travel narratives documenting the living culture,
          artisan traditions, and unforgettable moments around Stari Most.
        </p>
      </div>

      {/* Stories Grid */}
      <div className="stories-grid-container">
        {OLD_TOWN_STORIES.map((story) => (
          <article key={story.id} className="story-card-item">
            <div className="story-card-cover-wrap">
              <img
                src={story.coverImage}
                alt={story.title}
                className="story-card-cover"
                loading="lazy"
              />
              <div className="story-category-tag">{story.category}</div>
              <span className="story-read-time">{story.readTime}</span>
            </div>

            <div className="story-card-body">
              <div className="story-card-meta">
                <span className="story-author">By {story.author}</span>
                <span className="story-meta-dot">•</span>
                <span className="story-date">{story.date}</span>
              </div>

              <h3 className="story-card-title">{story.title}</h3>
              <p className="story-card-excerpt">{story.excerpt}</p>

              <div className="story-tags-row">
                {story.tags.map((tag, idx) => (
                  <span key={idx} className="story-tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="story-read-more-btn"
                onClick={() => setActiveStory(story)}
              >
                <span>READ MORE</span>
                <span className="arrow-icon">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Full Story Reading Modal */}
      {activeStory && (
        <div
          className="modal-overlay story-modal-overlay"
          onClick={() => setActiveStory(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeStory.title}
        >
          <div
            className="modal-container story-reader-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setActiveStory(null)}
              aria-label="Close story reader"
            >
              ✕
            </button>

            <div className="story-reader-hero">
              <img
                src={activeStory.coverImage}
                alt={activeStory.title}
                className="story-reader-cover"
              />
              <div className="story-reader-hero-overlay" />
              <div className="story-reader-header-info">
                <span className="story-reader-badge">{activeStory.category}</span>
                <h1 className="story-reader-title">{activeStory.title}</h1>
                <p className="story-reader-subtitle">{activeStory.subtitle}</p>
                <div className="story-reader-byline">
                  <span>Written by {activeStory.author}</span>
                  <span>•</span>
                  <span>{activeStory.date}</span>
                  <span>•</span>
                  <span>{activeStory.readTime}</span>
                </div>
              </div>
            </div>

            <div className="story-reader-body">
              {/* Highlight Quote */}
              <blockquote className="story-reader-quote">
                <p>"{activeStory.quote}"</p>
              </blockquote>

              {/* Paragraphs */}
              <div className="story-reader-paragraphs">
                {activeStory.fullContent.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Footer Tags & Actions */}
              <div className="story-reader-footer">
                <div className="story-reader-tags">
                  {activeStory.tags.map((t, idx) => (
                    <span key={idx} className="story-reader-tag">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="story-reader-actions">
                  {onOpenGallery && (
                    <button
                      type="button"
                      className="reader-action-btn primary"
                      onClick={() => {
                        setActiveStory(null);
                        onOpenGallery();
                      }}
                    >
                      <span>Explore Cloud Gallery</span>
                      <span>📸</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="reader-action-btn secondary"
                    onClick={() => setActiveStory(null)}
                  >
                    Close Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
