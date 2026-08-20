import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playBridgeVoice(): void {
  playSectionSound("bridge", { force: true });
}

export { stopCurrentSectionSound };

