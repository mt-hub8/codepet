import { claudeCodeAdapter } from "../claude-code/claudeCodeAdapter";
import { codexAdapter } from "../codex/codexAdapter";
import { cursorAdapter } from "../cursor/cursorAdapter";
import type { AgentAdapterType, AgentCommandAdapter } from "./agentAdapterTypes";
import { genericAdapter } from "./genericAdapter";

const adapters: Record<AgentAdapterType, AgentCommandAdapter> = {
  generic: genericAdapter,
  codex: codexAdapter,
  cursor: cursorAdapter,
  claude_code: claudeCodeAdapter,
};

export function getAgentAdapter(type: AgentAdapterType): AgentCommandAdapter {
  return adapters[type] ?? genericAdapter;
}

export function listAgentAdapters(): AgentCommandAdapter[] {
  return Object.values(adapters);
}
