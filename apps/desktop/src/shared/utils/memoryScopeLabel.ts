import type { MemoryScope } from "../../characters/roleTypes";

const labels: Record<MemoryScope, string> = {
  workspace: "工作区全局",
  project: "项目级",
  session: "会话级",
};

export function memoryScopeLabel(scope: MemoryScope): string {
  return labels[scope];
}
