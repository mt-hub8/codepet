import { startWindowDrag } from "../shared/desktopWindowService";
import { Sidebar } from "../shared/components/Sidebar";
import { AppRoutes } from "./AppRoutes";
import { useApp } from "./AppProvider";

export function AppShell() {
  const {
    activeReminder,
    activeTitle,
    activeMessage,
    finishActiveReminder,
    error,
    isAlwaysOnTop,
    togglePin,
  } = useApp();

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <header
          className="app-titlebar drag-region"
          data-tauri-drag-region
          onMouseDown={() => void startWindowDrag()}
        >
          <span className="app-titlebar-brand">CodePet 工作面板</span>
          <div className="app-titlebar-actions">
            <button
              type="button"
              className="cp-btn cp-btn-sm"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => void togglePin()}
            >
              {isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
            </button>
          </div>
        </header>

        {error && <p className="app-error app-error-banner">{error}</p>}

        {activeReminder && (
          <section className="active-reminder-banner" aria-label="当前提醒">
            <strong>{activeTitle}</strong>
            <p>{activeMessage}</p>
            <div className="active-reminder-actions">
              <button type="button" className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => void finishActiveReminder("completed")}>
                完成
              </button>
              <button type="button" className="cp-btn cp-btn-sm" onClick={() => void finishActiveReminder("snoozed")}>
                稍后提醒
              </button>
              <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => void finishActiveReminder("ignored")}>
                忽略
              </button>
            </div>
          </section>
        )}

        <main className="app-content">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
