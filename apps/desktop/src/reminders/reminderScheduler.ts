import { showMainWindow } from "../shared/desktopWindowService";
import { reminderSoundService } from "./reminderSoundService";
import { reminderService } from "./reminderService";
import type { Reminder } from "./reminderTypes";
import type { ReminderSound } from "./reminderSoundTypes";

export type ReminderTrigger = {
  reminder: Reminder;
  message: string;
};

export async function checkDueReminder(
  reminders: Reminder[],
  sounds: ReminderSound[],
  activeReminder?: Reminder | null,
) {
  if (activeReminder) {
    return null;
  }

  const now = Date.now();
  const dueReminder = reminders.find(
    (reminder) =>
      reminder.enabled &&
      reminder.nextTriggerAt &&
      new Date(reminder.nextTriggerAt).getTime() <= now,
  );

  if (!dueReminder) {
    return null;
  }

  const message = dueReminder.message || `${dueReminder.title} 到时间了。`;
  await reminderService.recordEvent(dueReminder, "triggered", message);
  await showMainWindow();

  if (dueReminder.soundEnabled) {
    const sound = sounds.find((item) => item.id === dueReminder.soundId) ?? sounds[0];
    reminderSoundService.playSound(sound).catch(() => undefined);
  }

  return { reminder: dueReminder, message } satisfies ReminderTrigger;
}

