import type { ReminderType } from "../../reminders/reminderTypes";
import { reminderTypeLabels } from "../../reminders/reminderTypes";
import { ollamaClient } from "./ollamaClient";
import { ollamaSettingsStorage } from "./ollamaSettingsStorage";
import type { LocalAiSettings, OllamaChatMessage, OllamaStatus } from "./ollamaTypes";

const promptToneMap = {
  generate: "自然",
  gentle: "温柔",
  strict: "严格",
  cute: "可爱",
  short: "简短",
} as const;

export type ReminderPromptTone = keyof typeof promptToneMap;

function ensureAiEnabled(settings: LocalAiSettings) {
  if (!settings.enabled) {
    throw new Error("本地 AI 已关闭，请先在本地 AI 设置中启用。");
  }
  if (!settings.selectedModel) {
    throw new Error("请先选择一个本地模型。");
  }
}

function buildReminderPrompt(input: {
  title: string;
  reminderType: ReminderType;
  message?: string;
  tone: ReminderPromptTone;
}) {
  return [
    "你是 CodePet 的本地提醒文案助手。",
    "请根据提醒类型、标题和用户偏好的语气，生成一句简短、自然、中文友好的桌宠提醒文案。",
    "要求不超过 30 个汉字，不要输出解释，不要输出列表，只输出最终提醒文案。",
    `提醒类型：${reminderTypeLabels[input.reminderType]}`,
    `提醒标题：${input.title || "未填写"}`,
    `原始文案：${input.message || "无"}`,
    `目标语气：${promptToneMap[input.tone]}`,
  ].join("\n");
}

export const ollamaService = {
  getSettings: ollamaSettingsStorage.getSettings,
  saveSettings: ollamaSettingsStorage.saveSettings,

  async detectStatus(settings: LocalAiSettings): Promise<OllamaStatus> {
    try {
      return await ollamaClient.detectStatus(settings.baseUrl, settings.selectedModel);
    } catch (error) {
      return {
        status: "error",
        baseUrl: settings.baseUrl,
        models: [],
        selectedModel: settings.selectedModel,
        errorMessage:
          error instanceof Error
            ? error.message
            : "未检测到 Ollama，请先安装并启动 Ollama。",
      };
    }
  },

  chat(settings: LocalAiSettings, messages: OllamaChatMessage[]) {
    ensureAiEnabled(settings);
    return ollamaClient.chat(settings.baseUrl, settings.selectedModel!, messages);
  },

  async generateReminderMessage(
    settings: LocalAiSettings,
    input: {
      title: string;
      reminderType: ReminderType;
      message?: string;
      tone: ReminderPromptTone;
    },
  ) {
    ensureAiEnabled(settings);
    const content = await ollamaClient.chat(settings.baseUrl, settings.selectedModel!, [
      {
        role: "user",
        content: buildReminderPrompt(input),
      },
    ]);
    return content.replace(/^["“”]+|["“”]+$/g, "").slice(0, 60);
  },

  isLocalBaseUrl: ollamaClient.isLocalBaseUrl,
};

