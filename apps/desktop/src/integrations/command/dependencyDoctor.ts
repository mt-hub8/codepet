import type { LocalAiSettings, OllamaStatus } from "../ollama/ollamaTypes";
import { ollamaClient } from "../ollama/ollamaClient";
import { dependencyDetection } from "./dependencyDetection";
import {
  dependencyErrorMessages,
  dependencyFixSuggestions,
} from "./dependencyErrorMessages";
import type {
  DoctorDependencyItem,
  DoctorScanResult,
} from "./dependencyDoctorTypes";
import type { DependencyItem, DependencyItemId } from "./dependencyTypes";
import { dependencyStorage } from "./dependencyStorage";
import { AGENT_TOOL_SETTING_KEYS } from "./dependencyTypes";
import { diagnosticsService } from "../../diagnostics/diagnosticsService";

function mapLegacyStatus(
  item: DependencyItem,
): DoctorDependencyItem["status"] {
  switch (item.status) {
    case "detected":
      return "available";
    case "not_detected":
      return "missing";
    case "not_configured":
      return "not_configured";
    case "failed":
      return "error";
    default:
      return "error";
  }
}

function problemForItem(id: DependencyItemId, status: DoctorDependencyItem["status"]): string | undefined {
  if (status === "available") {
    return undefined;
  }
  if (id === "ollama") {
    return dependencyErrorMessages.ollamaNotInstalled;
  }
  if (id === "codex") {
    return dependencyErrorMessages.codexMissing;
  }
  if (id === "cursor") {
    return dependencyErrorMessages.cursorMissing;
  }
  if (id === "claude_code") {
    return dependencyErrorMessages.claudeCodeMissing;
  }
  return undefined;
}

function toDoctorItem(
  item: DependencyItem,
  category: DoctorDependencyItem["category"],
): DoctorDependencyItem {
  const status = mapLegacyStatus(item);
  return {
    id: item.id,
    name: item.name,
    category,
    status,
    detectCommand: [item.detectCommand, ...item.detectArgs].join(" ").trim(),
    version: item.version,
    customPath: item.customPath,
    problem: problemForItem(item.id, status) ?? item.message,
    fixSuggestion: dependencyFixSuggestions[item.id],
  };
}

async function detectOllamaDetail(
  settings: LocalAiSettings,
): Promise<DoctorDependencyItem[]> {
  const baseUrl = settings.baseUrl || "http://localhost:11434/api";
  const apiItem: DoctorDependencyItem = {
    id: "ollama_api",
    name: "Ollama API",
    category: "local_ai",
    status: "checking",
    detectCommand: baseUrl,
  };
  const modelItem: DoctorDependencyItem = {
    id: "ollama_models",
    name: "本地模型",
    category: "local_ai",
    status: "checking",
    detectCommand: "GET /api/tags",
  };

  try {
    const status: OllamaStatus = await ollamaClient.detectStatus(baseUrl, settings.selectedModel);
    if (status.status === "available") {
      apiItem.status = "available";
      apiItem.version = "可访问";
      if (status.models.length > 0) {
        modelItem.status = "available";
        modelItem.version = `${status.models.length} 个模型`;
        if (settings.selectedModel && !status.models.some((m) => m.name === settings.selectedModel)) {
          modelItem.status = "not_configured";
          modelItem.problem = `默认模型「${settings.selectedModel}」未找到`;
          modelItem.fixSuggestion = `运行：ollama pull ${settings.selectedModel}`;
        }
      } else {
        modelItem.status = "missing";
        modelItem.problem = dependencyErrorMessages.ollamaNoModels;
        modelItem.fixSuggestion = dependencyFixSuggestions.ollama;
      }
    } else {
      apiItem.status = "missing";
      apiItem.problem = status.errorMessage ?? dependencyErrorMessages.ollamaNotInstalled;
      apiItem.fixSuggestion = dependencyFixSuggestions.ollama;
      modelItem.status = "missing";
      modelItem.problem = dependencyErrorMessages.ollamaNoModels;
    }
  } catch {
    apiItem.status = "error";
    apiItem.problem = dependencyErrorMessages.ollamaNotRunning;
    modelItem.status = "error";
    modelItem.problem = dependencyErrorMessages.ollamaNoModels;
  }

  return [apiItem, modelItem];
}

export const dependencyDoctor = {
  async scan(input: {
    localAiSettings: LocalAiSettings;
    currentPetId?: string;
  }): Promise<DoctorScanResult> {
    const scannedAt = new Date().toISOString();
    const paths = await dependencyDetection.loadCustomPaths();
    const detected = await dependencyDetection.detectAll(paths);

    const basic = detected
      .filter((item) => ["git", "node", "pnpm"].includes(item.id))
      .map((item) => toDoctorItem(item, "basic"));

    const ollamaBase = detected.find((item) => item.id === "ollama");
    const localAi: DoctorDependencyItem[] = [
      ...(ollamaBase ? [toDoctorItem(ollamaBase, "local_ai")] : []),
      ...(await detectOllamaDetail(input.localAiSettings)),
    ];

    const agent = detected
      .filter((item) => ["codex", "cursor", "claude_code"].includes(item.id))
      .map((item) => toDoctorItem(item, "agent"));

    let diagnostic;
    try {
      diagnostic = await diagnosticsService.getInfo();
    } catch {
      diagnostic = null;
    }

    const environment: DoctorDependencyItem[] = diagnostic
      ? [
          {
            id: "app_version",
            name: "应用版本",
            category: "environment",
            status: "available",
            detectCommand: "CodePet",
            version: diagnostic.appVersion,
          },
          {
            id: "os",
            name: "当前系统",
            category: "environment",
            status: "available",
            detectCommand: "os",
            version: diagnostic.osName,
          },
          {
            id: "data_dir",
            name: "数据目录",
            category: "environment",
            status: "available",
            detectCommand: diagnostic.dataDir,
            version: "本地 SQLite",
          },
          {
            id: "pets_dir",
            name: "宠物素材目录",
            category: "environment",
            status: "available",
            detectCommand: diagnostic.petsDir,
          },
          {
            id: "current_pet",
            name: "当前桌宠",
            category: "environment",
            status: "available",
            detectCommand: "current_pet_id",
            version: input.currentPetId ?? "默认",
          },
        ]
      : [];

    await dependencyStorage.saveSetting(
      AGENT_TOOL_SETTING_KEYS.lastDependencyScanAt,
      scannedAt,
    );

    return {
      items: [...basic, ...localAi, ...agent, ...environment],
      scannedAt,
    };
  },

  async saveCustomPath(id: DependencyItemId, path: string) {
    await dependencyDetection.saveCustomPath(id, path);
  },

  async loadCustomPaths() {
    return dependencyDetection.loadCustomPaths();
  },

  async clearDetectionCache() {
    await dependencyStorage.saveSetting(AGENT_TOOL_SETTING_KEYS.lastDependencyScanAt, "");
  },
};
