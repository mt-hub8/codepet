import type { AgentCommandAdapter } from "../command/agentAdapterTypes";
import {
  detectClaudeCodeNeedsUserInput,
  detectClaudeCodeProgress,
} from "./claudeCodeDetectionRules";

export const claudeCodeAdapter: AgentCommandAdapter = {
  type: "claude_code",
  displayName: "Claude Code",
  defaultExecutable: "claude",
  buildCommand(input) {
    const command = input.executablePath?.trim() || "claude";
    const args = [
      ...(input.promptOrCommand ? [input.promptOrCommand] : []),
      ...(input.extraArgs ?? []),
    ];
    return {
      command,
      args,
      workingDirectory: input.workingDirectory,
    };
  },
  detectNeedsUserInput: detectClaudeCodeNeedsUserInput,
  detectProgress: detectClaudeCodeProgress,
};
