import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playHomeVoice(): void {
  playSectionSound("home", { force: true });
}

export { stopCurrentSectionSound };

