import type { ReminderEvent } from "./reminderTypes";
import { reminderEventLabels } from "./reminderTypes";

type ReminderHistoryProps = {
  events: ReminderEvent[];
};

export function ReminderHistory({ events }: ReminderHistoryProps) {
  return (
    <section className="reminder-history" aria-label="最近提醒历史">
      <h2>最近提醒历史</h2>
      {events.length === 0 ? (
        <p className="empty-text">还没有提醒记录。</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <span>
                {new Date(event.createdAt).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <strong>{event.message || event.reminderId}</strong>
              <em>{reminderEventLabels[event.eventType]}</em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

