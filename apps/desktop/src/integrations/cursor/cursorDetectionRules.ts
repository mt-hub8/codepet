export const cursorDetectionKeywords = [
  "cursor agent",
  "agent waiting",
  "waiting for approval",
  "requires your approval",
  "等待确认",
];

export function detectCursorNeedsUserInput(output: string): boolean {
  const lower = output.toLowerCase();
  return cursorDetectionKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function detectCursorProgress(output: string): string | undefined {
  if (/running agent|cursor cli/i.test(output)) {
    return "Cursor CLI 运行中";
  }
  return undefined;
}
