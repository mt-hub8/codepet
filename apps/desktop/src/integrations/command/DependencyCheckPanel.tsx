import { useEffect, useState } from "react";
import { DEFAULT_NEEDS_USER_INPUT_KEYWORDS } from "./commandDetection";
import { dependencyDetection } from "./dependencyDetection";
import type { DependencyItem, DependencyItemId } from "./dependencyTypes";

const statusLabels = {
  detected: "已检测到",
  not_detected: "未检测到",
  not_configured: "未配置",
  failed: "检测失败",
} as const;

export function DependencyCheckPanel() {
  const [items, setItems] = useState<DependencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keywordsText, setKeywordsText] = useState(DEFAULT_NEEDS_USER_INPUT_KEYWORDS.join("\n"));
  const [customPaths, setCustomPaths] = useState<Partial<Record<DependencyItemId, string>>>({});

  async function refresh() {
    setLoading(true);
    try {
      const paths = await dependencyDetection.loadCustomPaths();
      setCustomPaths(paths);
      const detected = await dependencyDetection.detectAll(paths);
      setItems(detected);
      const keywords = await dependencyDetection.loadKeywords();
      if (keywords.length > 0) {
        setKeywordsText(keywords.join("\n"));
      }
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

  async function handleSaveKeywords() {
    const keywords = keywordsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    await dependencyDetection.saveKeywords(keywords);
  }

  return (
    <section className="cp-card dependency-check-panel" aria-label="依赖检测">
      <div className="cp-section-header">
        <div>
          <h2>依赖检测</h2>
          <p>检测失败不会影响 CodePet 使用，也不会自动安装任何工具。</p>
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
              <span className={`cp-tag cp-tag-muted`}>{statusLabels[item.status]}</span>
              {["codex", "cursor", "claude_code"].includes(item.id) && (
                <input
                  className="dependency-path-input"
                  placeholder="自定义 CLI 路径（可选）"
                  value={customPaths[item.id] ?? ""}
                  onChange={(event) =>
                    setCustomPaths((current) => ({ ...current, [item.id]: event.target.value }))
                  }
                  onBlur={() => void handleSavePath(item.id, customPaths[item.id] ?? "")}
                />
              )}
            </div>
          </article>
        ))}
      </div>

      <label className="dependency-keywords-field">
        等待确认关键词（每行一个，可自定义）
        <textarea
          value={keywordsText}
          onChange={(event) => setKeywordsText(event.target.value)}
          rows={5}
        />
        <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handleSaveKeywords()}>
          保存关键词
        </button>
      </label>
    </section>
  );
}
