import { useMemo } from "react";
import { useApp } from "../app/AppProvider";
import { reminderTypeLabels, type Reminder, type ReminderType } from "../reminders/reminderTypes";
import { formatTime } from "../reminders/reminderTime";

const priorityTypes: ReminderType[] = ["work", "water", "rest", "study", "custom"];

function pickTodayReminders(reminders: Reminder[]): Reminder[] {
  const enabled = reminders.filter((reminder) => reminder.enabled);
  const sorted = [...enabled].sort((left, right) => {
    const leftPriority = priorityTypes.indexOf(left.reminderType);
    const rightPriority = priorityTypes.indexOf(right.reminderType);
    return leftPriority - rightPriority;
  });
  return sorted.slice(0, 3);
}

export function TodayReminderSection() {
  const { reminders, navigate } = useApp();
  const todayReminders = useMemo(() => pickTodayReminders(reminders), [reminders]);

  return (
    <section className="cp-section" aria-label="今日提醒">
      <div className="cp-section-header">
        <div>
          <h2>今日提醒</h2>
          <p>优先展示今天最需要关注的几条提醒</p>
        </div>
        <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("reminders")}>
          查看全部
        </button>
      </div>

      {todayReminders.length === 0 ? (
        <div className="cp-empty">
          今天还没有提醒，可以先创建一个喝水或休息提醒。
        </div>
      ) : (
        <div className="reminder-preview-list">
          {todayReminders.map((reminder) => (
            <article key={reminder.id} className="cp-card reminder-preview-item">
              <div>
                <strong>{reminder.title}</strong>
                <span>
                  {reminderTypeLabels[reminder.reminderType]}
                  {reminder.nextTriggerAt ? ` · 下次 ${formatTime(reminder.nextTriggerAt)}` : ""}
                </span>
              </div>
              <span className="cp-tag cp-tag-green">已启用</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
