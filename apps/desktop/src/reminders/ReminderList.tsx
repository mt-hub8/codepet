import type { Reminder } from "./reminderTypes";
import { reminderTypeLabels } from "./reminderTypes";
import { formatTime } from "./reminderTime";

type ReminderListProps = {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onToggle: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
};

export function ReminderList({ reminders, onEdit, onToggle, onDelete }: ReminderListProps) {
  return (
    <section className="reminder-list" aria-label="提醒列表">
      <h2>提醒列表</h2>
      {reminders.length === 0 ? (
        <p className="empty-text">还没有提醒。</p>
      ) : (
        <ul>
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <div>
                <strong>{reminder.title}</strong>
                <span>
                  {reminderTypeLabels[reminder.reminderType]} ·{" "}
                  {reminder.mode === "interval"
                    ? `每 ${reminder.intervalMinutes} 分钟`
                    : `每天 ${reminder.fixedTime}`}
                </span>
                <small>下次：{formatTime(reminder.nextTriggerAt)}</small>
              </div>
              <div className="row-actions">
                <button type="button" onClick={() => onToggle(reminder)}>
                  {reminder.enabled ? "禁用" : "启用"}
                </button>
                <button type="button" onClick={() => onEdit(reminder)}>
                  编辑
                </button>
                <button type="button" onClick={() => onDelete(reminder)}>
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

