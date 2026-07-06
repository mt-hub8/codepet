import { useApp } from "../app/AppProvider";
import { commandService } from "../integrations/command/commandService";
import {
  commandTaskStatusLabels,
  type CommandTask,
  type CommandTaskStatus,
} from "../integrations/command/commandTypes";
import { TaskStatusIcon } from "./HomeIcons";
import { demoTaskRows } from "./homePlaceholders";

function taskActionLabel(status: CommandTaskStatus): string {
  if (status === "succeeded") {
    return "查看结果";
  }
  if (status === "needs_user_input" || status === "no_output_timeout") {
    return "查看详情";
  }
  return "查看日志";
}

function taskMeta(task: CommandTask): string {
  const adapterLabel =
    task.adapterType === "codex" || task.adapterType === "cursor" || task.adapterType === "claude_code"
      ? "Agent 任务"
      : "通用命令";
  return `${adapterLabel} · ${commandService.formatTaskTime(task)}`;
}

export function RecentTaskStatusSection() {
  const { recentCommandTasks, navigate, setSelectedCommandTaskId } = useApp();
  const useDemo = recentCommandTasks.length === 0;

  return (
    <section className="home-section" aria-label="最近任务状态">
      <div className="home-section-header">
        <h2>最近任务状态</h2>
        <button type="button" className="home-link-btn" onClick={() => navigate("tasks")}>
          查看全部任务 &gt;
        </button>
      </div>

      <div className="home-task-panel">
        {useDemo
          ? demoTaskRows.map((row, index) => (
              <div
                key={row.id}
                className={`home-task-row${index < demoTaskRows.length - 1 ? " home-task-row--divider" : ""}`}
              >
                <TaskStatusIcon status={row.status} />
                <div className="home-task-row-main">
                  <strong>{row.title}</strong>
                  <span>{row.meta}</span>
                </div>
                <span className={`home-task-status-text home-task-status-text--${row.status}`}>
                  {row.statusLabel}
                </span>
                <button type="button" className="home-link-btn" onClick={() => navigate("tasks")}>
                  {row.actionLabel} &gt;
                </button>
              </div>
            ))
          : recentCommandTasks.slice(0, 3).map((task, index, list) => (
              <div
                key={task.id}
                className={`home-task-row${index < list.length - 1 ? " home-task-row--divider" : ""}`}
              >
                <TaskStatusIcon status={task.status} />
                <div className="home-task-row-main">
                  <strong>{task.title}</strong>
                  <span>{taskMeta(task)}</span>
                </div>
                <span className={`home-task-status-text home-task-status-text--${task.status}`}>
                  {commandTaskStatusLabels[task.status]}
                </span>
                <button
                  type="button"
                  className="home-link-btn"
                  onClick={() => {
                    setSelectedCommandTaskId(task.id);
                    navigate("tasks");
                  }}
                >
                  {taskActionLabel(task.status)} &gt;
                </button>
              </div>
            ))}
      </div>
    </section>
  );
}
