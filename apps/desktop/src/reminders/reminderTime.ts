import type { Reminder } from "./reminderTypes";

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function calculateNextTrigger(reminder: Pick<Reminder, "mode" | "intervalMinutes" | "fixedTime">) {
  const now = new Date();

  if (reminder.mode === "interval") {
    const minutes = reminder.intervalMinutes ?? 1;
    return new Date(now.getTime() + minutes * 60_000).toISOString();
  }

  const fixedTime = reminder.fixedTime ?? "09:00";
  const [hours, minutes] = fixedTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

export function formatTime(value?: string) {
  if (!value) {
    return "未设置";
  }
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function validateFixedTime(value?: string) {
  return Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

