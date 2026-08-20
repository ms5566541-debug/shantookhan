import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MediaItem,
  MediaFolder,
  getAllMediaItems,
  saveMediaItem,
  softDeleteMediaItem,
  deleteMediaItem,
  getAllFolders,
  saveFolder,
  DEFAULT_FOLDERS,
} from "../utils/mediaStorage";
import { DEFAULT_SAMPLE_MEDIA } from "../data/defaultMedia";
import { LightboxPhotoViewer } from "./LightboxPhotoViewer";
import { ModernVideoPlayerModal } from "./ModernVideoPlayerModal";
import { MultiMediaUploader } from "./MultiMediaUploader";
import { AdminMediaDashboard } from "./AdminMediaDashboard";

const NAV_CATEGORIES = [
  "All",
  "Photos",
  "Videos",
  "Old Town",
  "Stari Most",
  "Neretva River",
  "Streets & Architecture",
  "Food & Cafés",
  "Local Life",
  "Sunset & Views",
];

const PHOTO_SUB_CATEGORIES = [
  "All Photos",
  "Old Town",
  "Stari Most",
  "Neretva River",
  "Streets & Architecture",
  "Food & Cafés",
  "Local Life",
  "Sunset & Views",
];

const VIDEO_SUB_CATEGORIES = [
  "All Videos",
  "Walking Tours",
  "Stari Most",
  "Old Town",
  "River Views",
  "Local Life",
];

const INITIAL_PHOTOS_COUNT = 6;
const INITIAL_VIDEOS_COUNT = 4;

