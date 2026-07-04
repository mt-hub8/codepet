export type MemoryScope = "workspace" | "project" | "session";

export type RoleAccent = "green" | "blue" | "amber" | "mint";

export type RolePreset = {
  id: string;
  name: string;
  description: string;
  memoryScope: MemoryScope;
  tools: string[];
  accent: RoleAccent;
};
