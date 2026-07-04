import { useApp } from "../app/AppProvider";

export function RecentTaskStatusSection() {
  const { navigate } = useApp();

  return (
    <section className="cp-section" aria-label="最近任务状态">
      <div className="cp-section-header">
        <div>
          <h2>最近任务状态</h2>
          <p>任务监控将在 V0.4 开放</p>
        </div>
        <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("tasks")}>
          进入任务监控
        </button>
      </div>

      <div className="cp-empty">
        任务监控将在 V0.4 开放。当前你可以先使用提醒和本地 AI。
      </div>
    </section>
  );
}
