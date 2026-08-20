import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playGalleryVoice(): void {
  playSectionSound("media-gallery", { force: true });
}

export { stopCurrentSectionSound };

