import { useMemo } from "react";
import { useApp } from "../app/AppProvider";
import { buildWorkOverview, buildWorkSuggestions } from "./workStatusService";

export function WorkStatusSummarySection() {
  const { events, commandTasks, localAiSettings, navigate } = useApp();

  const overview = useMemo(
    () =>
      buildWorkOverview({
        reminderEvents: events,
        commandTasks,
        localAiEnabled: localAiSettings.enabled,
      }),
    [events, commandTasks, localAiSettings.enabled],
  );

  const topSuggestion = useMemo(() => buildWorkSuggestions(overview)[0], [overview]);

  return (
    <section className="cp-section" aria-label="今日工作状态摘要">
      <div className="cp-section-header">
        <div>
          <h2>今日工作状态</h2>
          <p>{topSuggestion}</p>
        </div>
        <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("work-status")}>
          查看详情
        </button>
      </div>
      <div className="work-status-summary-grid">
        <span>提醒完成 {overview.completedReminders}</span>
        <span>任务执行 {overview.commandTasksRun}</span>
        <span>失败 {overview.failedTasks}</span>
        <span>等待确认 {overview.waitingConfirmCount}</span>
      </div>
    </section>
  );
}
