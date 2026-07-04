import {
  demoTaskPlaceholders,
  taskStatusLabels,
  taskStatusTagClass,
} from "./taskPlaceholders";

export function TasksPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>任务监控</h1>
        <p>命令监控与 Codex / Cursor / Claude Code 接入将在 V0.4 开放。</p>
      </header>

      <div className="v04-banner">
        V0.4 将支持通用命令监控与外部 Agent CLI 状态追踪。当前页面仅展示示例占位，不会启动任何外部命令。
      </div>

      <section className="cp-section" aria-label="示例任务状态">
        <div className="cp-section-header">
          <h2>示例任务状态（占位）</h2>
        </div>
        <div className="task-status-list">
          {demoTaskPlaceholders.map((task) => (
            <article key={task.id} className="cp-card task-status-item">
              <span>{task.title}</span>
              <span className={`cp-tag ${taskStatusTagClass[task.status]}`}>
                {taskStatusLabels[task.status]}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
