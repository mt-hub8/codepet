import { PetStatusPanel } from "../pet/PetStatusPanel";
import { useApp } from "../app/AppProvider";
import { DependencyCheckLite } from "../integrations/command/DependencyCheckLite";
import { BasicMemoryPanel } from "../memory/BasicMemoryPanel";

export function SettingsPage() {
  const {
    isAlwaysOnTop,
    togglePin,
    manualPetState,
    setManualPetState,
    basicMemories,
    refreshBasicMemories,
    handleDeleteBasicMemory,
    setShowOnboarding,
  } = useApp();

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>设置</h1>
        <p>窗口、依赖检测、基础记忆与本地模式相关设置。</p>
      </header>

      <section className="cp-card settings-section">
        <h2>窗口</h2>
        <p>拖动标题栏可移动窗口。关闭窗口会隐藏到系统托盘。</p>
        <button type="button" className="cp-btn" onClick={() => void togglePin()}>
          {isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
        </button>
      </section>

      <section className="cp-card settings-section">
        <h2>新手引导</h2>
        <p>可随时重新打开轻量引导，每步都可跳过。</p>
        <button type="button" className="cp-btn" onClick={() => setShowOnboarding(true)}>
          重新打开新手引导
        </button>
      </section>

      <DependencyCheckLite />

      <BasicMemoryPanel
        memories={basicMemories}
        onRefresh={refreshBasicMemories}
        onDelete={handleDeleteBasicMemory}
      />

      <section className="cp-card settings-section">
        <h2>桌宠状态测试</h2>
        <p>用于开发阶段手动切换桌宠状态，验证气泡与视觉反馈。</p>
        <PetStatusPanel currentState={manualPetState} onChange={setManualPetState} />
      </section>

      <section className="cp-card settings-section">
        <h2>账户</h2>
        <p>当前为本地模式。Pro 会员与云同步功能尚未开放。</p>
        <span className="user-card-badge">本地模式 · 张小北</span>
      </section>
    </div>
  );
}
