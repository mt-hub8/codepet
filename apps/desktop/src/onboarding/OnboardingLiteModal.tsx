import { useCallback, useEffect, useState } from "react";
import { useApp } from "../app/AppProvider";
import { ollamaRecommendedModels } from "../integrations/command/dependencyErrorMessages";
import { dependencyDetection } from "../integrations/command/dependencyDetection";
import type { DependencyItem } from "../integrations/command/dependencyTypes";
import { calculateNextTrigger, nowIso } from "../reminders/reminderTime";

const STEPS = [
  {
    id: "welcome",
    title: "欢迎使用 CodePet",
    body: [
      "CodePet 是一个本地优先的 AI 桌面伙伴。",
      "你可以用它做提醒、本地 AI、任务监控和桌宠陪伴。",
      "默认不上传你的代码、命令、日志、聊天、提醒和宠物素材。",
    ],
  },
  {
    id: "basics",
    title: "基础功能说明",
    body: [
      "以下功能零配置即可使用：",
      "· 桌宠悬浮窗口",
      "· 喝水 / 休息 / 学习 / 工作提醒",
      "· 自定义提示音",
      "· 本地宠物素材导入",
      "这些功能不需要安装 Ollama、Codex、Cursor 或 Claude Code。",
    ],
  },
  {
    id: "pet",
    title: "选择基础桌宠",
    body: ["选择当前桌宠，或稍后在角色页导入自定义素材。"],
  },
  {
    id: "reminder",
    title: "创建第一个提醒",
    body: [
      "首次启动已为你创建默认喝水、休息、学习与收尾提醒。",
      "你也可以使用下方模板快速添加，或稍后在提醒页修改。",
    ],
  },
  {
    id: "ollama",
    title: "检测 Ollama",
    body: [
      "Ollama 是可选的本地 AI 依赖。",
      "没有 Ollama 时，CodePet 仍然可以作为提醒和桌宠工具使用。",
      "如需本地 AI，请安装 Ollama 并拉取模型。",
    ],
  },
  {
    id: "agent",
    title: "检测 Agent CLI",
    body: [
      "Git、Node.js、pnpm、Codex、Cursor、Claude Code 均为可选能力。",
      "未安装不会影响基础使用，只有任务监控 / Agent 接管提醒需要这些工具。",
    ],
  },
  {
    id: "tasks",
    title: "介绍任务监控",
    body: [
      "你可以监控 pnpm build、pnpm test、mvn test、pytest 等命令。",
      "也可以监控 Codex / Cursor / Claude Code 执行状态。",
      "当任务完成、失败、等待确认、长时间无输出时，CodePet 会提醒你。",
    ],
  },
  {
    id: "done",
    title: "完成",
    body: [
      "CodePet 已准备好。",
      "你可以从首页查看提醒、任务、本地 AI 和桌宠状态。",
      "所有高级能力都可以在设置里继续配置。",
    ],
  },
] as const;

const REMINDER_TEMPLATES = [
  { id: "water", title: "每 60 分钟喝水", intervalMinutes: 60, reminderType: "water" as const },
  { id: "rest", title: "每 45 分钟休息", intervalMinutes: 45, reminderType: "rest" as const },
  { id: "study", title: "每 50 分钟专注学习", intervalMinutes: 50, reminderType: "study" as const },
  { id: "wrap", title: "每天 23:30 收尾提醒", fixedTime: "23:30", reminderType: "rest" as const },
];

