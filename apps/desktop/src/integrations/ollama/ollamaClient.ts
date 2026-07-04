import { invoke } from "@tauri-apps/api/core";
import type { LocalAiSettings, OllamaChatMessage, OllamaStatus } from "./ollamaTypes";

export const ollamaClient = {
  getSettings: () => invoke<LocalAiSettings>("get_local_ai_settings"),
  saveSettings: (settings: LocalAiSettings) =>
    invoke<void>("save_local_ai_settings", { settings }),
  detectStatus: (baseUrl: string, selectedModel?: string) =>
    invoke<OllamaStatus>("detect_ollama_status", { baseUrl, selectedModel }),
  chat: (baseUrl: string, model: string, messages: OllamaChatMessage[]) =>
    invoke<string>("ollama_chat", { baseUrl, model, messages }),
  isLocalBaseUrl: (baseUrl: string) => invoke<boolean>("is_local_ollama_base_url", { baseUrl }),
};

