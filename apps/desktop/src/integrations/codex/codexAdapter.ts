import type { AgentCommandAdapter } from "../command/agentAdapterTypes";
import { detectCodexNeedsUserInput, detectCodexProgress } from "./codexDetectionRules";

export const codexAdapter: AgentCommandAdapter = {
  type: "codex",
  displayName: "Codex",
  defaultExecutable: "codex",
  buildCommand(input) {
    const command = input.executablePath?.trim() || "codex";
    const args = [...(input.promptOrCommand ? [input.promptOrCommand] : []), ...(input.extraArgs ?? [])];
    return {
      command,
      args,
      workingDirectory: input.workingDirectory,
    };
  },
  detectNeedsUserInput: detectCodexNeedsUserInput,
  detectProgress: detectCodexProgress,
};
