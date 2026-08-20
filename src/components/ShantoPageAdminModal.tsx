import React, { useState } from "react";
import {
  ShantoPageConfig,
  ShantoPlace,
  ShantoNote,
  saveShantoPageData,
  resetShantoPageData,
} from "../data/shantoPageData";

interface ShantoPageAdminModalProps {
  config: ShantoPageConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: ShantoPageConfig) => void;
}

export const ShantoPageAdminModal: React.FC<ShantoPageAdminModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ShantoPageConfig>(() => ({ ...config }));
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "places" | "notes" | "buttons">("hero");
  const [notification, setNotification] = useState<string | null>(null);

  // New note form state
  const [newNote, setNewNote] = useState<Omit<ShantoNote, "id">>({
    title: "",
    category: "Travel Story",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=1200&auto=format&fit=crop",
    text: "",
  });

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    saveShantoPageData(formData);
    onSave(formData);
    showToast("✓ All changes saved successfully!");
    setTimeout(() => onClose(), 600);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all content to defaults?")) {
      const def = resetShantoPageData();
      setFormData(def);
      onSave(def);
      showToast("✓ Reset to original default content.");
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, heroImage: result }));
      showToast("✓ Hero image updated from file.");
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceChange = (index: number, field: keyof ShantoPlace, value: string) => {
    setFormData((prev) => {
      const updatedPlaces = [...prev.places];
      updatedPlaces[index] = { ...updatedPlaces[index], [field]: value };
      return { ...prev, places: updatedPlaces };
    });
  };

  const handleNoteChange = (index: number, field: keyof ShantoNote, value: string) => {
    setFormData((prev) => {
      const updatedNotes = [...prev.notes];
      updatedNotes[index] = { ...updatedNotes[index], [field]: value };
      return { ...prev, notes: updatedNotes };
    });
  };

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.text.trim()) {
      alert("Please enter a title and text for the note.");
      return;
    }
    const noteToAdd: ShantoNote = {
      id: `note-${Date.now()}`,
      ...newNote,
    };
    setFormData((prev) => ({ ...prev, notes: [noteToAdd, ...prev.notes] }));
    setNewNote({
      title: "",
      category: "Travel Story",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=1200&auto=format&fit=crop",
      text: "",
    });
    showToast("✓ Note added successfully!");
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Delete this note?")) {
      setFormData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
      showToast("✓ Note removed.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Shanto Page Content &amp; Media Manager
              </h2>
              <p className="text-xs text-amber-400/90 font-medium">
                Live Admin Editing • Instant Cloud/Browser Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("hero")}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
              activeTab === "hero"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            1. Hero &amp; Title
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
              activeTab === "about"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            2. About Shanto
          </button>
          <button
            onClick={() => setActiveTab("places")}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
              activeTab === "places"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            3. Places I Love ({formData.places.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
              activeTab === "notes"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            4. My Notes ({formData.notes.length})
          </button>
          <button
            onClick={() => setActiveTab("buttons")}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
              activeTab === "buttons"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            5. Buttons &amp; Links
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {notification && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-sm font-medium animate-fadeIn">
              {notification}
            </div>
          )}

          {/* TAB 1: HERO & TITLE */}
          {activeTab === "hero" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Main Hero Title
                  </label>
                  <input
                    type="text"
                    value={formData.pageTitle}
                    onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-serif text-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.pageSubtitle}
                    onChange={(e) => setFormData({ ...formData, pageSubtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hero Background Image (Uploaded Mostar Panorama)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    placeholder="https://... (Cloud Image URL)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="cursor-pointer px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-lg transition flex items-center gap-1.5 whitespace-nowrap">
                    <span>📷 Upload New</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeroImageUpload}
                    />
                  </label>
                </div>
                {formData.heroImage && (
                  <div className="mt-3 relative h-36 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={formData.heroImage}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <span className="text-xs bg-black/70 px-2.5 py-1 rounded text-white font-mono">
                        Hero Background Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hero Info Heading
                </label>
                <input
                  type="text"
                  value={formData.heroInfoHeading}
                  onChange={(e) => setFormData({ ...formData, heroInfoHeading: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hero Info Description Text (Editable)
                </label>
                <textarea
                  rows={4}
                  value={formData.heroInfoText}
                  onChange={(e) => setFormData({ ...formData, heroInfoText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT SHANTO */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  About Section Title
                </label>
                <input
                  type="text"
                  value={formData.aboutHeading}
                  onChange={(e) => setFormData({ ...formData, aboutHeading: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  About Shanto Paragraph Text (Editable Bio / Story)
                </label>
                <textarea
                  rows={6}
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  placeholder="Write your personal introduction, memories, journey notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PLACES I LOVE */}
          {activeTab === "places" && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400">
                Edit the 4 featured Mostar destination cards (Old Town, Stari Most, Neretva River, Old Bazaar).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.places.map((place, idx) => (
                  <div
                    key={place.id || idx}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Place #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{place.location}</span>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Place Title</label>
                      <input
                        type="text"
                        value={place.title}
                        onChange={(e) => handlePlaceChange(idx, "title", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={place.shortDescription}
                        onChange={(e) => handlePlaceChange(idx, "shortDescription", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={place.image}
                        onChange={(e) => handlePlaceChange(idx, "image", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {place.image && (
                      <div className="h-24 rounded overflow-hidden border border-slate-800">
                        <img
                          src={place.image}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MY NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Add New Note Box */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>✍️</span> Add a New Personal Note / Travel Story
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunset over the Old Bridge"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. River Memories, Culture"
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newNote.image}
                    onChange={(e) => setNewNote({ ...newNote, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Story / Note Text</label>
                  <textarea
                    rows={3}
                    placeholder="Write your travel note or description..."
                    value={newNote.text}
                    onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition"
                >
                  + Add Note to Page
                </button>
              </div>

              {/* List of Existing Notes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Existing Notes ({formData.notes.length})
                </h4>
                {formData.notes.map((note, idx) => (
                  <div
                    key={note.id || idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">{note.category} • {note.date}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 bg-red-950/40 rounded hover:bg-red-900/50 transition"
                      >
                        Delete Note
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={note.title}
                        onChange={(e) => handleNoteChange(idx, "title", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-bold text-white"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        value={note.text}
                        onChange={(e) => handleNoteChange(idx, "text", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={note.image}
                        onChange={(e) => handleNoteChange(idx, "image", e.target.value)}
                        placeholder="Image URL"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BUTTONS */}
          {activeTab === "buttons" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Button 1 Label
                  </label>
                  <input
                    type="text"
                    value={formData.exploreGalleryBtnText}
                    onChange={(e) => setFormData({ ...formData, exploreGalleryBtnText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Opens the comprehensive photo gallery modal/view.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Button 2 Label
                  </label>
                  <input
                    type="text"
                    value={formData.watchVideosBtnText}
                    onChange={(e) => setFormData({ ...formData, watchVideosBtnText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Opens the 4K cinematic video player &amp; video gallery.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-amber-400 transition"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <span>💾 Save All Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
