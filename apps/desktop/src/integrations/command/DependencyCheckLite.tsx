import { useEffect, useState } from "react";
import { dependencyDetection } from "./dependencyDetection";
import type { DependencyItem, DependencyItemId } from "./dependencyTypes";

const statusLabels = {
  detected: "已检测到",
  not_detected: "未检测到",
  not_configured: "未配置",
  failed: "检测失败",
} as const;

type DependencyCheckLiteProps = {
  showKeywords?: boolean;
};

export function DependencyCheckLite({ showKeywords = false }: DependencyCheckLiteProps) {
  const [items, setItems] = useState<DependencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPaths, setCustomPaths] = useState<Partial<Record<DependencyItemId, string>>>({});

  async function refresh() {
    setLoading(true);
    try {
      const paths = await dependencyDetection.loadCustomPaths();
      setCustomPaths(paths);
      const detected = await dependencyDetection.detectAll(paths);
      setItems(detected);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSavePath(id: DependencyItemId, path: string) {
    const next = { ...customPaths, [id]: path };
    setCustomPaths(next);
    await dependencyDetection.saveCustomPath(id, path);
    await refresh();
  }

  return (
    <section className="cp-card dependency-check-panel dependency-check-lite" aria-label="依赖检测 Lite">
      <div className="cp-section-header">
        <div>
          <h2>依赖检测 Lite</h2>
          <p>检测 Git、Node.js、pnpm、Ollama 与 Agent CLI。不会自动安装或登录。</p>
        </div>
        <button type="button" className="cp-btn cp-btn-sm" disabled={loading} onClick={() => void refresh()}>
          重新检测
        </button>
      </div>

      <div className="dependency-check-list">
        {items.map((item) => (
          <article key={item.id} className="dependency-check-item">
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.detectCommand} {item.detectArgs.join(" ")}
              </span>
              {item.version && <span>版本：{item.version}</span>}
              {item.message && <span>{item.message}</span>}
            </div>
            <div className="dependency-check-actions">
              <span className="cp-tag cp-tag-muted">{statusLabels[item.status as keyof typeof statusLabels]}</span>
              {["codex", "cursor", "claude_code"].includes(item.id) && (
                <input
                  className="dependency-path-input"
                  placeholder="自定义 CLI 路径"
                  value={customPaths[item.id] ?? ""}
                  onChange={(event) =>
                    setCustomPaths((current) => ({ ...current, [item.id]: event.target.value }))
                  }
                  onBlur={(event) => void handleSavePath(item.id, event.target.value)}
                />
              )}
            </div>
          </article>
        ))}
      </div>

      {showKeywords && (
        <p className="dependency-lite-note">等待确认关键词请在任务监控页的依赖检测中配置。</p>
      )}
    </section>
  );
}
