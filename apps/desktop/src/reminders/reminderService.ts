import { createDefaultReminders } from "./reminderDefaults";
import { reminderStorage } from "./reminderStorage";
import type { Reminder, ReminderEvent, ReminderEventType } from "./reminderTypes";
import { calculateNextTrigger, createId, nowIso, validateFixedTime } from "./reminderTime";

function validateReminder(reminder: Reminder) {
  if (!reminder.title.trim()) {
    throw new Error("提醒标题不能为空");
  }
  if (reminder.mode === "interval" && (!reminder.intervalMinutes || reminder.intervalMinutes <= 0)) {
    throw new Error("间隔分钟必须大于 0");
  }
  if (reminder.mode === "fixed_time" && !validateFixedTime(reminder.fixedTime)) {
    throw new Error("固定时间格式必须是 HH:mm，例如 23:30");
  }
}

export const reminderService = {
  async initializeDefaultsOnce() {
    const initialized = await reminderStorage.getMeta("default_reminders_initialized");
    if (initialized === "true") {
      return;
    }
    await this.restoreDefaultReminders();
    await reminderStorage.setMeta("default_reminders_initialized", "true");
  },

  async restoreDefaultReminders() {
    const defaults = createDefaultReminders();
    await Promise.all(defaults.map((reminder) => reminderStorage.saveReminder(reminder)));
  },

  listReminders: reminderStorage.listReminders,
  listEvents: reminderStorage.listEvents,

  async saveReminder(reminder: Reminder) {
    validateReminder(reminder);
    const now = nowIso();
    const nextReminder = {
      ...reminder,
      title: reminder.title.trim(),
      message: reminder.message?.trim() || undefined,
      fixedTime: reminder.mode === "fixed_time" ? reminder.fixedTime : undefined,
      intervalMinutes: reminder.mode === "interval" ? reminder.intervalMinutes : undefined,
      nextTriggerAt: reminder.enabled ? calculateNextTrigger(reminder) : undefined,
      updatedAt: now,
      createdAt: reminder.createdAt || now,
    };
    await reminderStorage.saveReminder(nextReminder);
  },

  async deleteReminder(id: string) {
    await reminderStorage.deleteReminder(id);
  },

  async recordEvent(reminder: Reminder, eventType: ReminderEventType, message?: string) {
    const event: ReminderEvent = {
      id: createId("event"),
      reminderId: reminder.id,
      eventType,
      message,
      createdAt: nowIso(),
    };
    await reminderStorage.addEvent(event);
  },

  async completeReminder(reminder: Reminder) {
    await this.recordEvent(reminder, "completed", reminder.message);
    await reminderStorage.saveReminder({
      ...reminder,
      nextTriggerAt: calculateNextTrigger(reminder),
      updatedAt: nowIso(),
    });
  },

  async snoozeReminder(reminder: Reminder) {
    await this.recordEvent(reminder, "snoozed", reminder.message);
    await reminderStorage.saveReminder({
      ...reminder,
      nextTriggerAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      updatedAt: nowIso(),
    });
  },

  async ignoreReminder(reminder: Reminder) {
    await this.recordEvent(reminder, "ignored", reminder.message);
    await reminderStorage.saveReminder({
      ...reminder,
      nextTriggerAt: calculateNextTrigger(reminder),
      updatedAt: nowIso(),
    });
  },
};