interface MediaGalleryProps {
  theme?: string;
  onOpenNotes?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export function MediaGallery({ theme = "black", onOpenNotes, onNavigateSection }: MediaGalleryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Filter / Search
  const [activeNavCategory, setActiveNavCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-section category filters
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>("All Photos");
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>("All Videos");

  // Pagination / Load more limits
  const [photosLimit, setPhotosLimit] = useState(INITIAL_PHOTOS_COUNT);
  const [videosLimit, setVideosLimit] = useState(INITIAL_VIDEOS_COUNT);

  // Modals & Viewers State
  const [activePhotoViewer, setActivePhotoViewer] = useState<MediaItem | null>(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<MediaItem | null>(null);
  const [isMultiUploaderOpen, setIsMultiUploaderOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Quick inline upload state
  const [inlineUploadTitle, setInlineUploadTitle] = useState("");
  const [inlineUploadDesc, setInlineUploadDesc] = useState("");
  const [inlineUploadCat, setInlineUploadCat] = useState("Old Town");
  const [inlineUploadLoc, setInlineUploadLoc] = useState("Mostar, Bosnia & Herzegovina");
  const [inlineUploadType, setInlineUploadType] = useState<"photo" | "video">("photo");
  const [inlineUploadName, setInlineUploadName] = useState("");
  const [inlineUploadFile, setInlineUploadFile] = useState<File | null>(null);
  const [inlineUploadPreviewUrl, setInlineUploadPreviewUrl] = useState("");
  const [inlineUploadSuccess, setInlineUploadSuccess] = useState(false);
  const [inlineUploadError, setInlineUploadError] = useState("");
  const [inlineIsUploading, setInlineIsUploading] = useState(false);
  const [inlineProgress, setInlineProgress] = useState(0);

  // Load items from IndexedDB
  const reloadData = async () => {
    try {
      const [storedItems, storedFolders] = await Promise.all([
        getAllMediaItems(false),
        getAllFolders(),
      ]);

      if (storedFolders.length === 0) {
        for (const f of DEFAULT_FOLDERS) {
          await saveFolder(f);
        }
        setFolders(DEFAULT_FOLDERS);
      } else {
        setFolders(storedFolders);
      }

      if (storedItems.length === 0) {
        for (const sample of DEFAULT_SAMPLE_MEDIA) {
          await saveMediaItem(sample);
        }
        setItems(DEFAULT_SAMPLE_MEDIA);
      } else {
        const hasHelloItem = storedItems.some((it) => it.id === "mostar-hello-photo-view");
        if (!hasHelloItem) {
          const helloItem = DEFAULT_SAMPLE_MEDIA.find((it) => it.id === "mostar-hello-photo-view");
          if (helloItem) {
            await saveMediaItem(helloItem);
            storedItems.unshift(helloItem);
          }
        }
        setItems(storedItems);
      }
    } catch (err) {
      console.error("Error loading media items:", err);
      setItems(DEFAULT_SAMPLE_MEDIA);
      setFolders(DEFAULT_FOLDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Save new items batch
  const handleSaveUploadedBatch = async (newItems: MediaItem[]) => {
    for (const item of newItems) {
      await saveMediaItem(item);
    }
    reloadData();
  };

  // Toggle favorite
  const handleToggleFavorite = async (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;
    const updated: MediaItem = { ...target, isFavorite: !target.isFavorite, updatedAt: Date.now() };
    await saveMediaItem(updated);
    setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    if (activePhotoViewer && activePhotoViewer.id === itemId) {
      setActivePhotoViewer(updated);
    }
    if (activeVideoPlayer && activeVideoPlayer.id === itemId) {
      setActiveVideoPlayer(updated);
    }
  };

  // Inline Single Upload Submit
  const handleInlineUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineUploadError("");

    if (!inlineUploadTitle.trim()) {
      setInlineUploadError("Please provide a title for your memory.");
      return;
    }

    setInlineIsUploading(true);
    setInlineProgress(10);

    // Simulate animated upload progress
    for (let p = 25; p <= 100; p += 25) {
      await new Promise((r) => setTimeout(r, 90));
      setInlineProgress(p);
    }

    let finalUrl = inlineUploadPreviewUrl;
    if (!finalUrl) {
      if (inlineUploadType === "photo") {
        finalUrl = "https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=1600&auto=format&fit=crop";
      } else {
        finalUrl = "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-winding-river-surrounded-by-hills-42358-large.mp4";
      }
    }

    const newItem: MediaItem = {
      id: `community-upload-${Date.now()}`,
      folderId: "trip-mostar",
      type: inlineUploadType,
      title: inlineUploadTitle.trim(),
      caption: inlineUploadDesc.trim() || `Captured in ${inlineUploadLoc}`,
      description: inlineUploadDesc.trim() || `Breathtaking high-definition moment from ${inlineUploadLoc}.`,
      date: new Date().toISOString().split("T")[0],
      location: inlineUploadLoc.trim() || "Mostar, Bosnia & Herzegovina",
      uploaderName: inlineUploadName.trim() || "Mostar Community Explorer",
      creator: inlineUploadName.trim() || "Mostar Community Explorer",
      category: inlineUploadCat,
      videoCategory: inlineUploadType === "video" ? inlineUploadCat : undefined,
      url: finalUrl,
      thumbnailUrl: inlineUploadType === "video" ? "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop" : finalUrl,
      sourceType: "upload",
      fileSize: inlineUploadType === "video" ? "42.5 MB" : "5.8 MB",
      sizeBytes: (inlineUploadType === "video" ? 42.5 : 5.8) * 1024 * 1024,
      resolution: "4K",
      createdAt: Date.now(),
      isFavorite: true,
      isFeatured: false,
      visibility: "public",
      processingStatus: "ready",
      tags: ["Community Upload", "Mostar", inlineUploadCat, "4K"],
    };

    await saveMediaItem(newItem);
    setItems((prev) => [newItem, ...prev]);

    setInlineIsUploading(false);
    setInlineUploadSuccess(true);
    setTimeout(() => setInlineUploadSuccess(false), 5000);

    // Reset fields
    setInlineUploadTitle("");
    setInlineUploadDesc("");
    setInlineUploadFile(null);
    setInlineUploadPreviewUrl("");
  };

  const handleInlineFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInlineUploadFile(file);
    if (file.type.startsWith("video/")) {
      setInlineUploadType("video");
    } else {
      setInlineUploadType("photo");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInlineUploadPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Scroll to section helper
  const scrollToSectionId = (secId: string) => {
    if (onNavigateSection) {
      onNavigateSection(secId);
    } else {
      const el = document.getElementById(secId);
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 70,
          behavior: "smooth",
        });
      }
    }
  };

  // 1. Featured items (photos & videos marked as isFeatured)
  const featuredItems = useMemo(() => {
    const featured = items.filter((item) => item.isFeatured && !item.isDeleted);
    if (featured.length > 0) return featured.slice(0, 6);
    // Fallback to top sample items
    return items.slice(0, 4);
  }, [items]);

  // 2. Global search filter
  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCaption = item.caption?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchCreator = (item.creator || item.uploaderName)?.toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCaption || matchCat || matchLoc || matchCreator || matchTags;
    });
  }, [items, searchQuery]);

