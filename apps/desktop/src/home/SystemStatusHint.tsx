import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppProvider";
import { memoryService } from "../memory/memoryService";
import { dependencyDetection } from "../integrations/command/dependencyDetection";

export function SystemStatusHint() {
  const {
    navigate,
    showOnboarding,
    localAiSettings,
    ollamaStatus,
    commandTasks,
    setShowOnboarding,
  } = useApp();
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false);
  const [agentConfigured, setAgentConfigured] = useState(true);

  useEffect(() => {
    if (showOnboarding) {
      setOnboardingIncomplete(true);
      return;
    }
    void memoryService.isOnboardingCompleted().then((completed) => {
      setOnboardingIncomplete(!completed);
    });
  }, [showOnboarding]);

  useEffect(() => {
    void dependencyDetection.loadCustomPaths().then((paths) => {
      const hasAgentPath = Boolean(paths.codex || paths.cursor || paths.claude_code);
      setAgentConfigured(hasAgentPath);
    });
  }, []);

  const waitingConfirmCount = commandTasks.filter((task) => task.status === "needs_user_input").length;

  const hints = useMemo(() => {
    const items: Array<{ id: string; message: string; action: string; onClick: () => void }> = [];

    if (onboardingIncomplete) {
      items.push({
        id: "onboarding",
        message: "新手引导尚未完成",
        action: "继续引导",
        onClick: () => setShowOnboarding(true),
      });
    }

    if (!localAiSettings.enabled || ollamaStatus.status !== "available") {
      items.push({
        id: "ai",
        message: "本地 AI 未配置",
        action: "去设置",
        onClick: () => navigate("local-ai"),
      });
    }

    if (!agentConfigured) {
      items.push({
        id: "agent",
        message: "Agent 工具未配置",
        action: "去诊断",
        onClick: () => navigate("dependency-doctor"),
      });
    }

    if (waitingConfirmCount > 0) {
      items.push({
        id: "confirm",
        message: `有 ${waitingConfirmCount} 个任务等待确认`,
        action: "查看任务",
        onClick: () => navigate("tasks"),
      });
    }

    return items.slice(0, 2);
  }, [
    agentConfigured,
    localAiSettings.enabled,
    navigate,
    ollamaStatus.status,
    onboardingIncomplete,
    setShowOnboarding,
    waitingConfirmCount,
  ]);

  if (hints.length === 0) {
    return null;
  }

  return (
    <section className="system-status-hint" aria-label="系统状态提示">
      {hints.map((hint) => (
        <div key={hint.id} className="system-status-hint-item">
          <span>{hint.message}</span>
          <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={hint.onClick}>
            {hint.action}
          </button>
        </div>
      ))}
    </section>
  );
}
