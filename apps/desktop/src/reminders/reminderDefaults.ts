import type { Reminder } from "./reminderTypes";
import { calculateNextTrigger, nowIso } from "./reminderTime";

const defaultSoundId = "default-beep";

export function createDefaultReminders(): Reminder[] {
  const createdAt = nowIso();
  const defaults: Omit<Reminder, "nextTriggerAt" | "createdAt" | "updatedAt">[] = [
    {
      id: "default-water",
      title: "喝水提醒",
      reminderType: "water",
      mode: "interval",
      intervalMinutes: 60,
      message: "该喝水啦，先让身体续一口电。",
      enabled: true,
      soundId: defaultSoundId,
      soundEnabled: true,
    },
    {
      id: "default-rest",
      title: "休息提醒",
      reminderType: "rest",
      mode: "interval",
      intervalMinutes: 45,
      message: "站起来活动一下，眼睛也休息一会儿。",
      enabled: true,
      soundId: defaultSoundId,
      soundEnabled: true,
    },
    {
      id: "default-sleep-wrap",
      title: "睡觉 / 收尾提醒",
      reminderType: "rest",
      mode: "fixed_time",
      fixedTime: "23:30",
      message: "今天可以收尾啦，给明天留一点余地。",
      enabled: true,
      soundId: defaultSoundId,
      soundEnabled: true,
    },
    {
      id: "default-study-focus",
      title: "学习专注提醒",
      reminderType: "study",
      mode: "interval",
      intervalMinutes: 50,
      message: "进入一段学习专注时间，先把注意力放回来。",
      enabled: true,
      soundId: defaultSoundId,
      soundEnabled: true,
    },
  ];

  return defaults.map((reminder) => ({
    ...reminder,
    nextTriggerAt: calculateNextTrigger(reminder),
    createdAt,
    updatedAt: createdAt,
  }));
}

