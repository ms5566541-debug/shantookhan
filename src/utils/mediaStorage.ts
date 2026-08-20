export type MediaResolution = "4K" | "1440p" | "1080p" | "720p" | "Original";
export type MediaProcessingStatus = "ready" | "processing" | "failed";

export interface MediaFolder {
  id: string;
  name: string;
  location?: string;
  year?: number | string;
  dateRange?: string;
  description?: string;
  color?: string;
  icon?: string;
  coverUrl?: string;
  taggedFriends?: string[];
  createdAt: number;
}

export interface MediaItem {
  id: string;
  folderId?: string; // Trip Album ID
  type: "photo" | "video";
  title: string;
  caption?: string;
  description?: string;
  date?: string; // e.g. "2026-05-15"
  location?: string; // e.g. "Stari Most, Old Town Mostar"
  taggedCrew?: string[]; // Friend names or IDs
  uploaderName?: string; // Photographer or Creator
  creator?: string; // Alias for uploaderName
  category?: string; // e.g. "Stari Most", "Old Town", "Neretva River", etc.
  videoCategory?: string;
  url: string; // Blob URL, base64, or cloud object URL
  thumbnailUrl?: string;
  sourceType: "upload" | "url" | "camera" | "sample";
  fileSize?: string;
  sizeBytes?: number;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: string;
  aspectRatio?: string;
  resolution?: MediaResolution;
  createdAt: number;
  updatedAt?: number;
  isFavorite?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  visibility?: "public" | "hidden";
  processingStatus?: MediaProcessingStatus;
  isDeleted?: boolean;
  deletedAt?: number;
  tags?: string[];
  embedUrl?: string;
  storageProvider?: string;
}

export interface StorageMetrics {
  totalItems: number;
  totalPhotos: number;
  totalVideos: number;
  totalFeatured: number;
  totalProcessing: number;
  totalTrash: number;
  usedBytes: number;
  usedFormatted: string;
  totalQuotaBytes: number;
  totalQuotaFormatted: string;
  usagePercentage: number;
  isNearFull: boolean;
}

const DB_NAME = "MostarMediaDB";
const STORE_NAME = "media_items";
const FOLDERS_STORE_NAME = "media_folders";
const DB_VERSION = 4;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("folderId", "folderId", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("isFeatured", "isFeatured", { unique: false });
        store.createIndex("isDeleted", "isDeleted", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE_NAME)) {
        const folderStore = db.createObjectStore(FOLDERS_STORE_NAME, { keyPath: "id" });
        folderStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// DEFAULT TRIP ALBUMS
export const DEFAULT_FOLDERS: MediaFolder[] = [
  {
    id: "trip-mostar",
    name: "🏰 Mostar Old Town Heritage",
    location: "Mostar, Bosnia & Herzegovina",
    year: 2026,
    dateRange: "May 12 - 18, 2026",
    description: "Ottoman cobblestones, 24m Stari Most cliff diving championship, crystal Neretva river, and Kravice waterfalls.",
    color: "#0ea5e9",
    icon: "🏰",
    coverUrl: "https://images.unsplash.com/photo-1594993877167-a08f13013dc3?q=80&w=800&auto=format&fit=crop",
    taggedFriends: ["Shanto Khan", "Mahibhur Rahman", "Jahid Hossain"],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

export async function getAllFolders(): Promise<MediaFolder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FOLDERS_STORE_NAME, "readonly");
      const store = tx.objectStore(FOLDERS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results: MediaFolder[] = request.result || [];
        results.sort((a, b) => a.createdAt - b.createdAt);
        resolve(results.length > 0 ? results : DEFAULT_FOLDERS);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn("IndexedDB folders fallback", error);
    try {
      const saved = localStorage.getItem("custom_media_folders");
      return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
    } catch {
      return DEFAULT_FOLDERS;
    }
  }
}

export async function saveFolder(folder: MediaFolder): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FOLDERS_STORE_NAME, "readwrite");
      const store = tx.objectStore(FOLDERS_STORE_NAME);
      const request = store.put(folder);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Folder save fallback", error);
  }
}

export async function deleteFolder(folderId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FOLDERS_STORE_NAME, "readwrite");
      const store = tx.objectStore(FOLDERS_STORE_NAME);
      const request = store.delete(folderId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Folder delete fallback", error);
  }
}

