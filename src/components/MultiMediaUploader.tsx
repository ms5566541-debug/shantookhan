import React, { useState, useRef } from "react";
import {
  MediaItem,
  MediaFolder,
  MediaResolution,
  generateMediaThumbnail,
} from "../utils/mediaStorage";

interface MultiMediaUploaderProps {
  folders?: MediaFolder[];
  defaultFolderId?: string;
  onSaveItems?: (newItems: MediaItem[]) => void;
  onUploadSuccess?: (newItems: MediaItem[]) => void;
  onClose: () => void;
  isOpen?: boolean;
}

interface PendingUploadItem {
  id: string;
  file?: File;
  previewUrl: string;
  thumbnailUrl?: string;
  type: "photo" | "video";
  title: string;
  caption: string;
  description: string;
  category: string;
  date: string;
  location: string;
  creator: string;
  tags: string;
  resolution: MediaResolution;
  aspectRatio: string;
  fileSize?: string;
  sizeBytes?: number;
  duration?: string;
  isFeatured?: boolean;
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

export function MultiMediaUploader({
  folders = [],
  defaultFolderId,
  onSaveItems,
  onUploadSuccess,
  onClose,
  isOpen = true,
}: MultiMediaUploaderProps) {
  if (!isOpen) return null;
  // Common batch defaults
  const [batchCategory, setBatchCategory] = useState<string>("Old Town");
  const [batchLocation, setBatchLocation] = useState<string>("Mostar, Bosnia & Herzegovina");
  const [batchDate, setBatchDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [batchCreator, setBatchCreator] = useState<string>("Mostar Explorer");
  const [batchResolution, setBatchResolution] = useState<MediaResolution>("4K");
  const [batchTags, setBatchTags] = useState<string>("Mostar, Travel");

  // Pending Items Queue
  const [pendingItems, setPendingItems] = useState<PendingUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Upload simulation & progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusStep, setUploadStatusStep] = useState("");
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytesToUpload, setTotalBytesToUpload] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Mode switcher: File upload vs Direct URL link vs Live Camera
  const [uploadMode, setUploadMode] = useState<"file" | "url" | "camera">("file");

