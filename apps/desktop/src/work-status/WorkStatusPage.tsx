import { useMemo } from "react";
import { useApp } from "../app/AppProvider";
import {
  buildWorkEvents,
  buildWorkOverview,
  buildWorkSuggestions,
} from "./workStatusService";

export function WorkStatusPage() {
  const {
    events,
    reminders,
    commandTasks,
    localAiSettings,
    currentPet,
    displayedState,
    navigate,
  } = useApp();

  const overview = useMemo(
    () =>
      buildWorkOverview({
        reminderEvents: events,
        commandTasks,
        localAiEnabled: localAiSettings.enabled,
        currentPetName: currentPet.displayName,
        currentPetState: displayedState,
      }),
    [events, commandTasks, localAiSettings.enabled, currentPet.displayName, displayedState],
  );

  const workEvents = useMemo(
    () => buildWorkEvents({ reminderEvents: events, reminders, commandTasks }),
    [events, reminders, commandTasks],
  );

  const suggestions = useMemo(() => buildWorkSuggestions(overview), [overview]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="page-header-with-back">
          <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("home")}>
            返回首页
          </button>
          <div>
            <h1>工作状态中心</h1>
            <p>轻量汇总今日提醒、命令任务与桌宠状态，不做复杂统计。</p>
          </div>
        </div>
      </header>

      <section className="cp-card work-status-overview">
        <h2>今日概览</h2>
        <div className="work-status-metrics">
          <div><strong>{overview.completedReminders}</strong><span>已完成提醒</span></div>
          <div><strong>{overview.ignoredReminders}</strong><span>忽略/稍后</span></div>
          <div><strong>{overview.commandTasksRun}</strong><span>执行任务</span></div>
          <div><strong>{overview.failedTasks}</strong><span>失败任务</span></div>
          <div><strong>{overview.waitingConfirmCount}</strong><span>等待确认</span></div>
        </div>
        <p className="work-status-meta">
          本地 AI：{overview.localAiEnabled ? "已启用" : "未启用"}
          {overview.currentPetName ? ` · 当前桌宠：${overview.currentPetName}` : ""}
          {overview.currentPetState ? ` · 状态：${overview.currentPetState}` : ""}
        </p>
      </section>

      <section className="cp-card work-status-suggestions">
        <h2>今日建议</h2>
        <ul>
          {suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="cp-card work-status-events">
        <h2>最近事件流</h2>
        {workEvents.length === 0 ? (
          <div className="cp-empty">今天还没有记录到事件。</div>
        ) : (
          <div className="work-event-list">
            {workEvents.map((event) => (
              <article key={event.id} className="work-event-item">
                <div>
                  <strong>{event.title}</strong>
                  {event.detail && <span>{event.detail}</span>}
                </div>
                <time>{new Date(event.createdAt).toLocaleString()}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
