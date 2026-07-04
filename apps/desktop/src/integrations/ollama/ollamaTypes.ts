export type OllamaModel = {
  name: string;
  size?: number;
  modifiedAt?: string;
};

export type OllamaStatusValue = "checking" | "available" | "unavailable" | "error";

export type OllamaStatus = {
  status: OllamaStatusValue;
  baseUrl: string;
  models: OllamaModel[];
  selectedModel?: string;
  errorMessage?: string;
};

export type LocalAiSettings = {
  enabled: boolean;
  provider: "ollama";
  baseUrl: string;
  selectedModel?: string;
  updatedAt: string;
};

export type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatMessage = OllamaChatMessage & {
  id: string;
};

export const recommendedOllamaModels = [
  {
    name: "qwen3:0.6b",
    description: "轻量优先，适合提醒文案和基础聊天。",
    command: "ollama pull qwen3:0.6b",
  },
  {
    name: "qwen2.5:1.5b",
    description: "质量和性能平衡。",
    command: "ollama pull qwen2.5:1.5b",
  },
  {
    name: "gemma3:1b",
    description: "轻量聊天备选。",
    command: "ollama pull gemma3:1b",
  },
];

