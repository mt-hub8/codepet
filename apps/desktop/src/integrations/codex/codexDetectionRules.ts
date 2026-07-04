export const codexDetectionKeywords = [
  "approval required",
  "awaiting approval",
  "requires approval",
  "codex approval",
  "需要批准",
  "等待批准",
];

export function detectCodexNeedsUserInput(output: string): boolean {
  const lower = output.toLowerCase();
  return codexDetectionKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function detectCodexProgress(output: string): string | undefined {
  if (/thinking|planning|generating/i.test(output)) {
    return "Codex 正在处理";
  }
  return undefined;
}
