import type { AgentAdapterType } from "./agentAdapterTypes";

export const DEFAULT_NEEDS_USER_INPUT_KEYWORDS = [
  "是否继续",
  "需要确认",
  "等待输入",
  "请选择",
  "批准",
  "拒绝",
  "确认执行",
  "是否允许",
  "是否批准",
  "approve",
  "approval",
  "confirm",
  "continue",
  "proceed",
  "allow",
  "deny",
  "waiting for input",
  "user input required",
  "permission",
  "press enter",
  "y/n",
  "yes/no",
  "do you want to continue",
];

export function detectNeedsUserInputByKeywords(
  output: string,
  keywords: string[] = DEFAULT_NEEDS_USER_INPUT_KEYWORDS,
): boolean {
  const lower = output.toLowerCase();
  return keywords.some((keyword) => {
    const trimmed = keyword.trim().toLowerCase();
    return trimmed.length > 0 && lower.includes(trimmed);
  });
}

export function mergeDetectionKeywords(
  customKeywords: string[],
  adapterKeywords: string[] = [],
): string[] {
  return [...new Set([...DEFAULT_NEEDS_USER_INPUT_KEYWORDS, ...adapterKeywords, ...customKeywords])];
}

export type DetectionContext = {
  adapterType: AgentAdapterType;
  keywords: string[];
  adapterDetect?: (output: string) => boolean;
};

export function detectNeedsUserInput(output: string, context: DetectionContext): boolean {
  if (context.adapterDetect?.(output)) {
    return true;
  }
  return detectNeedsUserInputByKeywords(output, context.keywords);
}
