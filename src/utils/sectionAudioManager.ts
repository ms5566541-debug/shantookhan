// Unified Section Audio Manager for Auto-Scroll & Navigation
// Decodes high-definition WAV audio into native Web Audio AudioBuffers
// Ensures reliable audio playback during automated scrolling across sections.
// Automatically stops previous section's sound when moving to a new section.

import { HOME_AUDIO_DATA_URI } from "./homeSoundBase64";
import { BRIDGE_AUDIO_DATA_URI } from "./bridgeSoundBase64";
import { BAZAAR_AUDIO_DATA_URI } from "./bazaarSoundBase64";
import { ABOUT_US_AUDIO_DATA_URI } from "./aboutUsSoundBase64";
import { TEAM_AUDIO_DATA_URI } from "./teamSoundBase64";
import { GALLERY_AUDIO_DATA_URI } from "./gallerySoundBase64";

export type SectionSoundId =
  | "home"
  | "bridge"
  | "bazaar"
  | "about-us"
  | "shanto-khan"
  | "team"
  | "media-gallery";

interface SectionAudioDef {
  id: SectionSoundId;
  name: string;
  dataUri: string;
  fallbackUrl: string;
}

const SECTION_SOUND_MAP: Record<SectionSoundId, SectionAudioDef> = {
  home: {
    id: "home",
    name: "Home Page",
    dataUri: HOME_AUDIO_DATA_URI,
    fallbackUrl: "/home_voice.wav",
  },
  bridge: {
    id: "bridge",
    name: "Bridge Story",
    dataUri: BRIDGE_AUDIO_DATA_URI,
    fallbackUrl: "/bridge_voice.wav",
  },
  bazaar: {
    id: "bazaar",
    name: "BAZAAR Old Town",
    dataUri: BAZAAR_AUDIO_DATA_URI,
    fallbackUrl: "/bazaar_voice.wav",
  },
  "about-us": {
    id: "about-us",
    name: "About Us",
    dataUri: ABOUT_US_AUDIO_DATA_URI,
    fallbackUrl: "/about_us_voice.wav",
  },
  "shanto-khan": {
    id: "shanto-khan",
    name: "Shanto Khan Page",
    dataUri: TEAM_AUDIO_DATA_URI,
    fallbackUrl: "/team_voice.wav",
  },
  team: {
    id: "team",
    name: "Meet Team",
    dataUri: TEAM_AUDIO_DATA_URI,
    fallbackUrl: "/team_voice.wav",
  },
  "media-gallery": {
    id: "media-gallery",
    name: "Gallery & Videos",
    dataUri: GALLERY_AUDIO_DATA_URI,
    fallbackUrl: "/gallery_voice.wav",
  },
};

let sharedAudioCtx: AudioContext | null = null;
const audioBufferCache = new Map<SectionSoundId, AudioBuffer>();
const decodingPromises = new Map<SectionSoundId, Promise<AudioBuffer | null>>();
const htmlAudioCache = new Map<SectionSoundId, HTMLAudioElement>();

// Active playing references
let currentSourceNode: AudioBufferSourceNode | null = null;
let currentGainNode: GainNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;
let currentActiveSectionId: SectionSoundId | null = null;
let isAudioMuted: boolean = false;
let globalMasterVolume: number = 1.0; // High clarity and audibility

function base64ToArrayBuffer(dataUri: string): ArrayBuffer {
  const commaIdx = dataUri.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUri.substring(commaIdx + 1) : dataUri;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

async function getDecodedBuffer(
  ctx: AudioContext,
  def: SectionAudioDef
): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(def.id)) {
    return audioBufferCache.get(def.id)!;
  }
  if (decodingPromises.has(def.id)) {
    return decodingPromises.get(def.id)!;
  }

  const decodePromise = (async () => {
    try {
      const arrayBuffer = base64ToArrayBuffer(def.dataUri);
      const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      audioBufferCache.set(def.id, buffer);
      return buffer;
    } catch (err) {
      console.warn(`Web Audio decodeAudioData failed for ${def.id}:`, err);
      return null;
    }
  })();

  decodingPromises.set(def.id, decodePromise);
  return decodePromise;
}

/**
 * Unlock and pre-decode all sound effects on user interaction
 */
export function unlockAndWarmUpAudio(): AudioContext | null {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Pre-decode all section audio in background
    (Object.keys(SECTION_SOUND_MAP) as SectionSoundId[]).forEach((id) => {
      const def = SECTION_SOUND_MAP[id];
      getDecodedBuffer(ctx, def).catch(() => {});
    });
  }
  return ctx;
}

/**
 * Stop any currently playing section audio immediately
 */
