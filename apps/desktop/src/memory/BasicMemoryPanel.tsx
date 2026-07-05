import { useEffect, useState } from "react";
import { basicMemoryTypeLabels, type BasicMemory } from "../memory/memoryTypes";

type BasicMemoryPanelProps = {
  memories: BasicMemory[];
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function BasicMemoryPanel({ memories, onRefresh, onDelete }: BasicMemoryPanelProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="cp-card basic-memory-panel">
      <div className="cp-section-header">
        <div>
          <h2>基础行为记忆</h2>
          <p>仅保存轻量偏好与最近行为，不做向量记忆或敏感画像。</p>
        </div>
        <button type="button" className="cp-btn cp-btn-sm" disabled={loading} onClick={() => void refresh()}>
          刷新
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="cp-empty">还没有记录到基础记忆。</div>
      ) : (
        <div className="basic-memory-list">
          {memories.map((item) => (
            <article key={item.id} className="basic-memory-item">
              <div>
                <strong>{item.key}</strong>
                <span>{basicMemoryTypeLabels[item.type]}</span>
                <span>{item.value}</span>
                <span>来源：{item.source}</span>
              </div>
              <button type="button" className="cp-btn cp-btn-danger cp-btn-sm" onClick={() => void onDelete(item.id)}>
                删除
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