  // 3. Filtered Photos list
  const filteredPhotos = useMemo(() => {
    return searchFilteredItems.filter((item) => {
      if (item.type !== "photo" || item.isDeleted) return false;

      // Top nav filter
      if (activeNavCategory === "Videos") return false;
      if (activeNavCategory !== "All" && activeNavCategory !== "Photos") {
        const matchesNav =
          item.category?.toLowerCase() === activeNavCategory.toLowerCase() ||
          item.tags?.some((t) => t.toLowerCase() === activeNavCategory.toLowerCase());
        if (!matchesNav) return false;
      }

      // Sub-category filter
      if (selectedPhotoCategory !== "All Photos") {
        const matchesSub =
          item.category?.toLowerCase() === selectedPhotoCategory.toLowerCase() ||
          item.tags?.some((t) => t.toLowerCase() === selectedPhotoCategory.toLowerCase());
        if (!matchesSub) return false;
      }

      return true;
    });
  }, [searchFilteredItems, activeNavCategory, selectedPhotoCategory]);

  // 4. Filtered Videos list
  const filteredVideos = useMemo(() => {
    return searchFilteredItems.filter((item) => {
      if (item.type !== "video" || item.isDeleted) return false;

      // Top nav filter
      if (activeNavCategory === "Photos") return false;
      if (activeNavCategory !== "All" && activeNavCategory !== "Videos") {
        const matchesNav =
          item.category?.toLowerCase() === activeNavCategory.toLowerCase() ||
          item.videoCategory?.toLowerCase() === activeNavCategory.toLowerCase() ||
          item.tags?.some((t) => t.toLowerCase() === activeNavCategory.toLowerCase());
        if (!matchesNav) return false;
      }

      // Sub-category filter
      if (selectedVideoCategory !== "All Videos") {
        const matchesSub =
          item.videoCategory?.toLowerCase() === selectedVideoCategory.toLowerCase() ||
          item.category?.toLowerCase() === selectedVideoCategory.toLowerCase() ||
          item.tags?.some((t) => t.toLowerCase() === selectedVideoCategory.toLowerCase());
        if (!matchesSub) return false;
      }

      return true;
    });
  }, [searchFilteredItems, activeNavCategory, selectedVideoCategory]);

  // Visible items based on pagination limit
  const visiblePhotos = filteredPhotos.slice(0, photosLimit);
  const visibleVideos = filteredVideos.slice(0, videosLimit);

