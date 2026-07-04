import { ActivePetRenderer } from "../characters/ActivePetRenderer";
import { petStateLabels } from "../pet/petState";
import { useApp } from "../app/AppProvider";

export function PetStatusCard() {
  const { displayedState, ollamaStatus, aiReady, currentPet } = useApp();

  const aiStatusText =
    ollamaStatus.status === "available"
      ? aiReady
        ? "本地 AI 可用"
        : "Ollama 已连接，待启用模型"
      : ollamaStatus.status === "checking"
        ? "正在检测 Ollama…"
        : "Ollama 未连接";

  return (
    <section className="cp-card pet-status-card" aria-label="桌宠状态">
      <div className="pet-status-card-top">
        <ActivePetRenderer state={displayedState} pet={currentPet} scale={0.38} />
        <div className="pet-status-meta">
          <strong>{currentPet.displayName}</strong>
          <span className="pet-status-online">在线</span>
        </div>
      </div>
      <p className="pet-status-detail">
        当前状态：{petStateLabels[displayedState]} · {aiStatusText}
      </p>
    </section>
  );
}
