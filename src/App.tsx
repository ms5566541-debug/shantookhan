import React, { useEffect, useRef, useState } from "react";
import { TEAM_MEMBERS, TeamMember } from "./data/team";
import { MediaGallery } from "./components/MediaGallery";
import { ShantoKhanPage } from "./components/ShantoKhanPage";
import { ShantoPage } from "./components/ShantoPage";
import { playBazaarVoice } from "./utils/bazaarVoice";
import { playBridgeVoice } from "./utils/bridgeVoice";
import { playHomeVoice } from "./utils/homeVoice";
import { playAboutUsVoice } from "./utils/aboutUsVoice";
import { playTeamVoice } from "./utils/teamVoice";
import { playGalleryVoice } from "./utils/galleryVoice";
import {
  playSectionSound,
  stopCurrentSectionSound,
  unlockAndWarmUpAudio,
  setMuted,
  isMuted,
  SectionSoundId,
} from "./utils/sectionAudioManager";

type ThemeType = "dark" | "black" | "blue" | "white" | "emerald" | "purple";

const DEFAULT_AVATAR_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" fill="%231e293b"/><circle cx="80" cy="58" r="30" fill="%2364748b"/><path d="M24 144C24 113.072 49.072 88 80 88C110.928 88 136 113.072 136 144" fill="%2364748b"/></svg>`;

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("dark");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [activeMemberIdx, setActiveMemberIdx] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  const currentScrolledSectionRef = useRef<SectionSoundId>("home");
  const hasUserInteractedRef = useRef<boolean>(false);

  const [brandLogo, setBrandLogo] = useState<string>("");
  const [teamAvatars, setTeamAvatars] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("custom_team_avatars");
      const base: Record<string, string> = saved ? JSON.parse(saved) : {};
      TEAM_MEMBERS.forEach((m, idx) => {
        const savedAvatarKey = localStorage.getItem(`avatar${idx + 1}`);
        if (savedAvatarKey && !base[m.id]) {
          base[m.id] = savedAvatarKey;
        }
      });
      return base;
    } catch {
      return {};
    }
  });
  const [memberNames, setMemberNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("custom_member_names");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editingNameValue, setEditingNameValue] = useState<string>("");
  const [editingMemberForPhoto, setEditingMemberForPhoto] = useState<TeamMember | null>(null);
  const editingMemberForPhotoRef = useRef<TeamMember | null>(null);
  const selectedMemberRef = useRef<TeamMember | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Premium Navbar Animations & State
  const [activeNav, setActiveNav] = useState<string>("home");
  const [currentPage, setCurrentPage] = useState<"home" | "shanto">(() => {
    if (typeof window !== "undefined" && (window.location.hash === "#shanto-page" || window.location.hash === "#shanto")) {
      return "shanto";
    }
    return "home";
  });
  const [clickingNav, setClickingNav] = useState<string | null>(null);
  const [navRipples, setNavRipples] = useState<Record<string, Array<{ x: number; y: number; id: number }>>>({});
  const [pageTransitionActive, setPageTransitionActive] = useState<boolean>(false);
  const [transitionCounter, setTransitionCounter] = useState<number>(0);

  // Synchronize hash routing with standalone page state
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#shanto-page" || window.location.hash === "#shanto") {
        setCurrentPage("shanto");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (window.location.hash === "#home" || window.location.hash === "") {
        setCurrentPage("home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Helper to scroll smoothly to a specific section and play its synchronized sound
  const scrollToSectionById = (
    sectionId: SectionSoundId,
    shouldPlaySound: boolean = true
  ) => {
    unlockAndWarmUpAudio();
    const cinemaSection = document.querySelector(".cinema-scroll") as HTMLElement | null;
    const cinemaTop = cinemaSection ? window.scrollY + cinemaSection.getBoundingClientRect().top : 0;
    const teamEl = document.getElementById("team");
    const shantoEl = document.getElementById("shanto-khan");
    const galleryEl = document.getElementById("media-gallery");

    let targetY = 0;
    if (sectionId === "home") {
      targetY = 0;
    } else if (sectionId === "bridge") {
      targetY = cinemaTop + 1100;
    } else if (sectionId === "bazaar") {
      targetY = cinemaTop + 2150;
    } else if (sectionId === "about-us") {
      targetY = cinemaTop + 2750;
    } else if (sectionId === "shanto-khan") {
      if (shantoEl) {
        targetY = window.scrollY + shantoEl.getBoundingClientRect().top - 80;
      } else {
        targetY = cinemaTop + 3600;
      }
    } else if (sectionId === "media-gallery") {
      if (galleryEl) {
        targetY = window.scrollY + galleryEl.getBoundingClientRect().top - 80;
      } else {
        targetY = cinemaTop + 4400;
      }
    } else if (sectionId === "team") {
      if (teamEl) {
        targetY = window.scrollY + teamEl.getBoundingClientRect().top - 80;
      } else {
        targetY = 999999;
      }
    }

    currentScrolledSectionRef.current = sectionId;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    setActiveNav(sectionId);

    if (shouldPlaySound) {
      playSectionSound(sectionId, { force: true });
    }
  };

  const handleNavClickWithEffect = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    href: string
  ) => {
    e.preventDefault();

    // 1. Smooth ripple click effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now() + Math.random();

    setNavRipples((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), { x, y, id: rippleId }],
    }));

    setTimeout(() => {
      setNavRipples((prev) => ({
        ...prev,
        [targetId]: (prev[targetId] || []).filter((r) => r.id !== rippleId),
      }));
    }, 700);

    // 2. Soft glow pulse on click
    setClickingNav(targetId);
    setTimeout(() => {
      setClickingNav((curr) => (curr === targetId ? null : curr));
    }, 600);

    // 3. Glowing border active state
    setActiveNav(targetId);

    // 4. 0.6-second page transition (fade + slide-up)
    setTransitionCounter((c) => c + 1);
    setPageTransitionActive(true);
    setTimeout(() => {
      setPageTransitionActive(false);
    }, 650);

    // 5. Page navigation scroll and synchronized section sound
    scrollToSectionById(targetId as SectionSoundId, true);
  };

  // Keep selectedMemberRef in sync
  useEffect(() => {
    selectedMemberRef.current = selectedMember;
  }, [selectedMember]);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetMember =
      editingMemberForPhotoRef.current ||
      editingMemberForPhoto ||
      selectedMemberRef.current ||
      selectedMember ||
      TEAM_MEMBERS[0];

    if (!targetMember) return;
    const targetId = targetMember.id;
    const targetIndex = TEAM_MEMBERS.findIndex((m) => m.id === targetId);

    // Instant local preview via URL.createObjectURL for photo & animated GIF
    try {
      const objectUrl = URL.createObjectURL(file);
      const preview = document.getElementById("profilePreview") as HTMLImageElement | null;
      if (preview) {
        preview.src = objectUrl;
      }
    } catch {}

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      setPhotoPreviewUrl(dataUrl);
      // Instantly update teamAvatars state for instant live preview inside the 160x160px circular profile
      setTeamAvatars((prev) => {
        const updated = { ...prev, [targetId]: dataUrl };
        try {
          localStorage.setItem("custom_team_avatars", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (targetIndex !== -1) {
        try {
          localStorage.setItem(`avatar${targetIndex + 1}`, dataUrl);
        } catch {}
      }
      try {
        localStorage.setItem(`avatar_${targetId}`, dataUrl);
      } catch {}

      if (targetId === "shanto-khan") {
        try {
          localStorage.setItem("shanto_khan_avatar", dataUrl);
        } catch {}
      }
      if (targetId === "shammo-jr") {
        try {
          localStorage.setItem("shammo_jr_avatar", dataUrl);
        } catch {}
      }

      if (updateDOMAvatarsRef.current) {
        updateDOMAvatarsRef.current(targetId, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleConfirmPhotoSave = () => {
    const targetMember =
      editingMemberForPhotoRef.current ||
      editingMemberForPhoto ||
      selectedMemberRef.current ||
      selectedMember;
    if (targetMember && photoPreviewUrl) {
      const targetId = targetMember.id;
      setTeamAvatars((prev) => {
        const updated = { ...prev, [targetId]: photoPreviewUrl };
        try {
          localStorage.setItem("custom_team_avatars", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      if (targetId === "shanto-khan") {
        try {
          localStorage.setItem("shanto_khan_avatar", photoPreviewUrl);
        } catch {}
      }
      if (targetId === "shammo-jr") {
        try {
          localStorage.setItem("shammo_jr_avatar", photoPreviewUrl);
        } catch {}
      }
      if (updateDOMAvatarsRef.current) {
        updateDOMAvatarsRef.current(targetId, photoPreviewUrl);
      }
      setIsPhotoModalOpen(false);
      setPhotoPreviewUrl("");
    }
  };

  const openPhotoUploaderFor = (member: TeamMember) => {
    editingMemberForPhotoRef.current = member;
    setEditingMemberForPhoto(member);
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
      profilePhotoInputRef.current.click();
    }
  };

  const getMemberAvatar = (member: TeamMember, idx?: number): string | null => {
    if (teamAvatars[member.id] && teamAvatars[member.id].trim() !== "") {
      return teamAvatars[member.id];
    }
    const memberIndex = idx !== undefined ? idx : TEAM_MEMBERS.findIndex((m) => m.id === member.id);
    if (memberIndex !== -1) {
      const savedNum = localStorage.getItem(`avatar${memberIndex + 1}`);
      if (savedNum && savedNum.trim() !== "") return savedNum;
    }
    if (member.id === "shammo-jr") {
      const saved = localStorage.getItem("shammo_jr_avatar");
      if (saved && saved.trim() !== "") return saved;
    }
    if (member.id === "shanto-khan") {
      const saved = localStorage.getItem("shanto_khan_avatar");
      if (saved && saved.trim() !== "") return saved;
    }
    if (member.avatar && member.avatar.trim() !== "") {
      return member.avatar;
    }
    return null;
  };

  const getMemberName = (member: TeamMember): string => {
    if (memberNames[member.id] && memberNames[member.id].trim() !== "") {
      return memberNames[member.id];
    }
    if (member.id === "shammo-jr") {
      const saved = localStorage.getItem("shammo_jr_name");
      if (saved && saved.trim() !== "") return saved;
      return "SHAMMO JR";
    }
    return member.name;
  };

  const handleSaveMemberName = (memberId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setMemberNames((prev) => {
      const updated = { ...prev, [memberId]: trimmed };
      try {
        localStorage.setItem("custom_member_names", JSON.stringify(updated));
        if (memberId === "shammo-jr") {
          localStorage.setItem("shammo_jr_name", trimmed);
        }
      } catch {}
      return updated;
    });
    setIsEditingName(false);
  };

  const moveSliderRef = useRef<(dir: number) => void>(() => {});
  const jumpSliderRef = useRef<(idx: number) => void>(() => {});
  const updateDOMAvatarsRef = useRef<(targetMemberId?: string, newAvatarUrl?: string) => void>(() => {});

  useEffect(() => {
    document.body.className = currentTheme === "dark" ? "" : `theme-${currentTheme}`;
  }, [currentTheme]);

  useEffect(() => {
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;
    let sightCards: HTMLElement[] = [];
    let originalSightCount = TEAM_MEMBERS.length;
    let activeSight = TEAM_MEMBERS.length;
    let lastWheelTime = 0;

    const cinemaSection = document.querySelector(".cinema-scroll") as HTMLElement | null;
    const sightsControls = document.querySelector(".sights-controls") as HTMLElement | null;
    const sightsTrack = document.querySelector(".sights-track") as HTMLElement | null;
    const sightsSlider = document.querySelector(".sights-slider") as HTMLElement | null;
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function clamp(v: number, min = 0, max = 1): number {
      return Math.min(max, Math.max(min, v));
    }

    function smoothstep(e0: number, e1: number, v: number): number {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    }

    function lerp(a: number, b: number, t: number): number {
      return a + (b - a) * t;
    }

    function segmentInOut(s: number, a: number, b: number, c: number, d: number) {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    }

    function getScrollDistance(): number {
      if (!cinemaSection) return 0;
      return clamp(-cinemaSection.getBoundingClientRect().top, 0, cinemaSection.offsetHeight - window.innerHeight);
    }

    function updateSightSlider() {
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (!track || !sightCards.length) return;
      const cardWidth = sightCards[0].offsetWidth;
      const gap = parseFloat(window.getComputedStyle(track).columnGap || "0");
      const shift = -(cardWidth + gap) * activeSight;
      root.style.setProperty("--sights-shift", `${shift.toFixed(4)}px`);

      sightCards.forEach((card) => {
        const idx = Number(card.dataset.sightIndex);
        card.classList.toggle("is-active", idx === activeSight);
      });

      const normalizedIdx = ((activeSight % originalSightCount) + originalSightCount) % originalSightCount;
      setActiveMemberIdx(normalizedIdx);
    }

    function moveSightSlider(dir: number) {
      activeSight += dir;
      updateSightSlider();
    }

    function jumpToOriginalIndex(origIdx: number) {
      activeSight = originalSightCount + origIdx;
      updateSightSlider();
    }

    moveSliderRef.current = moveSightSlider;
    jumpSliderRef.current = jumpToOriginalIndex;
    updateDOMAvatarsRef.current = updateCardAvatarsInDOM;

    function selectSightCard(card: HTMLElement) {
      const idx = Number(card.dataset.sightIndex);
      if (Number.isFinite(idx)) {
        activeSight = idx;
        updateSightSlider();
      }
      const memberId = card.dataset.memberId;
      if (memberId) {
        const found = TEAM_MEMBERS.find((m) => m.id === memberId);
        if (found) {
          setSelectedMember(found);
        }
      }
    }

    function jumpSightSlider(i: number) {
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (!track) return;
      track.classList.add("is-jumping");
      activeSight = i;
      updateSightSlider();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.classList.remove("is-jumping");
        });
      });
    }

    function normalizeSightSlider() {
      if (activeSight >= originalSightCount * 2) {
        jumpSightSlider(activeSight - originalSightCount);
      } else if (activeSight < originalSightCount) {
        jumpSightSlider(activeSight + originalSightCount);
      }
    }

    function updateCardAvatarsInDOM(targetMemberId?: string, newAvatarUrl?: string) {
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (!track) return;
      const cards = track.querySelectorAll(".sight-card");
      cards.forEach((card) => {
        const mId = (card as HTMLElement).dataset.memberId;
        if (!mId) return;
        if (targetMemberId && mId !== targetMemberId) return;
        const member = TEAM_MEMBERS.find((m) => m.id === mId);
        if (!member) return;
        const container = card.querySelector(".team-avatar-container");
        if (!container) return;
        const memberIdx = TEAM_MEMBERS.findIndex((m) => m.id === mId);
        const avatarSrc = (targetMemberId && mId === targetMemberId && newAvatarUrl) 
          ? newAvatarUrl 
          : getMemberAvatar(member, memberIdx);
        
        const existingBadge = container.querySelector(".team-avatar-badge, .avatar");
        const placeholder = container.querySelector(".placeholder") as HTMLElement | null;

        if (avatarSrc) {
          if (existingBadge && existingBadge.tagName === "IMG") {
            (existingBadge as HTMLImageElement).src = avatarSrc;
            (existingBadge as HTMLImageElement).style.display = "block";
          } else {
            const newImg = document.createElement("img");
            newImg.className = "avatar team-avatar-badge";
            newImg.src = avatarSrc;
            newImg.alt = getMemberName(member);
            if (existingBadge) {
              container.replaceChild(newImg, existingBadge);
            } else {
              container.insertBefore(newImg, container.firstChild);
            }
          }
          if (placeholder) {
            placeholder.style.display = "none";
          }
        }
      });
    }

    function setupSightSlider() {
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (!track) return;
      const originalCards = Array.from(track.querySelectorAll(".sight-card")) as HTMLElement[];
      if (originalCards.length === 0) return;
      originalSightCount = originalCards.length;
      track.replaceChildren();

      for (let setIndex = 0; setIndex < 3; setIndex++) {
        originalCards.forEach((card, cardIndex) => {
          const clone = card.cloneNode(true) as HTMLElement;
          clone.dataset.sightIndex = String(setIndex * originalSightCount + cardIndex);
          clone.dataset.memberId = card.dataset.memberId;
          track.appendChild(clone);
        });
      }

      sightCards = Array.from(track.querySelectorAll(".sight-card")) as HTMLElement[];
      activeSight = originalSightCount;

      track.addEventListener("transitionend", normalizeSightSlider);
      updateSightSlider();
    }

    // Direct Drag and Swipe Support
    let isDragging = false;
    let startX = 0;
    let currentDragDelta = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Do not initiate drag if user clicks directly on upload icon, button, or interactive element
      if ((e.target as HTMLElement).closest(".team-avatar-quick-upload, button, input, a, .team-action-hint")) {
        return;
      }
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (!track) return;
      if ((e.target as HTMLElement).closest(".sight-card, .sights-track")) {
        isDragging = true;
        startX = e.clientX;
        currentDragDelta = 0;
        track.classList.add("is-dragging");
      }
    };

    const handlePointerMoveTrack = (e: PointerEvent) => {
      if (!isDragging) return;
      currentDragDelta = e.clientX - startX;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const track = document.querySelector(".sights-track") as HTMLElement | null;
      if (track) {
        track.classList.remove("is-dragging");
      }
      if (Math.abs(currentDragDelta) > 35) {
        if (currentDragDelta < 0) {
          moveSightSlider(1);
        } else {
          moveSightSlider(-1);
        }
      }
    };

    // Direct Mouse Wheel on Slider
    const handleSliderWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 240) return; // Smooth debounce

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 12) {
        lastWheelTime = now;
        if (delta > 0) {
          moveSightSlider(1);
        } else {
          moveSightSlider(-1);
        }
      }
    };

    // Keyboard Arrow Keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        moveSightSlider(1);
      } else if (e.key === "ArrowLeft") {
        moveSightSlider(-1);
      }
    };

    // Delegated click and keydown handler on sights-track for cloned cards & upload buttons
    const handleTrackClick = (e: MouseEvent) => {
      // Check if clicked the photo upload button
      const uploadBtn = (e.target as HTMLElement).closest(".team-avatar-quick-upload");
      if (uploadBtn) {
        e.stopPropagation();
        e.preventDefault();
        const card = (e.target as HTMLElement).closest(".sight-card") as HTMLElement | null;
        const memberId = card?.dataset.memberId;
        if (memberId) {
          const found = TEAM_MEMBERS.find((m) => m.id === memberId);
          if (found) {
            openPhotoUploaderFor(found);
          }
        }
        return;
      }

      // Check if clicked a sight card
      const card = (e.target as HTMLElement).closest(".sight-card") as HTMLElement | null;
      if (card) {
        selectSightCard(card);
      }
    };

    const handleTrackKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const uploadBtn = (e.target as HTMLElement).closest(".team-avatar-quick-upload");
        if (uploadBtn) {
          e.stopPropagation();
          e.preventDefault();
          const card = (e.target as HTMLElement).closest(".sight-card") as HTMLElement | null;
          const memberId = card?.dataset.memberId;
          if (memberId) {
            const found = TEAM_MEMBERS.find((m) => m.id === memberId);
            if (found) {
              openPhotoUploaderFor(found);
            }
          }
          return;
        }

        const card = (e.target as HTMLElement).closest(".sight-card") as HTMLElement | null;
        if (card) {
          e.preventDefault();
          selectSightCard(card);
        }
      }
    };

    if (sightsSlider) {
      sightsSlider.addEventListener("wheel", handleSliderWheel, { passive: true });
    }
    if (sightsTrack) {
      sightsTrack.addEventListener("click", handleTrackClick);
      sightsTrack.addEventListener("keydown", handleTrackKeyDown);
      sightsTrack.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMoveTrack);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }
    window.addEventListener("keydown", handleKeyDown);

    function update() {
      rafPending = false;

      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 2700);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop = Math.max(130, Math.min(260, window.innerHeight * 0.22));
      const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

      const mxVal = reduceMotion.matches ? "0" : mouseX.toFixed(4);
      const myVal = reduceMotion.matches ? "0" : mouseY.toFixed(4);

      root.style.setProperty("--mx", mxVal);
      root.style.setProperty("--my", myVal);

      root.style.setProperty("--back-opacity", (1 - frame2.active * 0.06).toFixed(4));
      root.style.setProperty("--back-x", `${(mouseX * -12).toFixed(4)}px`);
      root.style.setProperty("--back-y", `${(mouseY * -4).toFixed(4)}px`);
      root.style.setProperty("--back-scale", backScale.toFixed(4));
      root.style.setProperty("--four-y", `${(10 + progress * 10).toFixed(4)}vh`);
      root.style.setProperty("--four-scale", (0.78 + progress * 0.16).toFixed(4));
      root.style.setProperty("--bazaar-y", `${(20 - progress * 8).toFixed(4)}vh`);
      root.style.setProperty("--blur-px", "0px");
      root.style.setProperty("--back-brightness", "1");
      root.style.setProperty("--bazaar-blur-px", "0px");
      root.style.setProperty("--bazaar-brightness", "1");
      root.style.setProperty("--bazaar-saturation", "1.05");
      root.style.setProperty("--shade-opacity", "0");
      root.style.setProperty("--shade-z", "-1");
      root.style.setProperty("--shade-top-alpha", "0");
      root.style.setProperty("--shade-mid-alpha", "0");
      root.style.setProperty("--shade-bottom-alpha", "0");

      root.style.setProperty("--title-y", `${(introExit * -210).toFixed(4)}px`);
      root.style.setProperty("--title-scale", (1 - introExit * 0.08).toFixed(4));
      root.style.setProperty("--title-opacity", (1 - introExit).toFixed(4));

      root.style.setProperty("--bridge-x", `calc(-50% + ${(mouseX * 18).toFixed(4)}px)`);
      root.style.setProperty("--bridge-y", `${(mouseY * 8 + sharedHeroY - frame2.exit * 760).toFixed(4)}px`);
      root.style.setProperty("--bridge-bottom", `${(5 - frame2.enter * 13).toFixed(4)}vh`);
      root.style.setProperty("--bridge-width", `${(67.2 + frame2.enter * 37.8).toFixed(4)}vw`);
      root.style.setProperty("--bridge-scale", (1.02 + sharedHeroScale + frame2.exit * 0.46).toFixed(4));

      root.style.setProperty("--split-left-x", `calc(-50% + ${(-splitDrift * 46).toFixed(4)}vw + ${(mouseX * 22).toFixed(4)}px)`);
      root.style.setProperty("--split-left-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(4)}px`);
      root.style.setProperty("--split-left-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));
      root.style.setProperty("--split-right-x", `calc(-50% + ${(splitDrift * 46).toFixed(4)}vw + ${(mouseX * 22).toFixed(4)}px)`);
      root.style.setProperty("--split-right-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(4)}px`);
      root.style.setProperty("--split-right-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));

      root.style.setProperty("--frame2-opacity", frame2Opacity.toFixed(4));
      root.style.setProperty("--frame2-x", `calc(-50% + ${(mouseX * 10).toFixed(4)}px)`);
      root.style.setProperty("--frame2-y", `calc(-50% + ${(mouseY * 8 - frame2.exit * 150).toFixed(4)}px)`);
      root.style.setProperty("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

      root.style.setProperty("--intro-copy-y", `${(introExit * 90).toFixed(4)}px`);
      root.style.setProperty("--intro-copy-opacity", (1 - introExit).toFixed(4));
      root.style.setProperty("--panel2-opacity", panel2Opacity.toFixed(4));
      root.style.setProperty("--panel2-y", `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(4)}px)`);
      root.style.setProperty("--panel3-opacity", panel3Opacity.toFixed(4));
      root.style.setProperty("--panel3-y", `calc(-50% + ${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(4)}px)`);

      root.style.setProperty("--sights-opacity", sightsEnter.toFixed(4));
      root.style.setProperty("--sights-controls-opacity", sightsControlsEnter.toFixed(4));
      if (sightsControls) {
        sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
      }
      root.style.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
      root.style.setProperty("--sights-y", "0px");
      root.style.setProperty("--sights-enter-x", `${((1 - sightsEnter) * 420).toFixed(4)}vw`);
      root.style.setProperty("--sights-scale", (1 / backScale).toFixed(4));
      root.style.setProperty("--sights-top", `${sightsParentTop.toFixed(4)}px`);
      root.style.setProperty("--sights-screen-top", `${sightsScreenTop.toFixed(4)}px`);

      if (
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001
      ) {
        requestTick();
      }
    }

    function requestTick() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    }

    const handleScroll = () => {
      requestTick();
      // Synchronize active navbar button state and play section sound on manual scroll (PC & Phone)
      const currentScroll = window.scrollY;
      const cinemaTop = cinemaSection ? window.scrollY + cinemaSection.getBoundingClientRect().top : 0;
      const shantoEl = document.getElementById("shanto-khan");
      const shantoTop = shantoEl ? window.scrollY + shantoEl.getBoundingClientRect().top - 200 : 999999;
      const galleryEl = document.getElementById("media-gallery");
      const galleryTop = galleryEl ? window.scrollY + galleryEl.getBoundingClientRect().top - 200 : 999999;
      const teamEl = document.getElementById("team");
      const teamTop = teamEl ? window.scrollY + teamEl.getBoundingClientRect().top - 200 : 999999;

      let detectedSection: SectionSoundId = "home";
      if (currentScroll >= teamTop) {
        detectedSection = "team";
      } else if (currentScroll >= galleryTop) {
        detectedSection = "media-gallery";
      } else if (currentScroll >= shantoTop) {
        detectedSection = "shanto-khan";
      } else if (currentScroll >= cinemaTop + 2500) {
        detectedSection = "about-us";
      } else if (currentScroll >= cinemaTop + 1600) {
        detectedSection = "bazaar";
      } else if (currentScroll >= cinemaTop + 600) {
        detectedSection = "bridge";
      } else {
        detectedSection = "home";
      }

      setActiveNav(detectedSection);

      if (currentScrolledSectionRef.current !== detectedSection) {
        currentScrolledSectionRef.current = detectedSection;
        playSectionSound(detectedSection, { force: false });
      }
    };
    const handleResize = () => {
      updateSightSlider();
      requestTick();
    };
    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    setupSightSlider();
    requestTick();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointermove", handlePointerMoveTrack);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      if (sightsSlider) {
        sightsSlider.removeEventListener("wheel", handleSliderWheel);
      }
      if (sightsTrack) {
        sightsTrack.removeEventListener("click", handleTrackClick);
        sightsTrack.removeEventListener("keydown", handleTrackKeyDown);
        sightsTrack.removeEventListener("pointerdown", handlePointerDown);
      }
    };
  }, []);

  // Team Member Slider Auto-Play Loop (when auto-play is activated)
  useEffect(() => {
    if (!isAutoPlay || selectedMember !== null || isPhotoModalOpen) return;
    const interval = setInterval(() => {
      if (moveSliderRef.current) {
        moveSliderRef.current(1);
      }
    }, 3200);
    return () => clearInterval(interval);
  }, [isAutoPlay, selectedMember, isPhotoModalOpen]);

  if (currentPage === "shanto") {
    return (
      <ShantoPage
        onBackToHome={() => {
          window.location.hash = "#home";
          setCurrentPage("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenGlobalGallery={() => {
          window.location.hash = "#media-gallery";
          setCurrentPage("home");
          setTimeout(() => scrollToSectionById("media-gallery", true), 100);
        }}
        onOpenGlobalVideos={() => {
          window.location.hash = "#media-gallery";
          setCurrentPage("home");
          setTimeout(() => scrollToSectionById("media-gallery", true), 100);
        }}
      />
    );
  }

  return (
    <main className="site-shell">
      {/* Luminous Top Progress Sweep for Premium Page Transitions */}
      {pageTransitionActive && (
        <div key={transitionCounter} className="nav-transition-sweep-bar" aria-hidden="true" />
      )}

      {/* Global File Input for Profile Photo Upload */}
      <input
        type="file"
        ref={profilePhotoInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleProfilePhotoSelect}
      />

      {/* CINEMATIC PARALLAX SECTION: HOME, BRIDGE, BAZAAR, ABOUT US, MEET TEAM */}
      <section className="cinema-scroll" id="home" aria-label="Mostar cinematic scroll story">
        <div className={`stage ${pageTransitionActive ? "page-transition-enter" : ""}`}>
          <div className="world">
            <img
              className="scene-img sky-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png"
              alt=""
            />
            <header className="site-header" aria-label="Primary navigation">
              <div className="site-logo-wrap">
                <button
                  className="site-logo-badge shanto-avatar-badge"
                  onClick={() => openPhotoUploaderFor(TEAM_MEMBERS[0])}
                  title="Shanto Khan - ছবি আপলোড / পরিবর্তন করতে ক্লিক করুন (Click to upload/change photo)"
                  aria-label="Upload Shanto Khan photo"
                >
                  {getMemberAvatar(TEAM_MEMBERS[0]) ? (
                    <img
                      src={getMemberAvatar(TEAM_MEMBERS[0])!}
                      alt="Shanto Khan"
                      className="site-logo-img"
                    />
                  ) : (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#c5a059",
                        background: "rgba(197, 160, 89, 0.15)",
                        borderRadius: "50%",
                      }}
                    >
                      SK
                    </span>
                  )}
                  <span className="shanto-photo-edit-hint" title="Change Photo">📷</span>
                </button>
                <a
                  className="site-logo"
                  href="#home"
                  onClick={(e) => handleNavClickWithEffect(e, "home", "#home")}
                  title="Designed & Developed by Shanto Khan"
                >
                  <span className="logo-word-1">Designed</span>{" "}
                  <span className="logo-word-and">&amp;</span>{" "}
                  <span className="logo-word-2">Developed</span>{" "}
                  <span className="logo-word-by">by</span>{" "}
                  <span className="logo-word-3">Shanto</span>{" "}
                  <span className="logo-word-4">Khan</span>
                </a>
              </div>
              <nav className="site-nav" aria-label="Main menu">
                {/* 1. Home Page Button */}
                <a
                  id="nav-home"
                  href="#home"
                  className={`nav-pill-home ${activeNav === "home" ? "is-active" : ""} ${clickingNav === "home" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "home", "#home")}
                >
                  {navRipples["home"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>Home Page</span>
                </a>

                {/* 2. Bridge Button */}
                <a
                  id="nav-bridge"
                  href="#bridge"
                  className={`nav-pill-bridge ${activeNav === "bridge" ? "is-active" : ""} ${clickingNav === "bridge" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "bridge", "#bridge")}
                >
                  {navRipples["bridge"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>Bridge</span>
                </a>

                {/* 3. Bazaar Button */}
                <a
                  id="nav-bazaar"
                  href="#bazaar"
                  className={`nav-pill-bazaar ${activeNav === "bazaar" ? "is-active" : ""} ${clickingNav === "bazaar" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "bazaar", "#bazaar")}
                >
                  {navRipples["bazaar"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>Bazaar</span>
                </a>

                {/* 4. Meet Team Button */}
                <a
                  id="nav-team"
                  href="#team"
                  className={`nav-pill-team ${activeNav === "team" ? "is-active" : ""} ${clickingNav === "team" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "team", "#team")}
                >
                  {navRipples["team"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>Meet Team</span>
                </a>

                {/* 5. About Us Button */}
                <a
                  id="nav-about-us"
                  href="#about-us"
                  className={`nav-pill-about ${activeNav === "about-us" ? "is-active" : ""} ${clickingNav === "about-us" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "about-us", "#about-us")}
                >
                  {navRipples["about-us"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>About Us</span>
                </a>

                {/* 6. Shanto Khan Dedicated Page Button */}
                <a
                  id="nav-shanto-khan"
                  href="#shanto-khan"
                  className={`nav-pill-shanto ${activeNav === "shanto-khan" ? "is-active" : ""} ${clickingNav === "shanto-khan" ? "nav-pulse-click" : ""}`}
                  onClick={(e) => handleNavClickWithEffect(e, "shanto-khan", "#shanto-khan")}
                >
                  {navRipples["shanto-khan"]?.map((r) => (
                    <span
                      key={r.id}
                      className="nav-ripple-wave"
                      style={{ left: `${r.x}px`, top: `${r.y}px` }}
                    />
                  ))}
                  <span>⭐ Shanto Khan</span>
                </a>

                {/* 7. Standalone Shanto Journey Page */}
                <a
                  id="nav-shanto-standalone"
                  href="#shanto-page"
                  className={`nav-pill-shanto-page ${currentPage === "shanto" ? "is-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = "#shanto-page";
                    setCurrentPage("shanto");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    color: "#fbbf24",
                    fontWeight: 700,
                  }}
                  title="Open Standalone Shanto Journey Page"
                >
                  <span>✨ Shanto Page</span>
                </a>
              </nav>
              <div className="header-right-spacer" aria-hidden="true" />
            </header>
            <div className="back-stack">
              <img
                className="scene-img back-img back-bazaar"
                src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png"
                alt=""
              />
            </div>
            <h1 className="hero-title">SHANTO</h1>
            <img
              className="scene-img splitframe-img splitframe-left"
              src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png"
              alt=""
            />
            <img
              className="scene-img splitframe-img splitframe-right"
              src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png"
              alt=""
            />
            <img
              className="scene-img bridge-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png"
              alt="Mostar Bridge"
            />
          </div>
          <section className="intro-copy" id="about-us" aria-label="Personal website overview">
            <p className="intro-stylish-quote">
              <span className="intro-word-welcome">Welcome</span> to my <span className="intro-word-highlight">personal website</span>, where you can learn more <span className="intro-stylish-italic">about me</span>, my <span className="intro-word-gold">creative work</span>, and my <span className="intro-word-gold">journey</span>.
            </p>
            <div className="hero-tags" aria-label="Website highlights">
              <span>About Me</span>
              <span>My Work &amp; Portfolio</span>
              <span>My Journey</span>
            </div>
          </section>
          <section className="story-panel story-panel-bridge" id="bridge" aria-label="Old Bridge details">
            <h2
              onClick={() => playBridgeVoice()}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playBridgeVoice();
                }
              }}
              title="Click to play bridge voice recording"
            >
              The bridge is the city's compass.
            </h2>
            <p>
              Stari Most links the banks of the Neretva and anchors a historic quarter shaped by Ottoman,
              Mediterranean, and European layers.
            </p>
            <dl className="facts">
              <div>
                <dt>1566</dt>
                <dd>Original bridge completed</dd>
              </div>
              <div>
                <dt>2005</dt>
                <dd>Old Bridge Area inscribed by UNESCO</dd>
              </div>
            </dl>
          </section>
          <section className="story-panel story-panel-bazaar" id="bazaar" aria-label="Old town details">
            <h2
              onClick={() => playBazaarVoice()}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playBazaarVoice();
                }
              }}
              title="Click to play bazaar voice recording"
            >
              The bazaar keeps Mostar close.
            </h2>
            <p>
              Stone lanes, mosque courtyards, copper stalls, and riverside coffee stay within a short walk of Stari Most.
            </p>
            <button className="note-button" onClick={() => setShowInstructions(true)}>
              <span aria-hidden="true">↗</span>
              <span>Open old town notes</span>
            </button>
          </section>

          {/* Original Meet the Team Section inside Content Grid */}
          <section className="sights-panel" id="team" aria-label="Team member carousel">
            <div className="sights-scroll-container">
              <div
                className="sights-track"
                style={{
                  transform: `translateX(-${activeMemberIdx * 340}px)`,
                }}
              >
                {TEAM_MEMBERS.map((member, idx) => {
                  const displayAvatar = getMemberAvatar(member, idx);
                  const displayName = getMemberName(member);
                  const uploadId = `upload${idx + 1}`;
                  const avatarId = `avatar${idx + 1}`;
                  const isSelected = idx === activeMemberIdx;
                  return (
                    <article
                      key={member.id}
                      className={`sight-card ${member.colorClass} ${isSelected ? "is-active" : ""}`}
                      data-member-id={member.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        setActiveMemberIdx(idx);
                        setSelectedMember(member);
                      }}
                      aria-label={`Open ${displayName} professional profile`}
                    >
                      <div className="card-header-row">
                        <div>
                          <span className="sight-kicker">{member.kicker}</span>
                        </div>
                        <div className="team-avatar-container">
                          <img
                            id={avatarId}
                            className="avatar team-avatar-badge"
                            src={displayAvatar || `team${idx + 1}.jpg`}
                            alt={displayName}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!displayAvatar) {
                                target.style.display = "none";
                                const placeholder = document.getElementById(`avatar-placeholder-${member.id}`);
                                if (placeholder) placeholder.style.display = "flex";
                              }
                            }}
                          />
                          <div
                            id={`avatar-placeholder-${member.id}`}
                            className="team-avatar-badge placeholder"
                            style={{
                              width: "46px",
                              height: "46px",
                              borderRadius: "50%",
                              background: `${member.themeColor}22`,
                              border: `1.5px solid ${member.themeColor}88`,
                              display: displayAvatar ? "none" : "none",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: member.themeColor,
                            }}
                          >
                            {displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <input
                            id={uploadId}
                            type="file"
                            accept="image/*,image/gif"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const avatarEl = document.getElementById(avatarId) as HTMLImageElement | null;
                                if (avatarEl) {
                                  avatarEl.src = result;
                                  avatarEl.style.display = "block";
                                }
                                const placeholder = document.getElementById(`avatar-placeholder-${member.id}`);
                                if (placeholder) placeholder.style.display = "none";

                                localStorage.setItem(avatarId, result);
                                localStorage.setItem(`avatar_${member.id}`, result);
                                if (member.id === "shammo-jr") {
                                  localStorage.setItem("shammo_jr_avatar", result);
                                }
                                if (member.id === "shanto-khan") {
                                  localStorage.setItem("shanto_khan_avatar", result);
                                }
                                setTeamAvatars((prev) => {
                                  const updated = { ...prev, [member.id]: result };
                                  try {
                                    localStorage.setItem("custom_team_avatars", JSON.stringify(updated));
                                  } catch {}
                                  return updated;
                                });
                                if (updateDOMAvatarsRef.current) {
                                  updateDOMAvatarsRef.current(member.id, result);
                                }
                              };
                              reader.readAsDataURL(file);
                              e.target.value = "";
                            }}
                          />
                          <button
                            className="team-avatar-quick-upload"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPhotoUploaderFor(member);
                            }}
                            title={`${displayName} - Upload Photo`}
                            aria-label={`Upload photo for ${displayName}`}
                          >
                            📷
                          </button>
                        </div>
                      </div>
                      <h3>{displayName}</h3>
                      <span className="team-role-tag">{member.role}</span>
                      <p>{member.bio}</p>
                      <div className="team-skills-chips">
                        {member.skills.slice(0, 3).map((skill, sIdx) => (
                          <span key={sIdx}>{skill}</span>
                        ))}
                      </div>
                      <div
                        className="team-action-hint"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMemberIdx(idx);
                          setSelectedMember(member);
                        }}
                      >
                        <span>Click for Full Bio & Experience</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="sights-controls is-ready" aria-label="Team slider navigation controls">
              <div className="sights-button-group">
                <button
                  className="sight-nav sight-prev"
                  onClick={() => {
                    setActiveMemberIdx((prev) => (prev > 0 ? prev - 1 : TEAM_MEMBERS.length - 1));
                  }}
                  aria-label="Previous team member"
                >
                  ←
                </button>
                <button
                  className="sight-nav sight-next"
                  onClick={() => {
                    setActiveMemberIdx((prev) => (prev < TEAM_MEMBERS.length - 1 ? prev + 1 : 0));
                  }}
                  aria-label="Next team member"
                >
                  →
                </button>
              </div>
              <div className="team-pagination-dots" aria-label="Quick jump to team member">
                {TEAM_MEMBERS.map((m, idx) => (
                  <button
                    key={m.id}
                    className={`team-page-dot ${idx === activeMemberIdx ? "is-active" : ""}`}
                    onClick={() => setActiveMemberIdx(idx)}
                    title={`Jump to ${getMemberName(m)}`}
                    aria-label={`Jump to ${getMemberName(m)}`}
                    style={idx === activeMemberIdx ? { background: m.themeColor, transform: "scale(1.4)" } : {}}
                  />
                ))}
              </div>
              <div className="team-status-badge">
                <span className="count-pill">{activeMemberIdx + 1} / {TEAM_MEMBERS.length}</span>
                <span style={{ fontWeight: 700, color: TEAM_MEMBERS[activeMemberIdx]?.themeColor || "#fff" }}>
                  {TEAM_MEMBERS[activeMemberIdx] ? getMemberName(TEAM_MEMBERS[activeMemberIdx]) : ""}
                </span>
              </div>
              <button
                className={`auto-scroll-toggle ${isAutoPlay ? "is-active" : ""}`}
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                aria-label="Toggle Auto-Play Carousel"
                title="Toggle automatic rotation of team members cards"
              >
                <span>{isAutoPlay ? "⏸ Stop Auto-Play" : "▶ Auto-Play Carousel"}</span>
              </button>
            </div>
          </section>
        </div>
      </section>

      {/* Dedicated Shanto Khan Profile & Expedition Page */}
      <ShantoKhanPage
        shantoData={TEAM_MEMBERS.find((m) => m.id === "shanto-khan")}
        customAvatar={teamAvatars["shanto-khan"] || localStorage.getItem("shanto_khan_avatar") || undefined}
        customName={memberNames["shanto-khan"] || undefined}
        onUploadPhoto={() => {
          const shanto = TEAM_MEMBERS.find((m) => m.id === "shanto-khan") || TEAM_MEMBERS[0];
          openPhotoUploaderFor(shanto);
        }}
        onOpenGallery={() => {
          window.location.hash = "#shanto-page";
          setCurrentPage("shanto");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateSection={(sec) => scrollToSectionById(sec as any, true)}
      />

      {/* Selected Team Member Modal */}
      {selectedMember && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMember(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMember.name} Profile`}
        >
          <div
            className="modal-container"
            style={{
              borderColor: selectedMember.themeColor,
              boxShadow: `0 25px 70px rgba(0,0,0,0.9), 0 0 40px ${selectedMember.themeColor}33`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedMember(null)}
              aria-label="Close profile"
            >
              ✕
            </button>
            {/* Modal Header with 160x160px Profile Photo & Details */}
            <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "28px", flexWrap: "wrap" }}>
              <div className="profile-box">
                <img
                  id="profilePreview"
                  src={getMemberAvatar(selectedMember) || DEFAULT_AVATAR_PLACEHOLDER}
                  alt={selectedMember.name}
                  className="profile-img"
                  style={{
                    border: `3px solid ${selectedMember.themeColor}`,
                    boxShadow: `0 0 30px ${selectedMember.themeColor}44, 0 10px 25px rgba(0,0,0,0.7)`,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    editingMemberForPhotoRef.current = selectedMember;
                    setEditingMemberForPhoto(selectedMember);
                    const upload = document.getElementById("profileUpload") as HTMLInputElement | null;
                    if (upload) {
                      upload.value = "";
                      upload.click();
                    }
                  }}
                  title="Click to upload photo or animated GIF"
                />

                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*,image/gif"
                  hidden
                  onChange={handleProfilePhotoSelect}
                />
                <button
                  className="profile-upload-btn"
                  onClick={() => {
                    editingMemberForPhotoRef.current = selectedMember;
                    setEditingMemberForPhoto(selectedMember);
                    const upload = document.getElementById("profileUpload") as HTMLInputElement | null;
                    if (upload) {
                      upload.value = "";
                      upload.click();
                    }
                  }}
                  style={{
                    background: selectedMember.themeColor,
                    color: "#000000",
                    boxShadow: `0 4px 14px ${selectedMember.themeColor}44`,
                  }}
                >
                  📷 Upload Photo / GIF
                </button>
                {teamAvatars[selectedMember.id] && (
                  <button
                    onClick={() => {
                      const updated = { ...teamAvatars };
                      delete updated[selectedMember.id];
                      setTeamAvatars(updated);
                      try {
                        localStorage.setItem("custom_team_avatars", JSON.stringify(updated));
                        if (selectedMember.id === "shanto-khan") {
                          localStorage.removeItem("shanto_khan_avatar");
                        }
                        if (selectedMember.id === "shammo-jr") {
                          localStorage.removeItem("shammo_jr_avatar");
                        }
                      } catch {}
                      const preview = document.getElementById("profilePreview") as HTMLImageElement | null;
                      if (preview) {
                        preview.src = DEFAULT_AVATAR_PLACEHOLDER;
                      }
                      if (updateDOMAvatarsRef.current) {
                        updateDOMAvatarsRef.current(selectedMember.id, "");
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "11px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "2px 6px",
                    }}
                    title="Remove custom photo / GIF"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <div style={{ flex: "1 1 280px" }}>
                <span
                  style={{
                    color: selectedMember.themeColor,
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {selectedMember.kicker} • {selectedMember.category}
                </span>

                {isEditingName ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", margin: "6px 0 10px 0" }}>
                    <input
                      type="text"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveMemberName(selectedMember.id, editingNameValue);
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      autoFocus
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: `1px solid ${selectedMember.themeColor}`,
                        borderRadius: "8px",
                        color: "#ffffff",
                        padding: "6px 12px",
                        fontSize: "20px",
                        fontWeight: 800,
                        outline: "none",
                        width: "100%",
                        maxWidth: "280px",
                      }}
                      placeholder="Enter name..."
                    />
                    <button
                      onClick={() => handleSaveMemberName(selectedMember.id, editingNameValue)}
                      style={{
                        background: selectedMember.themeColor,
                        color: "#000000",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 6px 0" }}>
                    <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, color: "#ffffff", letterSpacing: "0.02em" }}>
                      {getMemberName(selectedMember)}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingNameValue(getMemberName(selectedMember));
                        setIsEditingName(true);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: `1px solid rgba(255,255,255,0.15)`,
                        borderRadius: "6px",
                        color: selectedMember.themeColor,
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Edit or customize member name"
                    >
                      ✏️ Edit Name
                    </button>
                  </div>
                )}

                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {selectedMember.role} • {selectedMember.experience}
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: selectedMember.themeColor, boxShadow: `0 0 8px ${selectedMember.themeColor}` }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Active Team Member</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px", lineHeight: "1.6", color: "rgba(255,255,255,0.9)" }}>
              <h4 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: selectedMember.themeColor, marginBottom: "8px" }}>
                About & Vision
              </h4>
              <p style={{ fontSize: "15px", margin: "0 0 12px 0" }}>{selectedMember.fullDescription}</p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: selectedMember.themeColor, marginBottom: "10px" }}>
                Core Skills & Expertise
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedMember.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: `1px solid ${selectedMember.themeColor}55`,
                      color: "#ffffff",
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              <a
                href={`mailto:${selectedMember.socials.email}`}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: selectedMember.themeColor,
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "13px",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                ✉ Contact {getMemberName(selectedMember).split(" ")[0]}
              </a>
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Confirmation & Preview Modal */}
      {isPhotoModalOpen && editingMemberForPhoto && (
        <div
          className="modal-overlay"
          onClick={() => setIsPhotoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Profile Photo"
        >
          <div
            className="modal-container"
            style={{
              maxWidth: "440px",
              borderColor: editingMemberForPhoto.themeColor || "#c5a059",
              boxShadow: "0 25px 70px rgba(0,0,0,0.9)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsPhotoModalOpen(false)}
              aria-label="Cancel photo change"
            >
              ✕
            </button>
            <span style={{ color: "#c5a059", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Profile Photo Preview
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "6px 0 16px 0", color: "#ffffff" }}>
              {editingMemberForPhoto.name}
            </h3>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `3px solid ${editingMemberForPhoto.themeColor || "#c5a059"}`,
                  boxShadow: `0 0 30px ${editingMemberForPhoto.themeColor || "#c5a059"}55`,
                  position: "relative",
                  background: "#000",
                }}
              >
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="New avatar preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "14px",
                    }}
                  >
                    Loading...
                  </div>
                )}
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              আপনি কি <strong>{editingMemberForPhoto.name}</strong> এর প্রোফাইল ছবি হিসেবে এটি সেভ করতে চান? (Save this as the new profile photo?)
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleConfirmPhotoSave}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: editingMemberForPhoto.themeColor || "#c5a059",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✓ Save Photo / সেভ করুন
              </button>
              <button
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPhotoPreviewUrl("");
                }}
                style={{
                  padding: "12px 18px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Guide Modal */}
      {showInstructions && (
        <div
          className="modal-overlay"
          onClick={() => setShowInstructions(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Meet My Team Instructions and User Guide"
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowInstructions(false)}
              aria-label="Close instructions"
            >
              ✕
            </button>
            <div style={{ marginBottom: "20px" }}>
              <span style={{ color: "#c5a059", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                User Guide & Instructions / ব্যবহার নির্দেশিকা
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "6px 0 0 0", color: "#ffffff" }}>
                Meet My Team ({TEAM_MEMBERS.length} জন প্রফেশনাল মেম্বার)
              </h2>
            </div>

            <div className="instruction-step">
              <div className="step-num">১</div>
              <div className="step-content">
                <h4>টিম মেম্বার স্ক্রোল সিস্টেম (Multiple Ways to Scroll)</h4>
                <p>
                  <strong>Meet My Team</strong> সেকশনে সহজে ব্রাউজ করার জন্য ৫টি স্ক্রোলিং মাধ্যম যোগ করা হয়েছে:
                </p>
                <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "13px", lineHeight: "1.6", color: "rgba(255,255,255,0.85)" }}>
                  <li><strong>🖱️ Mouse Wheel Scroll:</strong> কার্ডগুলোর উপর মাউস হুইল (চাকা) ঘুরালে সরাসরি ডানে ও বাঁয়ে স্মুথলি স্ক্রোল হবে।</li>
                  <li><strong>👆 Click & Drag / Swipe:</strong> মাউস দিয়ে ক্লিক করে ড্র্যাগ করুন অথবা মোবাইলে টাচ সোয়াইপ করুন।</li>
                  <li><strong>🔘 Pagination Dots:</strong> নিচের ডটগুলোতে ক্লিক করে যেকোনো মেম্বারের প্রোফাইলে সরাসরি যেতে পারবেন।</li>
                  <li><strong>▶ Auto-Scroll:</strong> <em>Auto-Scroll</em> বাটনে ক্লিক করলে নিজে থেকেই পর্যায়ক্রমে টিম প্রোফাইল স্ক্রোল হতে থাকবে।</li>
                  <li><strong>⌨️ Keyboard Arrow Keys:</strong> কিবোর্ডের <strong>←</strong> ও <strong>→</strong> বোতাম দিয়েও নেভিগেট করতে পারবেন।</li>
                </ul>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-num">২</div>
              <div className="step-content">
                <h4>ফুল প্রোফাইল ও বিস্তারিত তথ্য (View Full Profile)</h4>
                <p>
                  যেকোনো টিম মেম্বারের কার্ডে ক্লিক করলে একটি বড় পপআপ উইন্ডো ওপেন হবে, যেখানে তাদের অভিজ্ঞতা, ভিশন, স্কিলসমূহ ও যোগাযোগের ইমেইল দেখতে পাবেন।
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-num">৩</div>
              <div className="step-content">
                <h4>কালার ও থিম পরিবর্তন (Theme Palette Switcher)</h4>
                <p>
                  উপরের হেডারে <strong>Theme</strong> প্যালেটে ক্লিক করে ব্ল্যাক এনিমেশন (Pure Black), ওবসিডিয়ান গোল্ড, নীল, হোয়াইট, এমারেল্ড এবং পার্পল থিমে সাইট দেখতে পারেন।
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-num">৪</div>
              <div className="step-content">
                <h4>টিম মেম্বার তথ্য কাস্টমাইজেশন (Customizing Data)</h4>
                <p>
                  <code>src/data/team.ts</code> ফাইলে খুব সহজে টিম মেম্বারদের নাম, ছবি, পদবী ও স্কিলসমূহ পরিবর্তন বা নতুন মেম্বার যুক্ত করতে পারবেন।
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px",
                borderRadius: "10px",
                background: "#c5a059",
                color: "#000000",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              বুঝেছি / Got It!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
