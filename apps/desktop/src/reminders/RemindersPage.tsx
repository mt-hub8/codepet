import { useApp } from "../app/AppProvider";
import { ReminderPanel } from "./ReminderPanel";

export function RemindersPage() {
  const {
    reminders,
    events,
    sounds,
    editingReminder,
    setEditingReminder,
    handleSaveReminder,
    handleToggleReminder,
    handleDeleteReminder,
    handleRestoreDefaults,
    handleImportSound,
    handlePlaySound,
    handleDeleteSound,
    handleGenerateReminderMessage,
    aiReady,
  } = useApp();

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>提醒管理</h1>
        <p>创建、编辑和管理本地提醒，支持自定义提示音与 AI 文案生成。</p>
      </header>
      <ReminderPanel
        reminders={reminders}
        events={events}
        sounds={sounds}
        editingReminder={editingReminder}
        onEdit={setEditingReminder}
        onSave={handleSaveReminder}
        onToggle={handleToggleReminder}
        onDelete={handleDeleteReminder}
        onRestoreDefaults={handleRestoreDefaults}
        onImportSound={handleImportSound}
        onPlaySound={handlePlaySound}
        onDeleteSound={handleDeleteSound}
        onGenerateReminderMessage={handleGenerateReminderMessage}
        aiEnabled={aiReady}
      />
    </div>
  );
}
