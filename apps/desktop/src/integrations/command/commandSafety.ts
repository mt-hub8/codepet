const DANGEROUS_PATTERNS: RegExp[] = [
  /rm\s+(-[^\s]*\s+)*-?rf\b/i,
  /rm\s+(-[^\s]*\s+)*-?fr\b/i,
  /\bdel\s+\/s\b/i,
  /\bformat\b/i,
  /\bshutdown\b/i,
  /curl[^\n|]*\|\s*(sh|bash)\b/i,
  /powershell[^\n]*(invoke-webrequest|iwr|downloadstring)/i,
  /\brm\b[^\n]*\.git\b/i,
  /\brmdir\b[^\n]*\.git\b/i,
];

export function isDangerousCommand(command: string, args: string[] = []): boolean {
  const full = [command, ...args].join(" ").trim();
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(full));
}

export function confirmDangerousCommand(command: string, args: string[] = []): boolean {
  const full = [command, ...args].join(" ").trim();
  return window.confirm(
    `该命令可能具有破坏性：\n\n${full}\n\n请确认你理解风险，并只在可信目录中执行。`,
  );
}
