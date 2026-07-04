import { dependencyStorage } from "./dependencyStorage";
import { AGENT_TOOL_SETTING_KEYS, type DependencyItem, type DependencyItemId } from "./dependencyTypes";

const BASE_DEPENDENCIES: Array<Omit<DependencyItem, "status" | "version" | "message">> = [
  { id: "git", name: "Git", detectCommand: "git", detectArgs: ["--version"] },
  { id: "node", name: "Node.js", detectCommand: "node", detectArgs: ["--version"] },
  { id: "pnpm", name: "pnpm", detectCommand: "pnpm", detectArgs: ["--version"] },
  { id: "codex", name: "Codex CLI", detectCommand: "codex", detectArgs: ["--version"] },
  { id: "cursor", name: "Cursor CLI", detectCommand: "cursor", detectArgs: ["--version"] },
  {
    id: "claude_code",
    name: "Claude Code CLI",
    detectCommand: "claude",
    detectArgs: ["--version"],
  },
];

const customPathKeyMap: Record<DependencyItemId, string | undefined> = {
  git: undefined,
  node: undefined,
  pnpm: undefined,
  codex: AGENT_TOOL_SETTING_KEYS.codexExecutablePath,
  cursor: AGENT_TOOL_SETTING_KEYS.cursorExecutablePath,
  claude_code: AGENT_TOOL_SETTING_KEYS.claudeCodeExecutablePath,
};

async function detectOne(
  item: Omit<DependencyItem, "status" | "version" | "message">,
  customPath?: string,
): Promise<DependencyItem> {
  const executable = customPath?.trim() || item.detectCommand;
  if (!executable) {
    return {
      ...item,
      customPath,
      status: "not_configured",
      message: "未配置可执行路径",
    };
  }

  try {
    const result = await dependencyStorage.detectExecutable(executable, item.detectArgs);
    if (result.detected) {
      return {
        ...item,
        customPath,
        status: "detected",
        version: result.version,
        message: "已检测到",
      };
    }
    return {
      ...item,
      customPath,
      status: "not_detected",
      message: result.errorMessage ?? "未检测到，可稍后安装或配置自定义路径",
    };
  } catch (error) {
    return {
      ...item,
      customPath,
      status: "failed",
      message: error instanceof Error ? error.message : "检测失败",
    };
  }
}

export const dependencyDetection = {
  async loadCustomPaths(): Promise<Record<DependencyItemId, string | undefined>> {
    const [codex, cursor, claude] = await Promise.all([
      dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.codexExecutablePath),
      dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.cursorExecutablePath),
      dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.claudeCodeExecutablePath),
    ]);
    return {
      git: undefined,
      node: undefined,
      pnpm: undefined,
      codex: codex ?? undefined,
      cursor: cursor ?? undefined,
      claude_code: claude ?? undefined,
    };
  },

  async saveCustomPath(id: DependencyItemId, path: string): Promise<void> {
    const key = customPathKeyMap[id];
    if (!key) {
      return;
    }
    await dependencyStorage.saveSetting(key, path.trim());
  },

  async detectAll(customPaths?: Partial<Record<DependencyItemId, string>>): Promise<DependencyItem[]> {
    const paths = customPaths ?? (await this.loadCustomPaths());
    const results = await Promise.all(
      BASE_DEPENDENCIES.map((item) => detectOne(item, paths[item.id])),
    );
    return results;
  },

  async loadKeywords(): Promise<string[]> {
    const raw = await dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.needsUserInputKeywords);
    if (!raw?.trim()) {
      return [];
    }
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  },

  async saveKeywords(keywords: string[]): Promise<void> {
    await dependencyStorage.saveSetting(
      AGENT_TOOL_SETTING_KEYS.needsUserInputKeywords,
      keywords.join("\n"),
    );
  },
};
