export type AgentAdapterType = "generic" | "codex" | "cursor" | "claude_code";

export type AgentCommandInput = {
  workingDirectory: string;
  promptOrCommand: string;
  extraArgs?: string[];
  executablePath?: string;
  command?: string;
  args?: string[];
};

export type BuiltCommand = {
  command: string;
  args: string[];
  workingDirectory: string;
};

export type AgentCommandAdapter = {
  type: AgentAdapterType;
  displayName: string;
  defaultExecutable?: string;
  buildCommand: (input: AgentCommandInput) => BuiltCommand;
  detectNeedsUserInput: (output: string) => boolean;
  detectProgress?: (output: string) => string | undefined;
};

export const agentAdapterLabels: Record<AgentAdapterType, string> = {
  generic: "通用命令",
  codex: "Codex",
  cursor: "Cursor CLI",
  claude_code: "Claude Code",
};