  return (
    <section className="media-gallery-section" id="media-gallery" aria-label="Mostar Gallery and Videos">
      {/* Ambient background lighting */}
      <div className="studio-ambient-glow glow-blue" />
      <div className="studio-ambient-glow glow-purple" />

      <div className="gallery-main-container">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <header className="mostar-gallery-hero" id="gallery-hero">
          <div className="hero-top-toolbar">
            <div className="gallery-hero-badge">
              <span className="hero-sparkle-dot" />
              <span>MOSTAR TRAVEL GALLERY</span>
            </div>

            {/* Admin Access Button */}
            <button
              type="button"
              className="hero-admin-access-btn"
              onClick={() => setIsAdminDashboardOpen(true)}
              title="Open Admin Media Management Dashboard"
            >
              ⚙️ Admin Access
            </button>
          </div>

          <h1 className="mostar-gallery-hero-title">
            Explore Mostar Through Our Lens
          </h1>

          <p className="mostar-gallery-hero-sub">
            Discover the streets, bridges, river views, local life, and unforgettable moments of Mostar through photos and videos.
          </p>

          <div className="mostar-hero-actions">
            <button
              type="button"
              className="mostar-hero-btn primary"
              onClick={() => {
                const target = document.getElementById("photo-gallery-sub");
                if (target) {
                  window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 80,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <span>EXPLORE PHOTOS</span>
              <span className="btn-arrow">↓</span>
            </button>

            <button
              type="button"
              className="mostar-hero-btn secondary"
              onClick={() => {
                const target = document.getElementById("video-gallery-sub");
                if (target) {
                  window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 80,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <span>WATCH VIDEOS</span>
              <span className="btn-arrow">▶</span>
            </button>

            <button
              type="button"
              className="mostar-hero-btn ghost"
              onClick={() => setIsMultiUploaderOpen(true)}
            >
              <span>+ 4K UPLOADER</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. STICKY MEDIA NAVIGATION & REAL-TIME SEARCH */}
        {/* ========================================================================= */}
        <nav className="mostar-sticky-nav-bar" aria-label="Media Gallery Navigation">
          <div className="sticky-nav-inner">
            {/* Category Filter Pills */}
            <div className="nav-categories-scroll" role="tablist">
              {NAV_CATEGORIES.map((cat) => {
                const isActive = activeNavCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    className={`nav-category-pill ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      setActiveNavCategory(cat);
                      // Reset pagination when switching
                      setPhotosLimit(INITIAL_PHOTOS_COUNT);
                      setVideosLimit(INITIAL_VIDEOS_COUNT);
                    }}
                  >
                    {cat === "Photos" ? "📸 Photos" : cat === "Videos" ? "🎥 Videos" : cat}
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="nav-search-wrap">
              <span className="search-box-icon">🔍</span>
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search photos and videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search photos and videos"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-x"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Active Search & Filter Status Feedback */}
          {(searchQuery || activeNavCategory !== "All") && (
            <div className="nav-active-filter-indicator">
              <span>
                Filtering by: <strong>{activeNavCategory}</strong>
                {searchQuery && (
                  <>
                    {" "}
                    matching <em>"{searchQuery}"</em>
                  </>
                )}
              </span>
              <span className="filter-count-badge">
                {filteredPhotos.length + filteredVideos.length} Results
              </span>
              <button
                type="button"
                className="reset-filters-link"
                onClick={() => {
                  setActiveNavCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </nav>

        {/* ========================================================================= */}
        {/* 3. FEATURED MOMENTS (CURATED SHOWCASE) */}
        {/* ========================================================================= */}
        {!searchQuery && activeNavCategory === "All" && (
          <section className="mostar-featured-section" id="featured-moments" aria-label="Featured Moments">
            <div className="section-title-wrap">
              <div className="section-label">FEATURED MOMENTS</div>
              <h2 className="section-main-heading">Moments Worth Remembering</h2>
              <p className="section-main-desc">
                A curated collection of the most beautiful moments from around Mostar.
              </p>
            </div>

            <div className="mostar-featured-grid">
              {featuredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="featured-photo-card"
                  onClick={() => {
                    if (item.type === "video") {
                      setActiveVideoPlayer(item);
                    } else {
                      setActivePhotoViewer(item);
                    }
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (item.type === "video") setActiveVideoPlayer(item);
                      else setActivePhotoViewer(item);
                    }
                  }}
                >
                  <div className="featured-img-wrap">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="featured-card-img"
                      loading="lazy"
                    />
                    <div className="featured-gradient-overlay" />
                    
                    <span className="featured-num-badge">
                      Photo Card {String(idx + 1).padStart(2, "0")}
                    </span>

                    {item.type === "video" && (
                      <div className="featured-play-badge">
                        <span>▶ Watch 4K Video</span>
                      </div>
                    )}

                    {item.resolution && (
                      <span className="featured-res-pill">{item.resolution}</span>
                    )}
                  </div>

                  <div className="featured-card-body">
                    <div className="featured-tag-row">
                      <span className="featured-pill">{item.category || "Heritage"}</span>
                      {item.location && <span className="featured-loc-text">📍 {item.location}</span>}
                    </div>
                    <h3 className="featured-card-title">{item.title}</h3>
                    <p className="featured-card-desc">{item.caption || item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. PHOTO GALLERY SECTION */}
        {/* ========================================================================= */}
        {activeNavCategory !== "Videos" && (
          <section className="mostar-photo-gallery-section" id="photo-gallery-sub" aria-label="Photo Gallery">
            <div className="section-title-wrap">
              <div className="section-label">PHOTO GALLERY</div>
              <h2 className="section-main-heading">Mostar in Every Frame</h2>
              <p className="section-main-desc">
                Take a visual walk through Mostar’s stone lanes, historic buildings, colorful market stalls, and riverside views.
              </p>
            </div>

            {/* Photo Category Sub-filter Chips */}
            <div className="mostar-category-chips-bar" role="tablist" aria-label="Photo Category Filter">
              {PHOTO_SUB_CATEGORIES.map((cat) => {
                const isSelected = selectedPhotoCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isSelected}
                    className={`mostar-cat-chip ${isSelected ? "is-active" : ""}`}
                    onClick={() => setSelectedPhotoCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Photos Grid or Empty State */}
            {filteredPhotos.length === 0 ? (
              <div className="gallery-empty-state-card">
                <div className="empty-state-icon">📸</div>
                <h3 className="empty-state-title">No Photos Yet</h3>
                <p className="empty-state-subtitle">
                  Beautiful moments are coming soon. Be the first to share your Mostar photography!
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsMultiUploaderOpen(true)}
                >
                  Upload Your First Photo
                </button>
              </div>
            ) : (
              <>
                <div className="mostar-photos-grid">
                  {visiblePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="mostar-photo-card"
                      onClick={() => setActivePhotoViewer(photo)}
                      id={`photo-card-${photo.id}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActivePhotoViewer(photo);
                        }
                      }}
                    >
                      <div className="photo-card-media-wrapper">
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.title}
                          className="photo-card-img"
                          loading="lazy"
                        />
                        <div className="photo-card-gradient" />

                        {photo.category && (
                          <span className="photo-card-category-pill">
                            {photo.category}
                          </span>
                        )}

                        {photo.resolution && (
                          <span className="photo-card-res-tag">
                            {photo.resolution}
                          </span>
                        )}

                        <button
                          type="button"
                          className={`photo-card-fav-btn ${photo.isFavorite ? "is-fav" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(photo.id);
                          }}
                          title={photo.isFavorite ? "Favorited" : "Add to favorites"}
                          aria-label="Toggle favorite"
                        >
                          {photo.isFavorite ? "❤️" : "🤍"}
                        </button>
                      </div>

                      <div className="photo-card-content">
                        <h3 className="photo-card-title">{photo.title}</h3>
                        {photo.caption && (
                          <p className="photo-card-caption">{photo.caption}</p>
                        )}
                        <div className="photo-card-meta">
                          {photo.location && (
                            <span className="meta-loc">📍 {photo.location}</span>
                          )}
                          {photo.date && (
                            <span className="meta-date">
                              📅 {new Date(photo.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Photos Button */}
                {filteredPhotos.length > visiblePhotos.length && (
                  <div className="center-action-row">
                    <button
                      type="button"
                      className="mostar-action-btn"
                      onClick={() => setPhotosLimit((prev) => prev + 6)}
                    >
                      <span>LOAD MORE PHOTOS ({filteredPhotos.length - visiblePhotos.length} Remaining)</span>
                      <span className="btn-arrow">↓</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. VIDEO GALLERY SECTION */}
        {/* ========================================================================= */}
        {activeNavCategory !== "Photos" && (
          <section className="mostar-video-gallery-section" id="video-gallery-sub" aria-label="Video Gallery">
            <div className="section-title-wrap">
              <div className="section-label">VIDEO GALLERY</div>
              <h2 className="section-main-heading">Mostar in Motion</h2>
              <p className="section-main-desc">
                Experience the atmosphere, sounds, and beauty of Mostar’s Old Town in crystal-clear high definition.
              </p>
            </div>

            {/* Video Sub-category filter chips */}
            <div className="mostar-category-chips-bar" role="tablist" aria-label="Video Category Filter">
              {VIDEO_SUB_CATEGORIES.map((vCat) => {
                const isSelected = selectedVideoCategory === vCat;
                return (
                  <button
                    key={vCat}
                    role="tab"
                    aria-selected={isSelected}
                    className={`mostar-cat-chip ${isSelected ? "is-active" : ""}`}
                    onClick={() => setSelectedVideoCategory(vCat)}
                  >
                    {vCat}
                  </button>
                );
              })}
            </div>

            {/* Videos Grid or Empty State */}
            {filteredVideos.length === 0 ? (
              <div className="gallery-empty-state-card">
                <div className="empty-state-icon">🎥</div>
                <h3 className="empty-state-title">No Videos Yet</h3>
                <p className="empty-state-subtitle">
                  Check back soon for new Mostar stories, 4K walking tours, and river expeditions.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsMultiUploaderOpen(true)}
                >
                  Upload a 4K Video
                </button>
              </div>
            ) : (
              <>
                <div className="mostar-videos-grid">
                  {visibleVideos.map((video) => (
                    <div
                      key={video.id}
                      className="mostar-video-card"
                      id={`video-card-${video.id}`}
                    >
                      <div
                        className="video-card-thumb-wrap"
                        onClick={() => setActiveVideoPlayer(video)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveVideoPlayer(video);
                          }
                        }}
                      >
                        <img
                          src={
                            video.thumbnailUrl ||
                            "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop"
                          }
                          alt={video.title}
                          className="video-thumb-img"
                          loading="lazy"
                        />
                        <div className="video-thumb-overlay" />

                        {/* Large Animated Play Button */}
                        <div className="video-play-center-btn" aria-hidden="true">
                          <span className="play-triangle">▶</span>
                        </div>

                        {video.duration && (
                          <span className="video-duration-badge">{video.duration}</span>
                        )}

                        <span className="video-quality-tag-badge">
                          {video.resolution || "4K"}
                        </span>

                        {(video.videoCategory || video.category) && (
                          <span className="video-cat-badge">
                            {video.videoCategory || video.category}
                          </span>
                        )}
                      </div>

                      <div className="video-card-details">
                        <h3 className="video-card-title">{video.title}</h3>
                        <p className="video-card-desc">
                          {video.caption || video.description || "Explore the historic streets and atmosphere of Mostar in ultra high definition."}
                        </p>

                        <div className="video-card-action-bar">
                          <button
                            type="button"
                            className="mostar-watch-btn"
                            onClick={() => setActiveVideoPlayer(video)}
                          >
                            <span>WATCH 4K VIDEO</span>
                            <span>▶</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Videos Button */}
                {filteredVideos.length > visibleVideos.length && (
                  <div className="center-action-row">
                    <button
                      type="button"
                      className="mostar-action-btn"
                      onClick={() => setVideosLimit((prev) => prev + 4)}
                    >
                      <span>LOAD MORE VIDEOS ({filteredVideos.length - visibleVideos.length} Remaining)</span>
                      <span className="btn-arrow">↓</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. UPLOAD YOUR MEMORIES SECTION */}
        {/* ========================================================================= */}
        <section className="mostar-upload-section" id="upload-section" aria-label="Upload Memories Section">
          <div className="section-title-wrap">
            <div className="section-label">COMMUNITY MEMORIES</div>
            <h2 className="section-main-heading">Upload Your Memories</h2>
            <p className="section-main-desc">
              Share your favorite moments from Mostar with the community. Supports high-res photos and 4K videos.
            </p>
          </div>

          <div className="upload-form-card">
            {inlineUploadSuccess && (
              <div className="upload-success-banner" role="alert">
                ✨ <strong>Upload successful!</strong> Your media has been added to the gallery.
              </div>
            )}

            {inlineUploadError && (
              <div className="upload-error-banner" role="alert">
                ⚠️ {inlineUploadError}
              </div>
            )}

            {inlineIsUploading ? (
              <div className="inline-upload-progress-box">
                <div className="progress-top-info">
                  <span>Uploading & Processing 4K Media...</span>
                  <span>{inlineProgress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${inlineProgress}%` }} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleInlineUploadSubmit} className="mostar-upload-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="inline-name-input">Photographer / Creator Name</label>
                    <input
                      id="inline-name-input"
                      type="text"
                      placeholder="e.g., Mia Vance or Anonymous Explorer"
                      value={inlineUploadName}
                      onChange={(e) => setInlineUploadName(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Media Format</label>
                    <div className="type-toggle-pills">
                      <button
                        type="button"
                        className={`type-pill ${inlineUploadType === "photo" ? "is-selected" : ""}`}
                        onClick={() => setInlineUploadType("photo")}
                      >
                        📸 High-Res Photo
                      </button>
                      <button
                        type="button"
                        className={`type-pill ${inlineUploadType === "video" ? "is-selected" : ""}`}
                        onClick={() => setInlineUploadType("video")}
                      >
                        🎥 4K / HD Video
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Dropzone */}
                <div className="form-field">
                  <label>Select Photo or 4K Video File</label>
                  <div className="file-dropzone-box">
                    <input
                      type="file"
                      id="inline-file-input"
                      accept="image/*,video/*"
                      onChange={handleInlineFileSelect}
                      className="file-hidden-input"
                    />
                    <label htmlFor="inline-file-input" className="file-dropzone-label">
                      <span className="dropzone-icon">📥</span>
                      {inlineUploadFile ? (
                        <span className="dropzone-file-selected">
                          Selected: {inlineUploadFile.name} (
                          {(inlineUploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      ) : (
                        <span>
                          Click to browse or drag &amp; drop photos (JPG, PNG, WEBP) or 4K videos (MP4, WebM, MOV)
                        </span>
                      )}
                      <span className="dropzone-sub">
                        Supports 4K UHD resolution with instant client processing.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="inline-title-input">Title *</label>
                    <input
                      id="inline-title-input"
                      type="text"
                      placeholder="e.g., Sunset Glow on Stari Most"
                      value={inlineUploadTitle}
                      onChange={(e) => setInlineUploadTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="inline-location-input">Location</label>
                    <input
                      id="inline-location-input"
                      type="text"
                      placeholder="e.g., Kujundžiluk, Neretva Riverbank"
                      value={inlineUploadLoc}
                      onChange={(e) => setInlineUploadLoc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="inline-category-select">Category</label>
                    <select
                      id="inline-category-select"
                      value={inlineUploadCat}
                      onChange={(e) => setInlineUploadCat(e.target.value)}
                    >
                      <option value="Old Town">Old Town</option>
                      <option value="Stari Most">Stari Most</option>
                      <option value="Streets & Architecture">Streets &amp; Architecture</option>
                      <option value="Neretva River">Neretva River</option>
                      <option value="Food & Cafés">Food &amp; Cafés</option>
                      <option value="Local Life">Local Life</option>
                      <option value="Sunset & Views">Sunset &amp; Views</option>
                      <option value="Walking Tours">Walking Tours (4K Video)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="inline-desc-input">Short Story / Description</label>
                    <input
                      id="inline-desc-input"
                      type="text"
                      placeholder="Share a short note about this moment..."
                      value={inlineUploadDesc}
                      onChange={(e) => setInlineUploadDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-submit-row">
                  <button type="submit" className="mostar-upload-submit-btn">
                    <span>PUBLISH TO GALLERY</span>
                    <span>🚀</span>
                  </button>
                  <button
                    type="button"
                    className="batch-upload-btn-link"
                    onClick={() => setIsMultiUploaderOpen(true)}
                  >
                    📂 Or Open Multi-File Batch Studio
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. EXPLORE MORE SECTION */}
        {/* ========================================================================= */}
        <section className="mostar-explore-more-section" id="explore-more" aria-label="Explore More Stories">
          <div className="section-title-wrap">
            <div className="section-label">DISCOVER DEEPER</div>
            <h2 className="section-main-heading">More Stories From Mostar</h2>
            <p className="section-main-desc">
              Discover the places, history, food, and everyday moments behind the photographs.
            </p>
          </div>

          <div className="explore-more-buttons-row">
            <button
              type="button"
              className="explore-story-btn"
              onClick={() => {
                if (onOpenNotes) {
                  onOpenNotes();
                } else {
                  scrollToSectionId("bazaar");
                }
              }}
            >
              <span className="btn-icon">📜</span>
              <span>OLD TOWN NOTES</span>
              <span className="btn-arrow">↗</span>
            </button>

            <button
              type="button"
              className="explore-story-btn highlight"
              onClick={() => scrollToSectionId("bridge")}
            >
              <span className="btn-icon">🌉</span>
              <span>EXPLORE MOSTAR</span>
              <span className="btn-arrow">→</span>
            </button>

            <button
              type="button"
              className="explore-story-btn"
              onClick={() => scrollToSectionId("bazaar")}
            >
              <span className="btn-icon">☕</span>
              <span>READ OUR STORIES</span>
              <span className="btn-arrow">↗</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FOOTER CTA SECTION */}
        {/* ========================================================================= */}
        <footer className="mostar-gallery-footer-cta" id="gallery-footer-cta">
          <div className="footer-cta-content">
            <div className="footer-cta-badge">MOSTAR MEMORIES</div>
            <h2 className="footer-cta-title">Your Journey. Your Memories.</h2>
            <p className="footer-cta-desc">
              Explore Mostar, capture the moment, and keep the memories alive.
            </p>
            <button
              type="button"
              className="footer-start-btn"
              onClick={() => scrollToSectionId("home")}
            >
              <span>START EXPLORING</span>
              <span className="btn-sparkle">✨</span>
            </button>
          </div>
        </footer>

      </div>

      {/* LIGHTBOX PHOTO VIEWER MODAL */}
      {activePhotoViewer && (
        <LightboxPhotoViewer
          item={activePhotoViewer}
          itemsList={items.filter((i) => i.type === "photo")}
          onClose={() => setActivePhotoViewer(null)}
          onNavigate={(newItem) => setActivePhotoViewer(newItem)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* MODERN 4K VIDEO PLAYER MODAL */}
      {activeVideoPlayer && (
        <ModernVideoPlayerModal
          item={activeVideoPlayer}
          itemsList={items.filter((i) => i.type === "video")}
          onClose={() => setActiveVideoPlayer(null)}
          onNavigate={(newItem) => setActiveVideoPlayer(newItem)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* MULTI MEDIA 4K UPLOADER STUDIO MODAL */}
      {isMultiUploaderOpen && (
        <MultiMediaUploader
          folders={folders}
          onClose={() => setIsMultiUploaderOpen(false)}
          onSaveItems={handleSaveUploadedBatch}
        />
      )}

      {/* ADMIN MEDIA MANAGEMENT DASHBOARD */}
      {isAdminDashboardOpen && (
        <AdminMediaDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
          onOpenUpload={() => setIsMultiUploaderOpen(true)}
          onViewItem={(item) => {
            if (item.type === "video") setActiveVideoPlayer(item);
            else setActivePhotoViewer(item);
          }}
          onMediaChanged={reloadData}
        />
      )}
    </section>
  );
}