  // URL mode
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"photo" | "video">("photo");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlCaption, setUrlCaption] = useState("");

  // Live Camera mode
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Process selected files
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newPending: PendingUploadItem[] = [];

    for (const file of fileArray) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) continue;

      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      // Auto thumbnail generation
      let thumb = "";
      try {
        thumb = await generateMediaThumbnail(file);
      } catch {
        thumb = isVideo
          ? "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop"
          : "";
      }

      const previewUrl = URL.createObjectURL(file);
      const sizeMb = file.size / (1024 * 1024);
      const sizeFormatted =
        sizeMb >= 1000 ? `${(sizeMb / 1024).toFixed(2)} GB` : `${sizeMb.toFixed(1)} MB`;

      newPending.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
        thumbnailUrl: thumb || previewUrl,
        type: isVideo ? "video" : "photo",
        title: formattedTitle,
        caption: `Captured in ${batchLocation}`,
        description: `Breathtaking high-definition moment from ${batchLocation}.`,
        category: batchCategory,
        date: batchDate,
        location: batchLocation,
        creator: batchCreator,
        tags: batchTags,
        resolution: batchResolution,
        aspectRatio: isVideo ? "16:9" : "4:3",
        fileSize: sizeFormatted,
        sizeBytes: file.size,
        duration: isVideo ? "1:30" : undefined,
      });
    }

    setPendingItems((prev) => [...prev, ...newPending]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Add Item via URL
  const handleAddFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem: PendingUploadItem = {
      id: `url-${Date.now()}`,
      previewUrl: urlInput.trim(),
      thumbnailUrl: urlType === "photo" ? urlInput.trim() : undefined,
      type: urlType,
      title: urlTitle.trim() || (urlType === "video" ? "Mostar Motion Story" : "Mostar High-Res View"),
      caption: urlCaption.trim() || `Captured in ${batchLocation}`,
      description: urlCaption.trim(),
      category: batchCategory,
      date: batchDate,
      location: batchLocation,
      creator: batchCreator,
      tags: batchTags,
      resolution: batchResolution,
      aspectRatio: "16:9",
      fileSize: urlType === "video" ? "25.0 MB" : "4.2 MB",
      sizeBytes: (urlType === "video" ? 25 : 4.2) * 1024 * 1024,
    };

    setPendingItems((prev) => [...prev, newItem]);
    setUrlInput("");
    setUrlTitle("");
    setUrlCaption("");
    setUploadMode("file");
  };

  // Camera Live Capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch {
      alert("Camera access was not permitted or is unavailable in this environment.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoPreviewRef.current) return;
    const video = videoPreviewRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const capturedItem: PendingUploadItem = {
        id: `camera-${Date.now()}`,
        previewUrl: dataUrl,
        thumbnailUrl: dataUrl,
        type: "photo",
        title: `Live Snapshot - ${new Date().toLocaleTimeString()}`,
        caption: `Live camera moment at ${batchLocation}`,
        description: "",
        category: batchCategory,
        date: batchDate,
        location: batchLocation,
        creator: batchCreator,
        tags: "Live Snapshot, Camera, Mostar",
        resolution: "1080p",
        aspectRatio: "16:9",
        fileSize: "2.8 MB",
        sizeBytes: 2936012,
      };

      setPendingItems((prev) => [...prev, capturedItem]);
      stopCamera();
    }
  };

  // Update item field
  const updatePendingItem = (id: string, field: keyof PendingUploadItem, value: any) => {
    setPendingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removePendingItem = (id: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Final animated upload execution
  const handleStartUpload = async () => {
    if (pendingItems.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    // Calculate total bytes
    let totalBytes = 0;
    for (const item of pendingItems) {
      totalBytes += item.sizeBytes || 5 * 1024 * 1024;
    }
    setTotalBytesToUpload(totalBytes);

    const steps = [
      "Validating binary streams and media headers...",
      "Generating high-performance 4K thumbnails and posters...",
      "Optimizing color profiles and streaming bitrate...",
      "Persisting metadata records to cloud object storage...",
      "Finalizing media library indexes...",
    ];

    // Simulated multi-step progress
    for (let progress = 5; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      setUploadProgress(progress);
      setUploadedBytes(Math.round((progress / 100) * totalBytes));

      const stepIdx = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
      setUploadStatusStep(steps[stepIdx]);
    }

    // Convert pending to MediaItem
    const finalItems: MediaItem[] = pendingItems.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title || "Untitled Mostar Moment",
      caption: p.caption,
      description: p.description || p.caption,
      category: p.category || batchCategory,
      location: p.location || batchLocation,
      date: p.date || batchDate,
      creator: p.creator || batchCreator,
      uploaderName: p.creator || batchCreator,
      url: p.previewUrl,
      thumbnailUrl: p.thumbnailUrl || p.previewUrl,
      sourceType: p.file ? "upload" : p.previewUrl.startsWith("data:") ? "camera" : "url",
      fileSize: p.fileSize,
      sizeBytes: p.sizeBytes,
      fileName: p.file?.name,
      mimeType: p.file?.type,
      resolution: p.resolution || batchResolution,
      duration: p.duration,
      aspectRatio: p.aspectRatio,
      createdAt: Date.now(),
      isFavorite: false,
      isFeatured: p.isFeatured || false,
      visibility: "public",
      processingStatus: "ready",
      tags: p.tags ? p.tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean) : [],
    }));

    if (onSaveItems) onSaveItems(finalItems);
    if (onUploadSuccess) onUploadSuccess(finalItems);
    setUploadSuccess(true);
    setIsUploading(false);

    // Auto-close after success banner
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content-card uploader-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-card-header">
          <div className="uploader-header-title">
            <span className="uploader-badge">4K Ultra HD & High-Res</span>
            <h3 className="modal-title">Upload Photos & 4K Videos</h3>
            <p className="modal-subtitle">
              Share your favorite moments, walking tours, and landscapes of Mostar with the world.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close upload modal">
            ✕
          </button>
        </div>

        {/* Success Banner */}
        {uploadSuccess && (
          <div className="upload-success-banner">
            <div className="success-icon">🎉</div>
            <div className="success-text-group">
              <h4>Upload successful!</h4>
              <p>Your media has been processed in high definition and added to the gallery.</p>
            </div>
          </div>
        )}

        {/* Progress Bar Display when Uploading */}
        {isUploading && (
          <div className="upload-progress-container">
            <div className="progress-info-row">
              <span className="progress-step-text">{uploadStatusStep}</span>
              <span className="progress-percent-text">{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="progress-meta-row">
              <span>
                Processed: {formatSize(uploadedBytes)} / {formatSize(totalBytesToUpload)}
              </span>
              <span>4K Multi-Quality Profile</span>
            </div>
          </div>
        )}

        {!isUploading && !uploadSuccess && (
          <div className="uploader-content-body">
            {/* Batch Global Defaults Config Card */}
            <div className="batch-defaults-card">
              <div className="batch-card-header">
                <span>⚙️ Default Settings for This Batch</span>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={batchCategory}
                    onChange={(e) => {
                      setBatchCategory(e.target.value);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, category: e.target.value }))
                      );
                    }}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batchLocation}
                    onChange={(e) => {
                      setBatchLocation(e.target.value);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, location: e.target.value }))
                      );
                    }}
                    placeholder="e.g. Stari Most, Old Town Mostar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date Taken</label>
                  <input
                    type="date"
                    className="form-input"
                    value={batchDate}
                    onChange={(e) => {
                      setBatchDate(e.target.value);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, date: e.target.value }))
                      );
                    }}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Photographer / Creator</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batchCreator}
                    onChange={(e) => {
                      setBatchCreator(e.target.value);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, creator: e.target.value }))
                      );
                    }}
                    placeholder="Your Name or Studio"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Profile</label>
                  <select
                    className="form-select"
                    value={batchResolution}
                    onChange={(e) => {
                      const res = e.target.value as MediaResolution;
                      setBatchResolution(res);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, resolution: res }))
                      );
                    }}
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="1440p">1440p QHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batchTags}
                    onChange={(e) => {
                      setBatchTags(e.target.value);
                      setPendingItems((prev) =>
                        prev.map((i) => ({ ...i, tags: e.target.value }))
                      );
                    }}
                    placeholder="Mostar, Sunset, Old Town"
                  />
                </div>
              </div>
            </div>

            {/* Upload Method Selector */}
            <div className="upload-tabs-selector">
              <button
                type="button"
                className={`upload-tab-btn ${uploadMode === "file" ? "is-active" : ""}`}
                onClick={() => {
                  setUploadMode("file");
                  stopCamera();
                }}
              >
                📁 Multi-File Drag & Drop
              </button>
              <button
                type="button"
                className={`upload-tab-btn ${uploadMode === "url" ? "is-active" : ""}`}
                onClick={() => {
                  setUploadMode("url");
                  stopCamera();
                }}
              >
                🔗 Media / Video URL
              </button>
              <button
                type="button"
                className={`upload-tab-btn ${uploadMode === "camera" ? "is-active" : ""}`}
                onClick={() => {
                  setUploadMode("camera");
                  if (!isCameraActive) startCamera();
                }}
              >
                📷 Live Camera Snapshot
              </button>
            </div>

            {/* Mode 1: Drag & Drop Dropzone */}
            {uploadMode === "file" && (
              <div
                className={`dropzone-area ${isDragOver ? "is-dragover" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div className="dropzone-inner-content">
                  <div className="dropzone-icon">📥</div>
                  <h4 className="dropzone-title">Drag & Drop Photos & 4K Videos Here</h4>
                  <p className="dropzone-sub">
                    or click to browse your device (JPG, PNG, WEBP, MP4, MOV, WebM up to 4K)
                  </p>
                  <span className="dropzone-pill">⚡ Multi-file processing with auto thumbnails</span>
                </div>
              </div>
            )}

            {/* Mode 2: URL Input */}
            {uploadMode === "url" && (
              <form onSubmit={handleAddFromUrl} className="url-upload-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={urlType}
                      onChange={(e) => setUrlType(e.target.value as any)}
                    >
                      <option value="photo">📸 High-Res Photo URL</option>
                      <option value="video">🎥 4K / HD Video Stream URL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Fortica Viewpoint Sunset"
                      value={urlTitle}
                      onChange={(e) => setUrlTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Direct Media URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/... or https://...mp4"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Caption / Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short description..."
                    value={urlCaption}
                    onChange={(e) => setUrlCaption(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  + Add to Upload Queue
                </button>
              </form>
            )}

            {/* Mode 3: Live Camera */}
            {uploadMode === "camera" && (
              <div className="camera-panel-box">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video-stream"
                />
                <div className="camera-actions-bar">
                  <button type="button" className="btn-primary" onClick={capturePhoto}>
                    📸 Capture Snapshot
                  </button>
                  <button type="button" className="btn-secondary" onClick={stopCamera}>
                    Close Camera
                  </button>
                </div>
              </div>
            )}

            {/* Pending Queue List */}
            {pendingItems.length > 0 && (
              <div className="pending-queue-box">
                <div className="queue-top-bar">
                  <h4>
                    Files in Queue ({pendingItems.length}{" "}
                    {pendingItems.length === 1 ? "Item" : "Items"})
                  </h4>
                  <button
                    type="button"
                    className="clear-queue-btn"
                    onClick={() => setPendingItems([])}
                  >
                    Clear Queue
                  </button>
                </div>

                <div className="queue-grid">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="queue-card">
                      <div className="queue-thumb-wrap">
                        {item.type === "video" ? (
                          <video
                            src={item.previewUrl}
                            className="queue-thumb"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.previewUrl}
                            alt={item.title}
                            className="queue-thumb"
                          />
                        )}
                        <span className={`queue-badge ${item.type}`}>
                          {item.type === "video" ? "🎥 Video" : "📸 Photo"}
                        </span>
                        <button
                          type="button"
                          className="queue-delete-btn"
                          onClick={() => removePendingItem(item.id)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="queue-inputs">
                        <input
                          type="text"
                          className="queue-input-title"
                          placeholder="Title..."
                          value={item.title}
                          onChange={(e) =>
                            updatePendingItem(item.id, "title", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          className="queue-input-caption"
                          placeholder="Caption..."
                          value={item.caption}
                          onChange={(e) =>
                            updatePendingItem(item.id, "caption", e.target.value)
                          }
                        />
                        <div className="queue-row-2">
                          <select
                            className="queue-select-cat"
                            value={item.category}
                            onChange={(e) =>
                              updatePendingItem(item.id, "category", e.target.value)
                            }
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <span className="queue-size-tag">{item.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!isUploading && !uploadSuccess && (
          <div className="modal-card-footer">
            <div className="footer-status-info">
              {pendingItems.length > 0
                ? `${pendingItems.length} items ready to publish to gallery`
                : "Drop photos or videos to start"}
            </div>
            <div className="footer-btn-group">
              <button type="button" className="btn-secondary" onClick={onClose}>
                CANCEL
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartUpload}
                disabled={pendingItems.length === 0}
              >
                PUBLISH {pendingItems.length > 0 ? `(${pendingItems.length})` : ""} TO GALLERY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
