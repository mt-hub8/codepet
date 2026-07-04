export const claudeCodeDetectionKeywords = [
  "claude code",
  "allow this action",
  "permission request",
  "waiting for permission",
  "需要权限",
  "等待权限",
];

export function detectClaudeCodeNeedsUserInput(output: string): boolean {
  const lower = output.toLowerCase();
  return claudeCodeDetectionKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function detectClaudeCodeProgress(output: string): string | undefined {
  if (/claude is thinking|working on/i.test(output)) {
    return "Claude Code 运行中";
  }
  return undefined;
}
