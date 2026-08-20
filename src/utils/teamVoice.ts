import { playSectionSound, stopCurrentSectionSound } from "./sectionAudioManager";

export function playTeamVoice(): void {
  playSectionSound("team", { force: true });
}

export { stopCurrentSectionSound };