export function OnboardingLiteModal() {
  const {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    navigate,
    handleSetCurrentPet,
    currentPetId,
    petAssets,
    reminders,
    handleSaveReminder,
    handleDetectOllama,
    ollamaStatus,
    isCheckingOllama,
    localAiSettings,
    handleCreateCommandTask,
  } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [agentItems, setAgentItems] = useState<DependencyItem[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const step = STEPS[stepIndex];
  const hasDefaultReminders = reminders.some((item) => item.id.startsWith("default-"));

  const detectAgentItems = useCallback(async () => {
    setAgentLoading(true);
    try {
      const paths = await dependencyDetection.loadCustomPaths();
      const detected = await dependencyDetection.detectAll(paths);
      setAgentItems(
        detected.filter((item) =>
          ["git", "node", "pnpm", "codex", "cursor", "claude_code"].includes(item.id),
        ),
      );
    } finally {
      setAgentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showOnboarding) {
      setStepIndex(0);
    }
  }, [showOnboarding]);

  useEffect(() => {
    if (showOnboarding && step.id === "agent") {
      void detectAgentItems();
    }
  }, [detectAgentItems, showOnboarding, step.id]);

  const handleFinish = useCallback(
    async (skipped: boolean) => {
      await completeOnboarding({ skipped });
      setShowOnboarding(false);
      if (step.id === "done") {
        navigate("home");
      }
    },
    [completeOnboarding, navigate, setShowOnboarding, step.id],
  );

  if (!showOnboarding) {
    return null;
  }

  const handleNext = async () => {
    if (step.id === "done") {
      await handleFinish(false);
      return;
    }
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSkipAll = async () => {
    await handleFinish(true);
  };

  const handleSkipStep = () => {
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  async function handleCreateTestTask() {
    setCreatingTask(true);
    try {
      await handleCreateCommandTask({
        title: "新手引导测试任务（草稿）",
        adapterType: "generic",
        workingDirectory: ".",
        command: "echo",
        argsText: "CodePet onboarding test",
      });
      navigate("tasks");
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleAddTemplate(template: (typeof REMINDER_TEMPLATES)[number]) {
    if (hasDefaultReminders) {
      return;
    }
    const base = {
      id: `onboarding-${template.id}`,
      title: template.title,
      reminderType: template.reminderType,
      mode: ("fixedTime" in template ? "fixed_time" : "interval") as "interval" | "fixed_time",
      intervalMinutes: "intervalMinutes" in template ? template.intervalMinutes : undefined,
      fixedTime: "fixedTime" in template ? template.fixedTime : undefined,
      message: template.title,
      enabled: true,
      soundId: "default-beep",
      soundEnabled: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await handleSaveReminder({
      ...base,
      nextTriggerAt: calculateNextTrigger(base),
    });
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="新手引导">
      <section className="cp-card onboarding-card">
        <header>
          <span>
            步骤 {stepIndex + 1} / {STEPS.length}
          </span>
          <h2>{step.title}</h2>
          {step.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </header>

        {step.id === "pet" && (
          <div className="onboarding-pet-list">
            {petAssets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                className={`cp-btn cp-btn-sm ${currentPetId === pet.id ? "cp-btn-primary" : ""}`}
                onClick={() => void handleSetCurrentPet(pet.id)}
              >
                {pet.displayName}
              </button>
            ))}
            <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={() => navigate("characters")}>
              打开宠物素材库
            </button>
          </div>
        )}

        {step.id === "reminder" && (
          <div className="onboarding-actions-row">
            {hasDefaultReminders ? (
              <p className="onboarding-note">默认提醒已创建，可稍后在提醒页修改。</p>
            ) : (
              REMINDER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="cp-btn cp-btn-sm"
                  onClick={() => void handleAddTemplate(template)}
                >
                  {template.title}
                </button>
              ))
            )}
            <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={() => navigate("reminders")}>
              打开提醒页
            </button>
          </div>
        )}

        {step.id === "ollama" && (
          <div className="onboarding-ollama-block">
            <p>
              当前状态：
              {isCheckingOllama ? "检测中…" : ollamaStatus.status === "available" ? "可用" : "未配置 / 不可用"}
            </p>
            {ollamaStatus.models.length > 0 && (
              <p>已检测到 {ollamaStatus.models.length} 个本地模型</p>
            )}
            {localAiSettings.selectedModel && <p>默认模型：{localAiSettings.selectedModel}</p>}
            <p>
              推荐命令：
              <code>ollama pull {ollamaRecommendedModels[0]}</code>
            </p>
            <div className="onboarding-actions-row">
              <button type="button" className="cp-btn cp-btn-sm" disabled={isCheckingOllama} onClick={() => void handleDetectOllama()}>
                重新检测
              </button>
              <a className="cp-btn cp-btn-sm cp-btn-ghost" href="https://ollama.com/" target="_blank" rel="noreferrer">
                安装说明
              </a>
            </div>
          </div>
        )}

        {step.id === "agent" && (
          <div className="onboarding-agent-block">
            <div className="dependency-check-list">
              {agentItems.map((item) => (
                <article key={item.id} className="dependency-check-item">
                  <strong>{item.name}</strong>
                  <span className="cp-tag cp-tag-muted">
                    {item.status === "detected" ? "已检测到" : item.status === "not_configured" ? "未配置" : "未检测到"}
                  </span>
                  {item.version && <span>版本：{item.version}</span>}
                </article>
              ))}
            </div>
            <div className="onboarding-actions-row">
              <button type="button" className="cp-btn cp-btn-sm" disabled={agentLoading} onClick={() => void detectAgentItems()}>
                重新检测
              </button>
              <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={() => navigate("dependency-doctor")}>
                打开依赖诊断
              </button>
            </div>
          </div>
        )}

        {step.id === "tasks" && (
          <div className="onboarding-actions-row">
            <button
              type="button"
              className="cp-btn cp-btn-sm"
              disabled={creatingTask}
              onClick={() => void handleCreateTestTask()}
            >
              创建一个测试任务
            </button>
            <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={() => navigate("tasks")}>
              打开任务监控
            </button>
          </div>
        )}

        <footer className="onboarding-footer">
          <button type="button" className="cp-btn cp-btn-ghost" onClick={() => void handleSkipAll()}>
            {step.id === "welcome" ? "先跳过" : "跳过引导"}
          </button>
          {stepIndex > 0 && step.id !== "done" && (
            <button type="button" className="cp-btn" onClick={handleSkipStep}>
              稍后配置
            </button>
          )}
          <button type="button" className="cp-btn cp-btn-primary" onClick={() => void handleNext()}>
            {step.id === "welcome" ? "开始设置" : step.id === "done" ? "进入首页" : "下一步"}
          </button>
        </footer>
      </section>
    </div>
  );
}
