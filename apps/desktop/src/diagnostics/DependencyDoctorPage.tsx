import { useCallback, useEffect, useState } from "react";
import { useApp } from "../app/AppProvider";
import { diagnosticsService } from "../diagnostics/diagnosticsService";
import { dependencyDoctor } from "../integrations/command/dependencyDoctor";
import {
  doctorCategoryLabels,
  doctorStatusLabels,
  type DoctorDependencyItem,
  type DoctorScanResult,
} from "../integrations/command/dependencyDoctorTypes";
import type { DependencyItemId } from "../integrations/command/dependencyTypes";
import { AGENT_TOOL_SETTING_KEYS } from "../integrations/command/dependencyTypes";
import { dependencyStorage } from "../integrations/command/dependencyStorage";

type DependencyDoctorPanelProps = {
  compact?: boolean;
};

export function DependencyDoctorPanel({ compact = false }: DependencyDoctorPanelProps) {
  const { localAiSettings, currentPetId, error, setError } = useApp();
  const [result, setResult] = useState<DoctorScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPaths, setCustomPaths] = useState<Partial<Record<DependencyItemId, string>>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const paths = await dependencyDoctor.loadCustomPaths();
      setCustomPaths(paths);
      const scan = await dependencyDoctor.scan({
        localAiSettings,
        currentPetId,
      });
      setResult(scan);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "依赖检测失败");
    } finally {
      setLoading(false);
    }
  }, [currentPetId, localAiSettings, setError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSavePath(id: DependencyItemId, path: string) {
    await dependencyDoctor.saveCustomPath(id, path);
    await refresh();
  }

  async function handleClearCache() {
    await dependencyDoctor.clearDetectionCache();
    await refresh();
  }

  const grouped = (result?.items ?? []).reduce<Record<string, DoctorDependencyItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <section className={`cp-card dependency-doctor-panel ${compact ? "dependency-doctor-compact" : ""}`}>
      <div className="cp-section-header">
        <div>
          <h2>{compact ? "依赖检测" : "依赖诊断"}</h2>
          <p>只读检测，不会自动安装、登录或拉取模型。检测失败不影响提醒与桌宠。</p>
        </div>
        <div className="dependency-doctor-actions">
          <button type="button" className="cp-btn cp-btn-sm" disabled={loading} onClick={() => void refresh()}>
            {loading ? "检测中…" : "重新检测"}
          </button>
          {!compact && (
            <button type="button" className="cp-btn cp-btn-sm cp-btn-ghost" onClick={() => void handleClearCache()}>
              清除检测缓存
            </button>
          )}
        </div>
      </div>

      {result?.scannedAt && (
        <p className="dependency-doctor-meta">最近检测：{new Date(result.scannedAt).toLocaleString()}</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="dependency-doctor-group">
          <h3>{doctorCategoryLabels[category as keyof typeof doctorCategoryLabels]}</h3>
          <div className="dependency-check-list">
            {items.map((item) => (
              <article key={item.id} className="dependency-check-item">
                <div>
                  <strong>{item.name}</strong>
                  <span className="dependency-detect-cmd">{item.detectCommand}</span>
                  {item.version && <span>版本：{item.version}</span>}
                  {item.problem && <span className="dependency-problem">{item.problem}</span>}
                  {item.fixSuggestion && <span className="dependency-fix">{item.fixSuggestion}</span>}
                </div>
                <div className="dependency-check-actions">
                  <span className={`cp-tag cp-tag-muted status-${item.status}`}>
                    {doctorStatusLabels[item.status]}
                  </span>
                  {["codex", "cursor", "claude_code"].includes(item.id) && (
                    <input
                      className="dependency-path-input"
                      placeholder="自定义 CLI 路径"
                      value={customPaths[item.id as DependencyItemId] ?? item.customPath ?? ""}
                      onChange={(event) =>
                        setCustomPaths((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      onBlur={(event) =>
                        void handleSavePath(item.id as DependencyItemId, event.target.value)
                      }
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="dependency-doctor-error">{error}</p>}
    </section>
  );
}

export function DependencyDoctorPage() {
  const { navigate } = useApp();
  const [lastScanAt, setLastScanAt] = useState<string | undefined>();

  useEffect(() => {
    void dependencyStorage.getSetting(AGENT_TOOL_SETTING_KEYS.lastDependencyScanAt).then((value) => {
      setLastScanAt(value ?? undefined);
    });
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>依赖诊断</h1>
        <p>查看 Git、Node.js、pnpm、Ollama 与 Agent CLI 状态，以及应用数据与日志目录。</p>
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("settings")}>
          返回设置
        </button>
      </header>

      <DependencyDoctorPanel />
      <DiagnosticsPanel lastDependencyScanAt={lastScanAt} />
    </div>
  );
}

type DiagnosticsPanelProps = {
  lastDependencyScanAt?: string;
  compact?: boolean;
};

export function DiagnosticsPanel({ lastDependencyScanAt, compact = false }: DiagnosticsPanelProps) {
  const {
    localAiSettings,
    currentPetId,
    ollamaStatus,
    error,
    setError,
    navigate,
  } = useApp();
  const [info, setInfo] = useState<Awaited<ReturnType<typeof diagnosticsService.getInfo>> | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void diagnosticsService.getInfo().then(setInfo).catch(() => setInfo(null));
  }, []);

  async function handleCopy() {
    if (!info) {
      return;
    }
    const report = diagnosticsService.buildSanitizedReport({
      appVersion: info.appVersion,
      osName: info.osName,
      dataDir: info.dataDir,
      logsDir: info.logsDir,
      ollamaBaseUrl: localAiSettings.baseUrl,
      selectedModel: localAiSettings.selectedModel,
      currentPetId,
      lastDependencyScanAt,
      lastErrorSummary: error || ollamaStatus.errorMessage,
      aiEnabled: localAiSettings.enabled,
    });
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleOpen(path?: string) {
    if (!path) {
      return;
    }
    try {
      await diagnosticsService.openPath(path);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "打开目录失败");
    }
  }

  if (!info) {
    return null;
  }

  return (
    <section className={`cp-card diagnostics-panel ${compact ? "diagnostics-compact" : ""}`}>
      <div className="cp-section-header">
        <div>
          <h2>诊断信息</h2>
          <p>复制内容已脱敏，不包含命令日志、聊天记录或提醒正文。</p>
        </div>
        <div className="diagnostics-actions">
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleCopy()}>
            {copied ? "已复制" : "复制诊断信息"}
          </button>
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => navigate("dependency-doctor")}>
            重新检测依赖
          </button>
        </div>
      </div>

      <dl className="diagnostics-grid">
        <div><dt>应用版本</dt><dd>{info.appVersion}</dd></div>
        <div><dt>操作系统</dt><dd>{info.osName}</dd></div>
        <div><dt>数据目录</dt><dd>{diagnosticsService.sanitizePath(info.dataDir)}</dd></div>
        <div><dt>日志目录</dt><dd>{diagnosticsService.sanitizePath(info.logsDir)}</dd></div>
        <div><dt>Ollama 地址</dt><dd>{localAiSettings.baseUrl}</dd></div>
        <div><dt>默认模型</dt><dd>{localAiSettings.selectedModel ?? "未设置"}</dd></div>
        <div><dt>当前桌宠</dt><dd>{currentPetId}</dd></div>
        <div><dt>最近依赖检测</dt><dd>{lastDependencyScanAt ? new Date(lastDependencyScanAt).toLocaleString() : "未检测"}</dd></div>
        {(error || ollamaStatus.errorMessage) && (
          <div className="diagnostics-error-row">
            <dt>最近错误摘要</dt>
            <dd>{error || ollamaStatus.errorMessage}</dd>
          </div>
        )}
      </dl>

      <div className="diagnostics-open-actions">
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleOpen(info.logsDir)}>
          打开日志目录
        </button>
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleOpen(info.dataDir)}>
          打开数据目录
        </button>
      </div>
    </section>
  );
}
