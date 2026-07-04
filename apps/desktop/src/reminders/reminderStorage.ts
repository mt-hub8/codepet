import { invoke } from "@tauri-apps/api/core";
import type { ReminderEvent, Reminder } from "./reminderTypes";
import type { ReminderSound } from "./reminderSoundTypes";

export const reminderStorage = {
  listReminders: () => invoke<Reminder[]>("list_reminders"),
  saveReminder: (reminder: Reminder) => invoke<void>("save_reminder", { reminder }),
  deleteReminder: (id: string) => invoke<void>("delete_reminder", { id }),
  listEvents: (limit = 20) => invoke<ReminderEvent[]>("list_reminder_events", { limit }),
  addEvent: (event: ReminderEvent) => invoke<void>("add_reminder_event", { event }),
  getMeta: (key: string) => invoke<string | null>("get_app_meta", { key }),
  setMeta: (key: string, value: string) => invoke<void>("set_app_meta", { key, value }),
  listSounds: () => invoke<ReminderSound[]>("list_reminder_sounds"),
  importSound: (originalPath: string, name: string) =>
    invoke<ReminderSound>("import_reminder_sound", { originalPath, name }),
  deleteSound: (id: string) => invoke<void>("delete_reminder_sound", { id }),
};

