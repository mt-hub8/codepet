import { open } from "@tauri-apps/plugin-dialog";
import { reminderStorage } from "./reminderStorage";
import { playReminderSound } from "./reminderAudioPlayer";
import type { ReminderSound } from "./reminderSoundTypes";

export const reminderSoundService = {
  listSounds: reminderStorage.listSounds,
  playSound: playReminderSound,
  async importSound() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "提示音", extensions: ["mp3", "wav", "ogg"] }],
    });
    if (!selected || Array.isArray(selected)) {
      return null;
    }

    const name = selected.split(/[\\/]/).pop() ?? "自定义提示音";
    return reminderStorage.importSound(selected, name);
  },
  async deleteSound(sound: ReminderSound) {
    if (sound.source === "built_in") {
      throw new Error("内置提示音不能删除");
    }
    await reminderStorage.deleteSound(sound.id);
  },
};

