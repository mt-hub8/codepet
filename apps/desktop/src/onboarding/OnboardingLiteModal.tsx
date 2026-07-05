import { useState } from "react";
import { useApp } from "../app/AppProvider";
import { DependencyCheckLite } from "../integrations/command/DependencyCheckLite";

const STEPS = [
  { id: "welcome", title: "欢迎使用 CodePet", body: "这是一个本地优先的桌宠提醒与编码陪伴工具。" },
  { id: "pet", title: "选择基础桌宠", body: "默认已提供原创占位桌宠，你也可以稍后在角色页导入自定义素材。" },
  { id: "reminder", title: "创建第一个提醒", body: "建议先保留默认喝水/休息提醒，或到提醒页新建一条。" },
  { id: "ollama", title: "检测 Ollama", body: "本地 AI 可选项。没有 Ollama 也可以正常使用提醒与命令监控。" },
  { id: "agent", title: "检测 Agent CLI", body: "Codex / Cursor / Claude Code 均为可选项，可跳过。" },
  { id: "tasks", title: "命令监控", body: "你可以在任务监控页手动启动命令，CodePet 只负责监控与提醒。" },
  { id: "pets", title: "宠物素材导入", body: "若已有 pet.json + spritesheet，可在角色页导入；也可用孵化向导生成提示词。" },
  { id: "done", title: "进入首页", body: "准备完成，开始使用 CodePet。" },
] as const;

export function OnboardingLiteModal() {
  const {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    navigate,
    handleSetCurrentPet,
    currentPetId,
    petAssets,
  } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  if (!showOnboarding) {
    return null;
  }

  const step = STEPS[stepIndex];

  const handleNext = async () => {
    if (step.id === "done") {
      await completeOnboarding();
      setShowOnboarding(false);
      navigate("home");
      return;
    }
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSkip = async () => {
    await completeOnboarding();
    setShowOnboarding(false);
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="新手引导">
      <section className="cp-card onboarding-card">
        <header>
          <span>
            步骤 {stepIndex + 1} / {STEPS.length}
          </span>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
        </header>

        {step.id === "pet" && (
          <div className="onboarding-pet-list">
            {petAssets.slice(0, 3).map((pet) => (
              <button
                key={pet.id}
                type="button"
                className={`cp-btn cp-btn-sm ${currentPetId === pet.id ? "cp-btn-primary" : ""}`}
                onClick={() => void handleSetCurrentPet(pet.id)}
              >
                {pet.displayName}
              </button>
            ))}
          </div>
        )}

        {step.id === "reminder" && (
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("reminders")}>
            打开提醒页
          </button>
        )}

        {step.id === "ollama" && (
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("local-ai")}>
            打开本地 AI 设置
          </button>
        )}

        {step.id === "agent" && <DependencyCheckLite />}

        {step.id === "tasks" && (
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("tasks")}>
            打开任务监控
          </button>
        )}

        {step.id === "pets" && (
          <div className="onboarding-actions-row">
            <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("characters")}>
              去导入宠物
            </button>
            <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("pet-hatch")}>
              打开孵化向导
            </button>
          </div>
        )}

        <footer className="onboarding-footer">
          <button type="button" className="cp-btn" onClick={() => void handleSkip()}>
            跳过引导
          </button>
          <button type="button" className="cp-btn cp-btn-primary" onClick={() => void handleNext()}>
            {step.id === "done" ? "进入首页" : "下一步"}
          </button>
        </footer>
      </section>
    </div>
  );
}
