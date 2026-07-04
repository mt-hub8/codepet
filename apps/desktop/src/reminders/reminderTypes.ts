export type ReminderType = "water" | "rest" | "study" | "work" | "custom";
export type ReminderMode = "interval" | "fixed_time";
export type ReminderEventType = "triggered" | "completed" | "snoozed" | "ignored";

export type Reminder = {
  id: string;
  title: string;
  reminderType: ReminderType;
  mode: ReminderMode;
  intervalMinutes?: number;
  fixedTime?: string;
  message?: string;
  enabled: boolean;
  nextTriggerAt?: string;
  soundId?: string;
  soundEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReminderEvent = {
  id: string;
  reminderId: string;
  eventType: ReminderEventType;
  message?: string;
  createdAt: string;
};

export const reminderTypeLabels: Record<ReminderType, string> = {
  water: "喝水",
  rest: "休息",
  study: "学习",
  work: "工作",
  custom: "自定义",
};

export const reminderEventLabels: Record<ReminderEventType, string> = {
  triggered: "已触发",
  completed: "已完成",
  snoozed: "稍后提醒",
  ignored: "已忽略",
};

