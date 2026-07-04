import { useMemo, useState } from "react";
import { useApp } from "../../app/AppProvider";
import { agentAdapterLabels } from "./agentAdapterTypes";
import { CommandLogViewer } from "./CommandLogViewer";
import { CommandTaskForm } from "./CommandTaskForm";
import { commandService } from "./commandService";
import { DependencyCheckPanel } from "./DependencyCheckPanel";
import {
  commandTaskStatusLabels,
  commandTaskStatusTagClass,
  type CommandTask,
} from "./commandTypes";

export function CommandTaskPanel() {
  const {
    commandTasks,
    commandEvents,
    selectedCommandTaskId,
    setSelectedCommandTaskId,
    refreshCommandTasks,
    handleCreateCommandTask,
    handleUpdateCommandTask,
    handleDeleteCommandTask,
    handleStartCommandTask,
    handleCancelCommandTask,
    handleRerunCommandTask,
    handleContinueWaitingCommandTask,
    handleSummarizeCommandFailure,
    handlePickWorkingDirectory,
    commandError,
    setCommandError,
    aiReady,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [editingTask, setEditingTask] = useState<CommandTask | null>(null);
  const [summaryError, setSummaryError] = useState("");

  const selectedTask = useMemo(
    () => commandTasks.find((task) => task.id === selectedCommandTaskId) ?? null,
    [commandTasks, selectedCommandTaskId],
  );

  const selectedEvents = selectedTask ? commandEvents[selectedTask.id] ?? [] : [];
  const isActive = selectedTask ? commandService.isActiveStatus(selectedTask.status) : false;

  async function openCreateForm() {
    setEditingTask(null);
    setShowForm(true);
    setCommandError("");
  }

  async function handleSubmit(input: CommandTask | Parameters<typeof handleCreateCommandTask>[0]) {
    if ("id" in input && "status" in input) {
      await handleUpdateCommandTask(input);
      setEditingTask(null);
      setShowForm(false);
      return;
    }
    const task = await handleCreateCommandTask(input);
    setSelectedCommandTaskId(task.id);
    setShowForm(false);
  }

  return (
    <div className="page-stack command-task-panel">
      <div className="cp-section-header">
        <div>
          <h2>命令任务</h2>
          <p>由你主动点击启动。CodePet 不会自动确认任何 Agent 权限请求。</p>
        </div>
        <div className="command-task-header-actions">
          <button
            type="button"
            className="cp-btn cp-btn-ghost cp-btn-sm"
            onClick={() => setShowDependencies((value) => !value)}
          >
            {showDependencies ? "收起依赖检测" : "依赖检测"}
          </button>
          <button type="button" className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => void openCreateForm()}>
            新建命令任务
          </button>
        </div>
      </div>

      {showDependencies && <DependencyCheckPanel />}

      {commandError && <p className="form-error">{commandError}</p>}

      {showForm && (
        <CommandTaskForm
          initial={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onPickDirectory={handlePickWorkingDirectory}
        />
      )}

      <div className="command-task-layout">
        <section className="cp-card command-task-list" aria-label="任务列表">
          {commandTasks.length === 0 ? (
            <div className="cp-empty">
              还没有命令任务。你可以创建一个 `pnpm build` 或 Agent CLI 任务。
            </div>
          ) : (
            <ul>
              {commandTasks.map((task) => (
                <li key={task.id} className={selectedTask?.id === task.id ? "active" : ""}>
                  <button
                    type="button"
                    className="command-task-list-item"
                    onClick={() => {
                      setSelectedCommandTaskId(task.id);
                      void refreshCommandTasks();
                    }}
                  >
                    <strong>{task.title}</strong>
                    <span>
                      {agentAdapterLabels[task.adapterType]} · {task.command}{" "}
                      {task.args?.join(" ") ?? ""}
                    </span>
                    <span className={`cp-tag ${commandTaskStatusTagClass[task.status]}`}>
                      {commandTaskStatusLabels[task.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cp-card command-task-detail" aria-label="任务详情">
          {!selectedTask ? (
            <div className="cp-empty">选择一个任务查看状态与日志。</div>
          ) : (
            <>
              <div className="command-task-detail-header">
                <div>
                  <h3>{selectedTask.title}</h3>
                  <p>
                    {agentAdapterLabels[selectedTask.adapterType]}
                    <br />
                    {selectedTask.workingDirectory}
                    <br />
                    {selectedTask.command} {selectedTask.args?.join(" ") ?? ""}
                  </p>
                </div>
                <span className={`cp-tag ${commandTaskStatusTagClass[selectedTask.status]}`}>
                  {commandTaskStatusLabels[selectedTask.status]}
                </span>
              </div>

              {selectedTask.status === "needs_user_input" && (
                <div className="command-alert-banner command-alert-warning">
                  外部 Agent 可能正在等待你确认。请回到终端手动处理，CodePet 不会替你确认。
                  <button
                    type="button"
                    className="cp-btn cp-btn-sm"
                    onClick={() => void handleContinueWaitingCommandTask(selectedTask)}
                  >
                    继续监控
                  </button>
                </div>
              )}

              {selectedTask.status === "no_output_timeout" && (
                <div className="command-alert-banner command-alert-timeout">
                  命令已超过 {selectedTask.noOutputTimeoutMinutes} 分钟没有新输出。进程仍在运行，你可以选择继续等待或取消。
                  <div className="command-task-actions">
                    <button
                      type="button"
                      className="cp-btn cp-btn-sm"
                      onClick={() => void handleContinueWaitingCommandTask(selectedTask)}
                    >
                      继续等待
                    </button>
                    <button
                      type="button"
                      className="cp-btn cp-btn-sm"
                      onClick={() => void handleCancelCommandTask(selectedTask)}
                    >
                      取消任务
                    </button>
                  </div>
                </div>
              )}

              <div className="command-task-meta">
                <span>创建：{commandService.formatTaskTime(selectedTask)}</span>
                {selectedTask.exitCode !== undefined && <span>退出码：{selectedTask.exitCode}</span>}
                <span>无输出超时：{selectedTask.noOutputTimeoutMinutes} 分钟</span>
              </div>

              <div className="command-task-actions">
                {isActive ? (
                  <button
                    type="button"
                    className="cp-btn cp-btn-sm"
                    onClick={() => void handleCancelCommandTask(selectedTask)}
                  >
                    取消任务
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cp-btn cp-btn-primary cp-btn-sm"
                    onClick={() => void handleStartCommandTask(selectedTask)}
                  >
                    启动任务
                  </button>
                )}
                <button
                  type="button"
                  className="cp-btn cp-btn-sm"
                  disabled={isActive}
                  onClick={() => void handleRerunCommandTask(selectedTask)}
                >
                  重新运行
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost cp-btn-sm"
                  onClick={() => {
                    setEditingTask(selectedTask);
                    setShowForm(true);
                  }}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost cp-btn-sm"
                  onClick={() => void handleDeleteCommandTask(selectedTask)}
                >
                  删除
                </button>
                {selectedTask.status === "failed" && (
                  <button
                    type="button"
                    className="cp-btn cp-btn-ghost cp-btn-sm"
                    disabled={!aiReady}
                    title={aiReady ? "手动触发本地 AI 总结" : "请先启用本地 AI"}
                    onClick={() => {
                      setSummaryError("");
                      void handleSummarizeCommandFailure(selectedTask).catch((error) => {
                        setSummaryError(error instanceof Error ? error.message : "总结失败");
                      });
                    }}
                  >
                    用本地 AI 总结失败原因
                  </button>
                )}
              </div>

              {summaryError && <p className="form-error">{summaryError}</p>}

              <details className="command-log-details">
                <summary>查看 stdout / stderr 日志</summary>
                <CommandLogViewer events={selectedEvents} />
              </details>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
