import { CommandTaskPanel } from "../integrations/command/CommandTaskPanel";

export function TasksPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>任务监控</h1>
        <p>
          通用命令监控 + Codex / Cursor / Claude Code 轻量适配。CodePet 只监控、提醒和记录，不会自动确认或执行
          Agent 请求。
        </p>
      </header>

      <div className="v04-banner">
        V0.4.2 支持等待确认检测与长时间无输出提醒。CodePet 不做屏幕识别，也不替用户确认权限。
      </div>

      <CommandTaskPanel />
    </div>
  );
}
