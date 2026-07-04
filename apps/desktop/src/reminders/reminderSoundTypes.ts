export type ReminderSound = {
  id: string;
  name: string;
  source: "built_in" | "custom";
  filePath: string;
  volume: number;
  createdAt: string;
};

