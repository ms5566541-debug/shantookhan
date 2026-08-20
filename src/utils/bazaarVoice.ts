import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playBazaarVoice(): void {
  playSectionSound("bazaar", { force: true });
}

export { stopCurrentSectionSound };