export function stopCurrentSectionSound(): void {
  // 1. Stop Web Audio Source
  if (currentSourceNode) {
    try {
      if (currentGainNode && sharedAudioCtx) {
        const now = sharedAudioCtx.currentTime;
        currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, now);
        currentGainNode.gain.linearRampToValueAtTime(0.001, now + 0.02);
      }
      const nodeToStop = currentSourceNode;
      setTimeout(() => {
        try {
          nodeToStop.stop();
          nodeToStop.disconnect();
        } catch {}
      }, 25);
    } catch {
      // Ignored
    }
    currentSourceNode = null;
    currentGainNode = null;
  }

  // 2. Stop HTML Audio
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch {}
    currentHtmlAudio = null;
  }

  currentActiveSectionId = null;
}

function playBufferOnContext(
  ctx: AudioContext,
  buffer: AudioBuffer,
  sectionId: SectionSoundId,
  volume: number
): boolean {
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    const effectiveVol = Math.max(0.1, Math.min(1.5, volume));
    gainNode.gain.setValueAtTime(effectiveVol, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    currentSourceNode = source;
    currentGainNode = gainNode;

    source.onended = () => {
      if (currentSourceNode === source) {
        currentSourceNode = null;
        currentGainNode = null;
        if (currentActiveSectionId === sectionId) {
          currentActiveSectionId = null;
        }
      }
    };

    source.start(0);
    return true;
  } catch (err) {
    console.warn(`Buffer play failed for ${sectionId}:`, err);
    return false;
  }
}

/**
 * Play a specific section's uploaded sound effect.
 * Stops any previously playing sound immediately.
 * Guaranteed to play during auto-scroll timers.
 */
export function playSectionSound(
  sectionId: SectionSoundId,
  options?: { force?: boolean; volume?: number }
): void {
  if (isAudioMuted) return;

  // If already playing this section's sound and not forcing a replay, skip
  if (currentActiveSectionId === sectionId && !options?.force && currentSourceNode) {
    return;
  }

  // Stop previous sound immediately
  stopCurrentSectionSound();

  const def = SECTION_SOUND_MAP[sectionId];
  if (!def) return;

  const targetVol = options?.volume ?? globalMasterVolume;
  currentActiveSectionId = sectionId;

  const ctx = getAudioContext();

  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Check if buffer is already decoded
    const cached = audioBufferCache.get(sectionId);
    if (cached) {
      playBufferOnContext(ctx, cached, sectionId, targetVol);
      return;
    }

    // Decode and play as soon as buffer is ready
    getDecodedBuffer(ctx, def).then((buffer) => {
      if (buffer && currentActiveSectionId === sectionId) {
        const played = playBufferOnContext(ctx, buffer, sectionId, targetVol);
        if (!played) {
          startHtmlAudio(def, targetVol);
        }
      }
    }).catch(() => {
      startHtmlAudio(def, targetVol);
    });
  } else {
    startHtmlAudio(def, targetVol);
  }
}

function startHtmlAudio(def: SectionAudioDef, volume: number): void {
  try {
    let audio = htmlAudioCache.get(def.id);
    if (!audio) {
      audio = new Audio(def.dataUri);
      audio.preload = "auto";
      htmlAudioCache.set(def.id, audio);
    }

    audio.volume = Math.max(0.1, Math.min(1.0, volume));
    audio.currentTime = 0;
    currentHtmlAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const fallback = new Audio(def.fallbackUrl);
        fallback.volume = Math.max(0.1, Math.min(1.0, volume));
        currentHtmlAudio = fallback;
        fallback.play().catch(() => {});
      });
    }
  } catch {
    // Graceful fallback
  }
}

export function setMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (muted) {
    stopCurrentSectionSound();
  }
}

export function isMuted(): boolean {
  return isAudioMuted;
}

export function getCurrentPlayingSection(): SectionSoundId | null {
  return currentActiveSectionId;
}

export function setMasterVolume(vol: number): void {
  globalMasterVolume = Math.max(0, Math.min(1.5, vol));
  if (currentGainNode && sharedAudioCtx) {
    currentGainNode.gain.setValueAtTime(globalMasterVolume, sharedAudioCtx.currentTime);
  }
  if (currentHtmlAudio) {
    currentHtmlAudio.volume = Math.min(1.0, globalMasterVolume);
  }
}

// Unlock audio context and pre-decode sounds on any initial user touch/click/key/scroll
if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAndWarmUpAudio();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("touchmove", unlock);
    window.removeEventListener("wheel", unlock);
    window.removeEventListener("scroll", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("click", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("touchmove", unlock, { passive: true });
  window.addEventListener("wheel", unlock, { passive: true });
  window.addEventListener("scroll", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  window.addEventListener("click", unlock, { passive: true });
}

