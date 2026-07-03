const plannedModules = [
  "reminders",
  "tasks",
  "characters",
  "personas",
  "skills",
  "memory",
  "workflows",
  "integrations",
  "storage",
];

export function App() {
  return (
    <main className="shell">
      <section className="intro" aria-labelledby="app-title">
        <p className="eyebrow">V0.0 Open Source Product Skeleton</p>
        <h1 id="app-title">CodePet</h1>
        <p className="summary">
          本地优先、轻量、可扩展的 AI 桌面伙伴。当前版本只验证桌面窗口和工程骨架，
          暂不实现提醒、模型、记忆或外部 Agent 接入。
        </p>
      </section>

      <section className="status" aria-label="当前状态">
        <div>
          <span className="status-label">当前阶段</span>
          <strong>early MVP</strong>
        </div>
        <div>
          <span className="status-label">优先平台</span>
          <strong>Windows</strong>
        </div>
      </section>

      <section className="modules" aria-label="预留模块">
        <h2>预留模块边界</h2>
        <ul>
          {plannedModules.map((moduleName) => (
            <li key={moduleName}>{moduleName}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

