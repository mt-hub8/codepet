import { useEffect, useState } from "react";
import { useApp } from "../app/AppProvider";
import { DiagnosticsPanel } from "../diagnostics/DependencyDoctorPage";
import { diagnosticsService } from "../diagnostics/diagnosticsService";
import { dependencyDetection } from "../integrations/command/dependencyDetection";
import { AGENT_TOOL_SETTING_KEYS } from "../integrations/command/dependencyTypes";
import { dependencyStorage } from "../integrations/command/dependencyStorage";
import { BasicMemoryPanel } from "../memory/BasicMemoryPanel";
import { OllamaSettingsPanel } from "../integrations/ollama/OllamaSettingsPanel";

export function SettingsPage() {
  const {
    isAlwaysOnTop,
    togglePin,
    setShowOnboarding,
    navigate,
    localAiSettings,
    setLocalAiSettings,
    ollamaStatus,
    isCheckingOllama,
    isRemoteBaseUrl,
    handleDetectOllama,
    handleSaveLocalAiSettings,
    currentPet,
    basicMemories,
    refreshBasicMemories,
    handleDeleteBasicMemory,
  } = useApp();
  const [customPaths, setCustomPaths] = useState<Partial<Record<string, string>>>({});
  const [lastScanAt, setLastScanAt] = useState<string | undefined>();

  useEffect(() => {
    void dependencyDetection.loadCustomPaths().then(setCustomPaths);
    void dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.lastDependencyScanAt).then((value) => {
      setLastScanAt(value ?? undefined);
    });
  }, []);

  async function handleSaveAgentPath(key: string, path: string) {
    const id = key as "codex" | "cursor" | "claude_code";
    await dependencyDetection.saveCustomPath(id, path);
    const paths = await dependencyDetection.loadCustomPaths();
    setCustomPaths(paths);
  }

  async function handleOpenDataDir() {
    const info = await diagnosticsService.getInfo();
    await diagnosticsService.openPath(info.dataDir);
  }

  async function handleOpenLogsDir() {
    const info = await diagnosticsService.getInfo();
    await diagnosticsService.openPath(info.logsDir);
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>设置</h1>
        <p>基础偏好、本地 AI、Agent 工具、宠物素材与隐私数据。</p>
      </header>

      <section className="cp-card settings-section">
        <h2>基础设置</h2>
        <p>窗口置顶与新手引导。当前界面语言为中文。</p>
        <div className="settings-actions-row">
          <button type="button" className="cp-btn" onClick={() => void togglePin()}>
            {isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
          </button>
          <button type="button" className="cp-btn" onClick={() => setShowOnboarding(true)}>
            重新打开新手引导
          </button>
        </div>
      </section>

      <section className="cp-card settings-section">
        <h2>本地 AI</h2>
        <OllamaSettingsPanel
          settings={localAiSettings}
          status={ollamaStatus}
          isChecking={isCheckingOllama}
          isRemoteBaseUrl={isRemoteBaseUrl}
          onSettingsChange={setLocalAiSettings}
          onSave={handleSaveLocalAiSettings}
          onDetect={handleDetectOllama}
        />
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("dependency-doctor")}>
          打开依赖诊断
        </button>
      </section>

      <section className="cp-card settings-section">
        <h2>Agent 工具</h2>
        <p>配置 Codex / Cursor / Claude Code CLI 路径。未配置不影响提醒与桌宠。</p>
        <div className="settings-agent-paths">
          {(
            [
              { id: "codex", label: "Codex CLI 路径" },
              { id: "cursor", label: "Cursor CLI 路径" },
              { id: "claude_code", label: "Claude Code CLI 路径" },
            ] as const
          ).map((item) => (
            <label key={item.id}>
              {item.label}
              <input
                className="dependency-path-input"
                value={customPaths[item.id] ?? ""}
                placeholder="留空则自动检测 PATH"
                onChange={(event) =>
                  setCustomPaths((current) => ({ ...current, [item.id]: event.target.value }))
                }
                onBlur={(event) => void handleSaveAgentPath(item.id, event.target.value)}
              />
            </label>
          ))}
        </div>
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("dependency-doctor")}>
          依赖检测
        </button>
      </section>

      <section className="cp-card settings-section">
        <h2>宠物与素材</h2>
        <p>当前桌宠：{currentPet.displayName}</p>
        <div className="settings-actions-row">
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("characters")}>
            打开宠物素材库
          </button>
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("pet-hatch")}>
            打开宠物孵化向导
          </button>
        </div>
      </section>

      <section className="cp-card settings-section">
        <h2>隐私与数据</h2>
        <p>数据与日志均保存在本机，不会上传。</p>
        <div className="settings-actions-row">
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleOpenDataDir()}>
            打开数据目录
          </button>
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleOpenLogsDir()}>
            打开日志目录
          </button>
        </div>
        <BasicMemoryPanel
          memories={basicMemories}
          onRefresh={refreshBasicMemories}
          onDelete={handleDeleteBasicMemory}
        />
      </section>

      <DiagnosticsPanel lastDependencyScanAt={lastScanAt} compact />
    </div>
  );
}
