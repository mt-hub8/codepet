import type { DependencyItemId } from "./dependencyTypes";

export const dependencyErrorMessages = {
  ollamaNotInstalled:
    "未检测到 Ollama。你仍然可以使用提醒和桌宠功能。如果想使用本地 AI，请安装 Ollama 并重新检测。",
  ollamaNotRunning:
    "Ollama 已安装但当前未运行。请启动 Ollama 后重新检测。",
  ollamaNoModels:
    "当前没有检测到本地模型。你可以在终端运行：ollama pull qwen3:0.6b",
  codexMissing:
    "未检测到 Codex CLI。你可以稍后在设置中配置路径，不影响基础功能。",
  cursorMissing:
    "未检测到 Cursor CLI。你可以继续使用通用命令监控。",
  claudeCodeMissing:
    "未检测到 Claude Code CLI。你可以稍后配置路径。",
  commandFailed:
    "命令执行失败，请查看日志。CodePet 不会自动修改你的代码或重新执行命令。",
  petImportFailed:
    "宠物素材导入失败，请确认 pet.json 和 spritesheet 文件是否在同一目录，且格式正确。",
} as const;

export const dependencyFixSuggestions: Partial<Record<DependencyItemId, string>> = {
  git: "如需版本控制相关命令，请安装 Git：https://git-scm.com/",
  node: "如需运行 Node.js 项目命令，请安装 Node.js LTS。",
  pnpm: "如需 pnpm 命令，请运行：npm install -g pnpm",
  ollama: "安装 Ollama：https://ollama.com/ ，启动后运行 ollama pull qwen3:0.6b",
  codex: "在设置 → Agent 工具中填写 Codex CLI 路径，或安装官方 Codex CLI。",
  cursor: "在设置中配置 Cursor CLI 路径。未安装不影响提醒与桌宠。",
  claude_code: "在设置中配置 Claude Code CLI 路径，例如 claude 命令。",
};

export const ollamaRecommendedModels = ["qwen3:0.6b", "llama3.2:3b"] as const;
