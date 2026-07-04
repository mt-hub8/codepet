import type { AgentCommandAdapter } from "../command/agentAdapterTypes";
import { detectCursorNeedsUserInput, detectCursorProgress } from "./cursorDetectionRules";

export const cursorAdapter: AgentCommandAdapter = {
  type: "cursor",
  displayName: "Cursor CLI",
  defaultExecutable: "cursor",
  buildCommand(input) {
    const command = input.executablePath?.trim() || "cursor";
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
  detectNeedsUserInput: detectCursorNeedsUserInput,
  detectProgress: detectCursorProgress,
};
