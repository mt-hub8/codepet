import { ollamaClient } from "./ollamaClient";
import type { LocalAiSettings } from "./ollamaTypes";

export function createDefaultLocalAiSettings(): LocalAiSettings {
  return {
    enabled: false,
    provider: "ollama",
    baseUrl: "http://localhost:11434/api",
    selectedModel: undefined,
    updatedAt: new Date().toISOString(),
  };
}

export const ollamaSettingsStorage = {
  getSettings: async () => {
    try {
      return await ollamaClient.getSettings();
    } catch {
      return createDefaultLocalAiSettings();
    }
  },
  saveSettings: (settings: LocalAiSettings) =>
    ollamaClient.saveSettings({
      ...settings,
      provider: "ollama",
      updatedAt: new Date().toISOString(),
    }),
};

