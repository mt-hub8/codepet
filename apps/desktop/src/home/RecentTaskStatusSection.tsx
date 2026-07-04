import { useApp } from "../app/AppProvider";
import { commandService } from "../integrations/command/commandService";
import {
  commandTaskStatusLabels,
  commandTaskStatusTagClass,
} from "../integrations/command/commandTypes";

export function RecentTaskStatusSection() {
  const { recentCommandTasks, navigate, setSelectedCommandTaskId } = useApp();

  return (
    <section className="cp-section" aria-label="最近任务状态">
      <div className="cp-section-header">
        <div>
          <h2>最近任务状态</h2>
          <p>展示最近命令任务的执行结果摘要</p>
        </div>
        <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("tasks")}>
          进入任务监控
        </button>
      </div>

      {recentCommandTasks.length === 0 ? (
        <div className="cp-empty">
          你可以创建一个 pnpm test 或 pnpm build 任务，让 CodePet 在完成或失败时提醒你。
        </div>
      ) : (
        <div className="task-status-list">
          {recentCommandTasks.map((task) => (
            <article key={task.id} className="cp-card task-status-item">
              <div>
                <strong>{task.title}</strong>
                <span className="task-status-time">{commandService.formatTaskTime(task)}</span>
              </div>
              <div className="task-status-actions">
                <span className={`cp-tag ${commandTaskStatusTagClass[task.status]}`}>
                  {commandTaskStatusLabels[task.status]}
                </span>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost cp-btn-sm"
                  onClick={() => {
                    setSelectedCommandTaskId(task.id);
                    navigate("tasks");
                  }}
                >
                  查看日志
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
