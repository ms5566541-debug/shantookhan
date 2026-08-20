import React, { useState } from "react";
import { MediaItem, MediaResolution, generateMediaThumbnail } from "../utils/mediaStorage";

interface EditMediaModalProps {
  item: MediaItem;
  onSave: (updatedItem: MediaItem) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  "Old Town",
  "Stari Most",
  "Neretva River",
  "Streets & Architecture",
  "Food & Cafés",
  "Local Life",
  "Sunset & Views",
  "Walking Tours",
  "Culture & Heritage",
];

export function EditMediaModal({ item, onSave, onClose }: EditMediaModalProps) {
  const [title, setTitle] = useState(item.title || "");
  const [caption, setCaption] = useState(item.caption || "");
  const [description, setDescription] = useState(item.description || "");
  const [category, setCategory] = useState(item.category || "Old Town");
  const [location, setLocation] = useState(item.location || "");
  const [date, setDate] = useState(item.date || "");
  const [creator, setCreator] = useState(item.creator || item.uploaderName || "");
  const [resolution, setResolution] = useState<MediaResolution>(item.resolution || "4K");
  const [tagsString, setTagsString] = useState((item.tags || []).join(", "));
  const [isFeatured, setIsFeatured] = useState(!!item.isFeatured);
  const [visibility, setVisibility] = useState<"public" | "hidden">(item.visibility || "public");
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnailUrl || item.url);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingThumb(true);
    try {
      const thumb = await generateMediaThumbnail(file);
      setThumbnailUrl(thumb);
    } catch {
      setErrorMsg("Failed to generate thumbnail from uploaded file.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    const tagsArray = tagsString
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter((t) => t.length > 0);

    const updated: MediaItem = {
      ...item,
      title: title.trim(),
      caption: caption.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      date: date.trim(),
      creator: creator.trim(),
      uploaderName: creator.trim(),
      resolution,
      tags: tagsArray,
      isFeatured,
      visibility,
      thumbnailUrl,
      updatedAt: Date.now(),
    };

    onSave(updated);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-media-title"
    >
      <div className="modal-content-card edit-media-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card-header">
          <div>
            <span className="modal-type-badge">
              {item.type === "video" ? "🎥 Edit Video" : "📸 Edit Photo"}
            </span>
            <h3 id="edit-media-title" className="modal-title">
              Edit Media Details
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close edit modal">
            ✕
          </button>
        </div>

        {errorMsg && <div className="modal-alert-box error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="edit-media-form">
          <div className="edit-form-grid">
            {/* Left Preview Column */}
            <div className="edit-preview-col">
              <div className="edit-media-preview-box">
                <img src={thumbnailUrl || item.url} alt={title} className="edit-main-preview-img" />
                <div className="edit-preview-overlay-info">
                  <span>{item.type.toUpperCase()}</span>
                  <span>{resolution}</span>
                </div>
              </div>

              <div className="custom-thumb-upload-wrap">
                <label className="field-label-sm">Custom Thumbnail / Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="file-input-sm"
                />
                {isUploadingThumb && <span className="helper-text-spin">Processing thumbnail...</span>}
              </div>

              <div className="edit-item-specs-box">
                <div className="spec-row">
                  <span>File Size:</span>
                  <strong>{item.fileSize || "Unknown"}</strong>
                </div>
                <div className="spec-row">
                  <span>Created:</span>
                  <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
                </div>
                <div className="spec-row">
                  <span>Source:</span>
                  <strong>{item.sourceType}</strong>
                </div>
              </div>
            </div>

            {/* Right Fields Column */}
            <div className="edit-fields-col">
              <div className="form-group">
                <label className="form-label required">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stari Most at Sunset"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Profile</label>
                  <select
                    className="form-select"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as MediaResolution)}
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="1440p">1440p QHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="Original">Original Resolution</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Stari Most, Old Town Mostar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date Taken</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Photographer / Creator</label>
                  <input
                    type="text"
                    className="form-input"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="e.g. Tarik Hadžić"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <select
                    className="form-select"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as "public" | "hidden")}
                  >
                    <option value="public">Public (Visible in Gallery)</option>
                    <option value="hidden">Hidden / Draft</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Caption</label>
                <input
                  type="text"
                  className="form-input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="One sentence description..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Story / Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the story behind this moment..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="Stari Most, Sunset, 4K, Old Town"
                />
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-label-styled">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-text">
                    ⭐ <strong>Feature this in "Featured Moments" showcase</strong>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-card-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-primary">
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
