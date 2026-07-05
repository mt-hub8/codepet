export type BasicMemoryType = "preference" | "behavior" | "recent";

export type BasicMemory = {
  id: string;
  type: BasicMemoryType;
  key: string;
  value: string;
  source: string;
  updatedAt: string;
};

export const basicMemoryTypeLabels: Record<BasicMemoryType, string> = {
  preference: "偏好",
  behavior: "行为",
  recent: "最近使用",
};

export const BASIC_MEMORY_KEYS = {
  onboardingCompleted: "onboarding_completed",
  preferredReminderInterval: "preferred_reminder_interval",
  ignoredReminderTypes: "ignored_reminder_types",
  commonCommandTypes: "common_command_types",
  recentModel: "recent_model",
  currentPetId: "current_pet_id",
  localAiEnabled: "local_ai_enabled",
  recentWorkingDirectory: "recent_working_directory",
} as const;
