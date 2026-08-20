import React from "react";
import { MediaItem } from "../utils/mediaStorage";

interface SafeDeleteModalProps {
  item: MediaItem;
  isPermanent?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SafeDeleteModal({
  item,
  isPermanent = false,
  onConfirm,
  onCancel,
}: SafeDeleteModalProps) {
  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="modal-content-card danger-theme" onClick={(e) => e.stopPropagation()}>
        <div className="modal-danger-icon">⚠️</div>

        <h3 id="delete-dialog-title" className="modal-title">
          {isPermanent ? "Permanently delete this media?" : "Move media to Recycle Bin?"}
        </h3>

        <div className="modal-item-preview-row">
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.title}
            className="delete-preview-thumb"
          />
          <div className="delete-preview-info">
            <h4 className="delete-item-title">{item.title}</h4>
            <div className="delete-item-meta">
              <span>{item.type === "video" ? "🎥 Video" : "📸 Photo"}</span>
              <span>•</span>
              <span>{item.category || "General"}</span>
              {item.fileSize && (
                <>
                  <span>•</span>
                  <span>{item.fileSize}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="modal-description-warning">
          {isPermanent
            ? "Warning: This action is permanent and cannot be undone. The media file will be removed from your cloud storage and local database."
            : "This media will be moved to the Admin Recycle Bin. You can restore it anytime or permanently delete it later."}
        </p>

        <div className="modal-action-buttons">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            CANCEL
          </button>
          <button type="button" className="btn-danger-solid" onClick={onConfirm}>
            {isPermanent ? "PERMANENTLY DELETE" : "MOVE TO TRASH"}
          </button>
        </div>
      </div>
    </div>
  );
}
