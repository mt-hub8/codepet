import { convertFileSrc } from "@tauri-apps/api/core";
import type { ReminderSound } from "./reminderSoundTypes";

let audioContext: AudioContext | null = null;

async function playBuiltInBeep(volume: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }
  audioContext ??= new AudioContextClass();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 720;
  gain.gain.value = Math.max(0, Math.min(volume, 1)) * 0.18;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.22);
}

export async function playReminderSound(sound?: ReminderSound) {
  if (!sound || sound.source === "built_in") {
    await playBuiltInBeep(sound?.volume ?? 1);
    return;
  }

  const audio = new Audio(convertFileSrc(sound.filePath));
  audio.volume = Math.max(0, Math.min(sound.volume, 1));
  await audio.play();
}
