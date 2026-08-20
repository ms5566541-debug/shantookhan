import React, { useState, useEffect } from "react";
import {
  MediaItem,
  StorageMetrics,
  getStorageMetrics,
  getAllMediaItems,
  saveMediaItem,
  softDeleteMediaItem,
  restoreMediaItem,
  deleteMediaItem,
  emptyTrash,
} from "../utils/mediaStorage";
import { EditMediaModal } from "./EditMediaModal";
import { SafeDeleteModal } from "./SafeDeleteModal";

interface AdminMediaDashboardProps {
  onClose: () => void;
  onOpenUpload?: () => void;
  onOpenUploader?: () => void;
  onViewItem?: (item: MediaItem) => void;
  onMediaChanged?: () => void;
  onRefreshGallery?: () => void;
}

type TabType = "all" | "photos" | "videos" | "featured" | "trash";
type ViewMode = "table" | "grid";

export function AdminMediaDashboard({
  onClose,
  onOpenUpload,
  onOpenUploader,
  onViewItem = () => {},
  onMediaChanged = () => {},
  onRefreshGallery,
}: AdminMediaDashboardProps) {
  const handleOpenUpload = onOpenUpload || onOpenUploader || (() => {});
  const handleMediaChanged = () => {
    onMediaChanged();
    if (onRefreshGallery) onRefreshGallery();
  };
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("mostar_admin_auth") === "true";
  });
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Dashboard Data State
  const [items, setItems] = useState<MediaItem[]>([]);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedResolution, setSelectedResolution] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size" | "title">("newest");

  // Modals & Action States
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeletingPermanent, setIsDeletingPermanent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const all = await getAllMediaItems(true); // Include trash
      setItems(all);
      const m = await getStorageMetrics();
      setMetrics(m);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput === "mostar2026" || passkeyInput.toLowerCase() === "admin") {
      sessionStorage.setItem("mostar_admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect admin passkey. Default demo key is: mostar2026");
    }
  };

  const handleQuickDemoUnlock = () => {
    sessionStorage.setItem("mostar_admin_auth", "true");
    setIsAuthenticated(true);
    setAuthError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mostar_admin_auth");
    setIsAuthenticated(false);
  };

  // Toggle Featured
  const handleToggleFeatured = async (item: MediaItem) => {
    const updated: MediaItem = {
      ...item,
      isFeatured: !item.isFeatured,
      featuredOrder: !item.isFeatured ? (metrics?.totalFeatured || 0) + 1 : undefined,
      updatedAt: Date.now(),
    };
    await saveMediaItem(updated);
    showToast(
      updated.isFeatured
        ? `"${item.title}" added to Featured Moments.`
        : `"${item.title}" removed from Featured Moments.`
    );
    loadDashboardData();
    onMediaChanged();
  };

  // Save from Edit Modal
  const handleSaveEdit = async (updatedItem: MediaItem) => {
    await saveMediaItem(updatedItem);
    setEditingItem(null);
    showToast("Media updated successfully.");
    loadDashboardData();
    onMediaChanged();
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    if (isDeletingPermanent || deletingItem.isDeleted) {
      await deleteMediaItem(deletingItem.id);
      showToast("Media permanently deleted.");
    } else {
      await softDeleteMediaItem(deletingItem.id);
      showToast("Media moved to Recycle Bin.");
    }
    setDeletingItem(null);
    loadDashboardData();
    onMediaChanged();
  };

  // Restore Item
  const handleRestore = async (id: string, title: string) => {
    await restoreMediaItem(id);
    showToast(`"${title}" restored successfully.`);
    loadDashboardData();
    onMediaChanged();
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (confirm("Are you sure you want to permanently empty all items from the Recycle Bin?")) {
      await emptyTrash();
      showToast("Recycle Bin emptied.");
      loadDashboardData();
      onMediaChanged();
    }
  };

  // Filter Items
  const filteredItems = items
    .filter((item) => {
      // Tab Filtering
      if (activeTab === "trash") {
        if (!item.isDeleted) return false;
      } else {
        if (item.isDeleted) return false;
        if (activeTab === "photos" && item.type !== "photo") return false;
        if (activeTab === "videos" && item.type !== "video") return false;
        if (activeTab === "featured" && !item.isFeatured) return false;
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Resolution filter
      if (selectedResolution !== "all" && item.resolution !== selectedResolution) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchCreator = (item.creator || item.uploaderName)?.toLowerCase().includes(q);
        const matchFile = item.fileName?.toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchLoc && !matchCreator && !matchFile && !matchTags) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "size") return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      return 0;
    });

  // Extract unique categories for filter
  const categoriesList = Array.from(
    new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))
  );

  return (
    <div
      className="admin-dashboard-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dashboard-title"
    >
      <div className="admin-dashboard-window" onClick={(e) => e.stopPropagation()}>
        {/* Toast Notification */}
        {toastMessage && <div className="admin-toast-banner">{toastMessage}</div>}

        {/* Top Header */}
        <header className="admin-dash-header">
          <div className="dash-header-title-group">
            <span className="dash-admin-badge">Admin Access</span>
            <h2 id="admin-dashboard-title" className="dash-title">
              Media Library & Storage Dashboard
            </h2>
          </div>

          <div className="dash-header-actions">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className="dash-btn btn-primary"
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                >
                  ➕ UPLOAD NEW MEDIA
                </button>
                <button
                  type="button"
                  className="dash-btn btn-outline"
                  onClick={handleLogout}
                  title="Logout of admin session"
                >
                  🔒 Lock
                </button>
              </>
            )}
            <button
              type="button"
              className="dash-close-btn"
              onClick={onClose}
              aria-label="Close admin dashboard"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Authentication Wall if not logged in */}
        {!isAuthenticated ? (
          <div className="admin-auth-panel">
            <div className="admin-auth-card">
              <div className="auth-icon">🔐</div>
              <h3 className="auth-title">Administrator Verification</h3>
              <p className="auth-subtitle">
                Enter your administrative key to manage high-resolution photos, 4K videos, storage
                quotas, and featured stories.
              </p>

              {authError && <div className="auth-error-alert">{authError}</div>}

              <form onSubmit={handleAuthSubmit} className="auth-form">
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Enter Passkey (e.g. mostar2026)"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-primary auth-submit-btn">
                  UNLOCK DASHBOARD
                </button>
              </form>

              <div className="auth-quick-unlock">
                <button type="button" onClick={handleQuickDemoUnlock} className="quick-demo-link">
                  ⚡ Quick Unlock Demo Key (mostar2026)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-dash-body">
            {/* Storage & Library Metrics Cards */}
            <div className="dash-metrics-grid">
              {/* Card 1: Total Photos */}
              <div className="metric-card">
                <div className="metric-icon photo-icon">📸</div>
                <div className="metric-content">
                  <span className="metric-label">Total Photos</span>
                  <strong className="metric-value">{metrics?.totalPhotos ?? 0}</strong>
                  <span className="metric-sub">Published High-Res</span>
                </div>
              </div>

              {/* Card 2: Total Videos */}
              <div className="metric-card">
                <div className="metric-icon video-icon">🎥</div>
                <div className="metric-content">
                  <span className="metric-label">Total Videos</span>
                  <strong className="metric-value">{metrics?.totalVideos ?? 0}</strong>
                  <span className="metric-sub">4K & HD Motion Stories</span>
                </div>
              </div>

              {/* Card 3: Featured Stories */}
              <div className="metric-card">
                <div className="metric-icon star-icon">⭐</div>
                <div className="metric-content">
                  <span className="metric-label">Featured Moments</span>
                  <strong className="metric-value">{metrics?.totalFeatured ?? 0}</strong>
                  <span className="metric-sub">Showcased on Homepage</span>
                </div>
              </div>

              {/* Card 4: Storage Quota Progress */}
              <div className="metric-card storage-card">
                <div className="storage-metric-head">
                  <div className="storage-label-group">
                    <span className="metric-label">Cloud Storage Used</span>
                    <strong className="storage-value-text">
                      {metrics?.usedFormatted || "0 MB"} / {metrics?.totalQuotaFormatted || "50.00 GB"}
                    </strong>
                  </div>
                  <span className="storage-percent-tag">{metrics?.usagePercentage || 0}%</span>
                </div>

                <div className="storage-progress-track">
                  <div
                    className={`storage-progress-bar ${metrics?.isNearFull ? "is-near-full" : ""}`}
                    style={{ width: `${Math.max(metrics?.usagePercentage || 2, 2)}%` }}
                  />
                </div>
                <span className="storage-sub-note">
                  {metrics?.isNearFull
                    ? "⚠️ Quota nearing limit (85%+)"
                    : "✓ High-Performance Object Storage Healthy"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="dash-tabs-bar">
              <div className="tabs-left">
                <button
                  type="button"
                  className={`dash-tab ${activeTab === "all" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  All Media ({metrics?.totalItems ?? 0})
                </button>
                <button
                  type="button"
                  className={`dash-tab ${activeTab === "photos" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("photos")}
                >
                  📸 Photos ({metrics?.totalPhotos ?? 0})
                </button>
                <button
                  type="button"
                  className={`dash-tab ${activeTab === "videos" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("videos")}
                >
                  🎥 Videos ({metrics?.totalVideos ?? 0})
                </button>
                <button
                  type="button"
                  className={`dash-tab ${activeTab === "featured" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("featured")}
                >
                  ⭐ Featured ({metrics?.totalFeatured ?? 0})
                </button>
                <button
                  type="button"
                  className={`dash-tab trash-tab ${activeTab === "trash" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("trash")}
                >
                  🗑️ Recycle Bin ({metrics?.totalTrash ?? 0})
                </button>
              </div>

              {activeTab === "trash" && (metrics?.totalTrash ?? 0) > 0 && (
                <button
                  type="button"
                  className="dash-btn-sm btn-danger-outline"
                  onClick={handleEmptyTrash}
                >
                  Empty Trash
                </button>
              )}
            </div>

            {/* Search, Filter & Controls Bar */}
            <div className="dash-controls-bar">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="dash-search-input"
                  placeholder="Search by title, creator, location, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filters-right-group">
                <select
                  className="dash-filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="dash-filter-select"
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                >
                  <option value="all">All Resolutions</option>
                  <option value="4K">4K Ultra HD</option>
                  <option value="1440p">1440p QHD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                </select>

                <select
                  className="dash-filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="size">Sort: File Size</option>
                  <option value="title">Sort: Title (A-Z)</option>
                </select>

                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === "table" ? "is-active" : ""}`}
                    onClick={() => setViewMode("table")}
                    title="Table View"
                  >
                    ☰
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === "grid" ? "is-active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                  >
                    ☷
                  </button>
                </div>
              </div>
            </div>

            {/* Media Table / Grid View */}
            {filteredItems.length === 0 ? (
              <div className="dash-empty-state">
                <div className="empty-icon">📁</div>
                <h4 className="empty-title">
                  {activeTab === "trash"
                    ? "Recycle Bin is Empty"
                    : "No matching media items found"}
                </h4>
                <p className="empty-sub">
                  {activeTab === "trash"
                    ? "Deleted items will appear here before permanent removal."
                    : "Try adjusting your search query, clearing filters, or upload your first photo or video."}
                </p>
                {activeTab !== "trash" && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      onClose();
                      onOpenUpload();
                    }}
                  >
                    Upload Media Now
                  </button>
                )}
              </div>
            ) : viewMode === "table" ? (
              <div className="dash-table-container">
                <table className="dash-media-table">
                  <thead>
                    <tr>
                      <th>Media</th>
                      <th>Title & Details</th>
                      <th>Type / Res</th>
                      <th>Category</th>
                      <th>Size</th>
                      <th>Date</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className={item.isDeleted ? "row-in-trash" : ""}>
                        {/* Thumbnail */}
                        <td className="td-thumb">
                          <div
                            className="table-thumb-wrap"
                            onClick={() => {
                              onClose();
                              onViewItem(item);
                            }}
                          >
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.title}
                              className="table-thumb-img"
                            />
                            {item.type === "video" && (
                              <span className="table-thumb-play">▶</span>
                            )}
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td className="td-title">
                          <div className="table-title-cell">
                            <strong className="table-item-title">{item.title}</strong>
                            {item.caption && (
                              <span className="table-item-caption">{item.caption}</span>
                            )}
                            <span className="table-item-creator">
                              By {item.creator || item.uploaderName || "Mostar Explorer"}
                            </span>
                          </div>
                        </td>

                        {/* Type & Resolution */}
                        <td className="td-type">
                          <div className="table-badge-group">
                            <span className={`type-badge ${item.type}`}>
                              {item.type === "video" ? "🎥 Video" : "📸 Photo"}
                            </span>
                            {item.resolution && (
                              <span className="res-badge">{item.resolution}</span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="td-category">
                          <span className="category-pill-sm">{item.category || "General"}</span>
                        </td>

                        {/* File Size */}
                        <td className="td-size">
                          <span className="size-text">{item.fileSize || "—"}</span>
                        </td>

                        {/* Date */}
                        <td className="td-date">
                          <span className="date-text">
                            {item.date || new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Featured Toggle */}
                        <td className="td-featured">
                          {!item.isDeleted ? (
                            <button
                              type="button"
                              className={`star-toggle-btn ${item.isFeatured ? "is-featured" : ""}`}
                              onClick={() => handleToggleFeatured(item)}
                              title={
                                item.isFeatured
                                  ? "Unfeature from homepage"
                                  : "Feature on homepage"
                              }
                            >
                              {item.isFeatured ? "⭐ Featured" : "☆ Feature"}
                            </button>
                          ) : (
                            <span className="trash-badge-sm">In Trash</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="td-actions">
                          <div className="table-actions-group">
                            {!item.isDeleted ? (
                              <>
                                <button
                                  type="button"
                                  className="action-icon-btn"
                                  onClick={() => {
                                    onClose();
                                    onViewItem(item);
                                  }}
                                  title="View Fullscreen"
                                >
                                  👁️
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn"
                                  onClick={() => setEditingItem(item)}
                                  title="Edit Details"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn delete-btn"
                                  onClick={() => {
                                    setDeletingItem(item);
                                    setIsDeletingPermanent(false);
                                  }}
                                  title="Move to Recycle Bin"
                                >
                                  🗑️
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="action-icon-btn restore-btn"
                                  onClick={() => handleRestore(item.id, item.title)}
                                  title="Restore Item"
                                >
                                  ♻️ Restore
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn permanent-delete-btn"
                                  onClick={() => {
                                    setDeletingItem(item);
                                    setIsDeletingPermanent(true);
                                  }}
                                  title="Permanently Delete"
                                >
                                  ❌ Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="dash-grid-container">
                {filteredItems.map((item) => (
                  <div key={item.id} className="dash-grid-card">
                    <div
                      className="grid-card-thumb-wrap"
                      onClick={() => {
                        onClose();
                        onViewItem(item);
                      }}
                    >
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        className="grid-card-img"
                      />
                      <div className="grid-card-top-tags">
                        <span className={`grid-type-tag ${item.type}`}>
                          {item.type === "video" ? "🎥 Video" : "📸 Photo"}
                        </span>
                        {item.resolution && (
                          <span className="grid-res-tag">{item.resolution}</span>
                        )}
                      </div>
                      {item.isFeatured && <span className="grid-featured-star">⭐ Featured</span>}
                    </div>

                    <div className="grid-card-info">
                      <h4 className="grid-card-title">{item.title}</h4>
                      <div className="grid-card-meta-row">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.fileSize}</span>
                      </div>

                      <div className="grid-card-actions-bar">
                        {!item.isDeleted ? (
                          <>
                            <button
                              type="button"
                              className="dash-btn-sm"
                              onClick={() => {
                                onClose();
                                onViewItem(item);
                              }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="dash-btn-sm"
                              onClick={() => setEditingItem(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`dash-btn-sm ${item.isFeatured ? "is-featured" : ""}`}
                              onClick={() => handleToggleFeatured(item)}
                            >
                              {item.isFeatured ? "★" : "☆"}
                            </button>
                            <button
                              type="button"
                              className="dash-btn-sm btn-danger-icon"
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeletingPermanent(false);
                              }}
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="dash-btn-sm"
                              onClick={() => handleRestore(item.id, item.title)}
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              className="dash-btn-sm btn-danger-icon"
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeletingPermanent(true);
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sub-modals: Edit & Safe Delete */}
        {editingItem && (
          <EditMediaModal
            item={editingItem}
            onSave={handleSaveEdit}
            onClose={() => setEditingItem(null)}
          />
        )}

        {deletingItem && (
          <SafeDeleteModal
            item={deletingItem}
            isPermanent={isDeletingPermanent}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingItem(null)}
          />
        )}
      </div>
    </div>
  );
}
