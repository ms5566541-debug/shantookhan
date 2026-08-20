import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playAboutUsVoice(): void {
  playSectionSound("about-us", { force: true });
}

export { stopCurrentSectionSound };

