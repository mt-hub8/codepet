import type { AgentCommandAdapter } from "./agentAdapterTypes";

export const genericAdapter: AgentCommandAdapter = {
  type: "generic",
  displayName: "通用命令",
  buildCommand(input) {
    const command = input.command?.trim() || input.promptOrCommand.trim();
    return {
      command,
      args: input.args ?? input.extraArgs ?? [],
      workingDirectory: input.workingDirectory,
    };
  },
  detectNeedsUserInput: () => false,
};
