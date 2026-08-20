import React, { useState, useEffect } from "react";
import {
  ShantoPageConfig,
  ShantoPlace,
  ShantoNote,
  loadShantoPageData,
  saveShantoPageData,
} from "../data/shantoPageData";
import { ShantoPageAdminModal } from "./ShantoPageAdminModal";
import { DEFAULT_SAMPLE_MEDIA } from "../data/defaultMedia";
import { MediaItem } from "../utils/mediaStorage";
import { LightboxPhotoViewer } from "./LightboxPhotoViewer";
import { ModernVideoPlayerModal } from "./ModernVideoPlayerModal";

interface ShantoPageProps {
  onBackToHome: () => void;
  onOpenGlobalGallery?: () => void;
  onOpenGlobalVideos?: () => void;
}

export const ShantoPage: React.FC<ShantoPageProps> = ({
  onBackToHome,
  onOpenGlobalGallery,
  onOpenGlobalVideos,
}) => {
  const [config, setConfig] = useState<ShantoPageConfig>(() => loadShantoPageData());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<ShantoPlace | null>(null);
  const [selectedNote, setSelectedNote] = useState<ShantoNote | null>(null);

  // Media modals
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  // Gallery items for this page
  const [photosList, setPhotosList] = useState<MediaItem[]>([]);
  const [videosList, setVideosList] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Load photos and videos from default sample media or cloud storage
    try {
      const photos = DEFAULT_SAMPLE_MEDIA.filter((m) => m.type === "photo");
      const videos = DEFAULT_SAMPLE_MEDIA.filter((m) => m.type === "video");
      setPhotosList(photos);
      setVideosList(videos);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Quick inline edit state for hero/about
  const [isInlineEditingAbout, setIsInlineEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(config.aboutText);

  const handleSaveAboutDraft = () => {
    const updated = { ...config, aboutText: aboutDraft };
    setConfig(updated);
    saveShantoPageData(updated);
    setIsInlineEditingAbout(false);
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="shanto-standalone-page bg-[#060911] text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-black">
      {/* ========================================================================= */}
      {/* 0. TOP STICKY NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xl transition-all">
        {/* Left: Back to Home + Page Branding */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-amber-400/70 text-slate-300 hover:text-amber-300 text-xs font-semibold tracking-wider transition shadow-sm group"
            title="Return to Main Experience"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <h1 className="text-base md:text-lg font-serif font-black tracking-widest text-white uppercase">
              {config.pageTitle}
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-amber-400/80 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Personal Journey
            </span>
          </div>
        </div>

        {/* Center: In-Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-wider text-slate-400">
          <button
            onClick={() => scrollToAnchor("shanto-about")}
            className="hover:text-amber-400 transition"
          >
            About
          </button>
          <button
            onClick={() => scrollToAnchor("shanto-places")}
            className="hover:text-amber-400 transition"
          >
            Places I Love
          </button>
          <button
            onClick={() => scrollToAnchor("shanto-gallery")}
            className="hover:text-amber-400 transition"
          >
            My Gallery
          </button>
          <button
            onClick={() => scrollToAnchor("shanto-videos")}
            className="hover:text-amber-400 transition"
          >
            My Videos
          </button>
          <button
            onClick={() => scrollToAnchor("shanto-notes")}
            className="hover:text-amber-400 transition"
          >
            My Notes
          </button>
        </nav>

        {/* Right: Admin Edit Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold tracking-wider hover:bg-amber-500/30 transition shadow-sm"
            title="Admin Content Manager"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Admin Edit Page</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* Uses the uploaded Mostar panorama image as the hero background             */}
      {/* ========================================================================= */}
      <section
        id="shanto-hero"
        className="relative w-full min-h-[90vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${config.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle cinematic gradient overlay: ensures text readability while preserving the turquoise river, minarets & stone houses */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#060911] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-2xl mb-6 animate-fadeIn">
            <span>✦</span>
            <span>A Personal Journey Through Mostar</span>
            <span>✦</span>
          </div>

          {/* Large Title: SHANTO */}
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)] mb-3 uppercase">
            {config.pageTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl font-light text-amber-100 tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mb-8 max-w-2xl">
            {config.pageSubtitle}
          </p>

          {/* Information Text Box */}
          <div className="relative w-full max-w-3xl bg-slate-950/75 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-left sm:text-center mb-10 transition-all hover:border-amber-400/50">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-300 mb-3 tracking-wide">
              {config.heroInfoHeading}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
              {config.heroInfoText}
            </p>
          </div>

          {/* Interactive Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
            {/* Button 1: EXPLORE GALLERY */}
            <button
              onClick={() => {
                if (onOpenGlobalGallery) {
                  onOpenGlobalGallery();
                } else {
                  scrollToAnchor("shanto-gallery");
                }
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🖼️</span>
              <span>{config.exploreGalleryBtnText}</span>
            </button>

            {/* Button 2: WATCH VIDEOS */}
            <button
              onClick={() => {
                if (onOpenGlobalVideos) {
                  onOpenGlobalVideos();
                } else {
                  scrollToAnchor("shanto-videos");
                }
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl border border-slate-700 hover:border-amber-400/70 shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>▶</span>
              <span>{config.watchVideosBtnText}</span>
            </button>
          </div>
        </div>

        {/* Scroll down indicator */}
        <button
          onClick={() => scrollToAnchor("shanto-about")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 hover:text-amber-300 transition flex flex-col items-center gap-1 text-xs font-mono tracking-widest uppercase cursor-pointer"
        >
          <span>Scroll</span>
          <span className="animate-bounce text-sm">↓</span>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 2. INFORMATION SECTION BELOW HERO (About Shanto)                          */}
      {/* ========================================================================= */}
      <section id="shanto-about" className="relative py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080d1a]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Personal Introduction
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-1">
                {config.aboutHeading}
              </h2>
            </div>
            <button
              onClick={() => {
                setAboutDraft(config.aboutText);
                setIsInlineEditingAbout(!isInlineEditingAbout);
              }}
              className="self-start md:self-auto px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>{isInlineEditingAbout ? "Cancel Edit" : "Edit Text"}</span>
            </button>
          </div>

          {/* Editable Content Block */}
          {isInlineEditingAbout ? (
            <div className="p-6 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-xl space-y-4">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Edit About Shanto Text
              </label>
              <textarea
                rows={6}
                value={aboutDraft}
                onChange={(e) => setAboutDraft(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 text-base leading-relaxed focus:outline-none focus:border-amber-400 font-sans"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsInlineEditingAbout(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAboutDraft}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="relative p-8 sm:p-10 bg-slate-950/60 border border-slate-800/80 rounded-3xl backdrop-blur-md shadow-2xl">
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light whitespace-pre-line">
                {config.aboutText}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Verified Creator Profile • Mostar Expedition Lead</span>
                </div>
                <div className="font-mono text-amber-400/80">
                  Old Town • Neretva Valley • Stari Most
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MY FAVORITE PLACES: Places I Love                                      */}
      {/* ========================================================================= */}
      <section id="shanto-places" className="py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#060911]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Curated Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-1 mb-4">
              Places I Love
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Four timeless landmarks that define the spirit, charm, and architectural marvel of Mostar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.places.map((place) => (
              <div
                key={place.id}
                className="group relative bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 right-3 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                    Featured
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {place.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-light">
                      {place.shortDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedPlace(place)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-bold tracking-wider uppercase rounded-xl border border-amber-500/30 hover:border-amber-500 transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>EXPLORE</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MY GALLERY (Preview Section)                                           */}
      {/* ========================================================================= */}
      <section id="shanto-gallery" className="py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080d1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Cloud Photo Vault
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-1">
                My Gallery
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
                High-resolution cloud captures capturing light, textures, and landscapes across Mostar.
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenGlobalGallery) {
                  onOpenGlobalGallery();
                } else if (photosList.length > 0) {
                  setSelectedPhoto(photosList[0]);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <span>VIEW ALL PHOTOS</span>
              <span>↗</span>
            </button>
          </div>

          {/* Photo Grid Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photosList.slice(0, 6).map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 hover:border-amber-400/60 shadow-lg hover:shadow-2xl transition duration-300"
              >
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-amber-300 px-2 py-0.5 rounded-full backdrop-blur-md border border-amber-500/30">
                    {photo.resolution || "4K"}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-1 font-light mt-0.5">
                    {photo.location || "Mostar, Bosnia and Herzegovina"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MY VIDEOS (Preview Section)                                            */}
      {/* ========================================================================= */}
      <section id="shanto-videos" className="py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#060911]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Cinematic Aerials &amp; Motion
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-1">
                My Videos
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
                Stream 4K cinematic video flights, drone sweeps, and old town time-lapses directly from cloud storage.
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenGlobalVideos) {
                  onOpenGlobalVideos();
                } else if (videosList.length > 0) {
                  setSelectedVideo(videosList[0]);
                }
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-slate-700 hover:border-amber-400/60 shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>WATCH ALL VIDEOS</span>
              <span>▶</span>
            </button>
          </div>

          {/* Video Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosList.slice(0, 3).map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 hover:border-amber-400/60 shadow-xl transition duration-300 flex flex-col justify-end p-6"
              >
                <img
                  src={video.thumbnailUrl || video.url}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Play Button Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-500/90 group-hover:bg-amber-400 text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition duration-300">
                  <span className="text-xl ml-1">▶</span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                      {video.resolution || "4K UHD"}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {video.duration || "0:45"}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-light">
                    {video.description || "Cinematic aerial video captured along the Neretva river corridor."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MY NOTES                                                               */}
      {/* ========================================================================= */}
      <section id="shanto-notes" className="py-24 px-6 lg:px-12 border-b border-slate-800/80 bg-[#080d1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Personal Travel Journal
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-1">
                My Notes
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
                Reflections, stories, sensory details, and memories written during expeditions through Mostar.
              </p>
            </div>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2"
            >
              <span>+ Add / Edit Notes</span>
            </button>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.notes.map((note) => (
              <article
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="group bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer"
              >
                {note.image && (
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={note.image}
                      alt={note.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                      {note.category}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-2">{note.date}</div>
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors mb-3">
                      {note.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4 font-light">
                      {note.text}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>Read Full Note</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="py-16 px-6 lg:px-12 bg-[#04060b] text-center text-slate-500 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-white tracking-widest uppercase">
              {config.pageTitle}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400/80 font-mono">Mostar Expedition Archive</span>
          </div>

          <p className="text-slate-400 max-w-lg leading-relaxed text-xs">
            A celebration of Mostar's architectural heritage, natural topography, and living culture.
            Designed &amp; Developed by Shanto Khan.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-slate-400">
            <button onClick={onBackToHome} className="hover:text-amber-400 transition">
              Home Experience
            </button>
            <button onClick={() => scrollToAnchor("shanto-about")} className="hover:text-amber-400 transition">
              About
            </button>
            <button onClick={() => scrollToAnchor("shanto-places")} className="hover:text-amber-400 transition">
              Places I Love
            </button>
            <button onClick={() => scrollToAnchor("shanto-gallery")} className="hover:text-amber-400 transition">
              Gallery
            </button>
            <button onClick={() => scrollToAnchor("shanto-notes")} className="hover:text-amber-400 transition">
              Notes
            </button>
            <button onClick={() => setIsAdminOpen(true)} className="text-amber-400 hover:underline">
              Admin Manager
            </button>
          </div>

          <div className="pt-6 border-t border-slate-900 w-full text-[11px] text-slate-600">
            © {new Date().getFullYear()} Shanto Khan. All rights reserved. Cloud storage enabled.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}

      {/* Admin Content Manager Modal */}
      {isAdminOpen && (
        <ShantoPageAdminModal
          config={config}
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onSave={(newConfig) => setConfig(newConfig)}
        />
      )}

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
        >
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition"
            >
              ✕
            </button>
            <div className="relative h-64 sm:h-72">
              <img
                src={selectedPlace.image}
                alt={selectedPlace.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  {selectedPlace.location || "Mostar Landmark"}
                </span>
                <h3 className="text-3xl font-serif font-bold text-white mt-1">
                  {selectedPlace.title}
                </h3>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                {selectedPlace.details || selectedPlace.shortDescription}
              </p>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
        >
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition"
            >
              ✕
            </button>
            {selectedNote.image && (
              <div className="relative h-56 shrink-0">
                <img
                  src={selectedNote.image}
                  alt={selectedNote.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>
            )}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                <span>{selectedNote.category}</span>
                <span>{selectedNote.date}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {selectedNote.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line font-light">
                {selectedNote.text}
              </p>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow transition"
                >
                  Close Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Viewer */}
      {selectedPhoto && (
        <LightboxPhotoViewer
          item={selectedPhoto}
          itemsList={photosList}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={(newItem) => setSelectedPhoto(newItem)}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <ModernVideoPlayerModal
          item={selectedVideo}
          itemsList={videosList}
          onClose={() => setSelectedVideo(null)}
          onNavigate={(newVideo) => setSelectedVideo(newVideo)}
        />
      )}
    </div>
  );
};