// Fetch all media items with optional trash filter
export async function getAllMediaItems(includeTrash = false): Promise<MediaItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results: MediaItem[] = request.result || [];
        if (!includeTrash) {
          results = results.filter((item) => !item.isDeleted);
        }
        // Sort newest first
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn("Failed to read from IndexedDB, falling back to localStorage", error);
    try {
      const saved = localStorage.getItem("custom_media_gallery");
      const list: MediaItem[] = saved ? JSON.parse(saved) : [];
      return includeTrash ? list : list.filter((i) => !i.isDeleted);
    } catch {
      return [];
    }
  }
}

// Save or Update Media Item
export async function saveMediaItem(item: MediaItem): Promise<void> {
  const updatedItem: MediaItem = {
    ...item,
    updatedAt: Date.now(),
    creator: item.creator || item.uploaderName || "Mostar Explorer",
    uploaderName: item.uploaderName || item.creator || "Mostar Explorer",
    visibility: item.visibility || "public",
    processingStatus: item.processingStatus || "ready",
    isDeleted: !!item.isDeleted,
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(updatedItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("IndexedDB save fallback", error);
  }
}

// Soft Delete (Move to Recycle Bin)
export async function softDeleteMediaItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: MediaItem = getReq.result;
        if (item) {
          item.isDeleted = true;
          item.deletedAt = Date.now();
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (error) {
    console.warn("Soft delete fallback", error);
  }
}

// Restore from Recycle Bin
export async function restoreMediaItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: MediaItem = getReq.result;
        if (item) {
          item.isDeleted = false;
          item.deletedAt = undefined;
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (error) {
    console.warn("Restore fallback", error);
  }
}

// Permanent Delete
export async function deleteMediaItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Permanent delete failed", error);
  }
}

// Empty Trash
export async function emptyTrash(): Promise<void> {
  const all = await getAllMediaItems(true);
  const inTrash = all.filter((i) => i.isDeleted);
  for (const item of inTrash) {
    await deleteMediaItem(item.id);
  }
}

// Calculate Storage Metrics
export async function getStorageMetrics(): Promise<StorageMetrics> {
  const all = await getAllMediaItems(true);
  const activeItems = all.filter((i) => !i.isDeleted);
  const trashItems = all.filter((i) => i.isDeleted);

  let totalPhotos = 0;
  let totalVideos = 0;
  let totalFeatured = 0;
  let totalProcessing = 0;
  let totalBytes = 0;

  for (const item of activeItems) {
    if (item.type === "photo") totalPhotos++;
    if (item.type === "video") totalVideos++;
    if (item.isFeatured) totalFeatured++;
    if (item.processingStatus === "processing") totalProcessing++;

    if (item.sizeBytes && item.sizeBytes > 0) {
      totalBytes += item.sizeBytes;
    } else if (item.fileSize) {
      // Parse approximate e.g. "3.4 MB", "18.4 MB"
      const num = parseFloat(item.fileSize);
      if (item.fileSize.toUpperCase().includes("GB")) {
        totalBytes += num * 1024 * 1024 * 1024;
      } else if (item.fileSize.toUpperCase().includes("MB")) {
        totalBytes += num * 1024 * 1024;
      } else if (item.fileSize.toUpperCase().includes("KB")) {
        totalBytes += num * 1024;
      } else {
        totalBytes += (item.type === "video" ? 25 : 3.5) * 1024 * 1024;
      }
    } else {
      totalBytes += (item.type === "video" ? 25 : 3.5) * 1024 * 1024;
    }
  }

  const quotaBytes = 50 * 1024 * 1024 * 1024; // 50 GB Cloud Quota
  const usagePercentage = Math.min(100, parseFloat(((totalBytes / quotaBytes) * 100).toFixed(2)));

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    totalItems: activeItems.length,
    totalPhotos,
    totalVideos,
    totalFeatured,
    totalProcessing,
    totalTrash: trashItems.length,
    usedBytes: totalBytes,
    usedFormatted: formatSize(totalBytes),
    totalQuotaBytes: quotaBytes,
    totalQuotaFormatted: "50.00 GB",
    usagePercentage,
    isNearFull: usagePercentage >= 85,
  };
}

// Generate thumbnail from image or video file
export function generateMediaThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/webp", 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth || 800, 800);
          canvas.height = Math.round((canvas.width * (video.videoHeight || 450)) / (video.videoWidth || 800));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL("image/jpeg", 0.85);
            URL.revokeObjectURL(url);
            resolve(thumbUrl);
          } else {
            URL.revokeObjectURL(url);
            resolve("https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop");
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve("https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop");
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop");
      };
    } else {
      resolve("");
    }
  });
}
