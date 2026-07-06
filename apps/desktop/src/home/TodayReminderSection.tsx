import { useMemo } from "react";
import { useApp } from "../app/AppProvider";
import { ReminderCardIcon } from "./HomeIcons";
import {
  demoReminderCards,
  reminderAccentForType,
  reminderIconForType,
} from "./homePlaceholders";
import type { Reminder, ReminderType } from "../reminders/reminderTypes";
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

function reminderFooter(reminder: Reminder): string | undefined {
  if (reminder.nextTriggerAt) {
    return `下次 ${formatTime(reminder.nextTriggerAt)}`;
  }
  if (reminder.fixedTime) {
    return `今天 ${reminder.fixedTime}`;
  }
  if (reminder.intervalMinutes) {
    return `每 ${reminder.intervalMinutes} 分钟`;
  }
  return "即将开始";
}

export function TodayReminderSection() {
  const { reminders, navigate } = useApp();
  const todayReminders = useMemo(() => pickTodayReminders(reminders), [reminders]);
  const useDemo = todayReminders.length === 0;

  return (
    <section className="home-section" aria-label="今日提醒">
      <div className="home-section-header">
        <h2>今日提醒</h2>
        <button type="button" className="home-link-btn" onClick={() => navigate("reminders")}>
          查看全部 &gt;
        </button>
      </div>

      <div className="home-reminder-grid">
        {useDemo
          ? demoReminderCards.map((card) => (
              <article key={card.id} className={`home-reminder-card home-reminder-card--${card.accent}`}>
                <div className="home-reminder-card-icon">
                  <ReminderCardIcon kind={card.icon} />
                </div>
                <div className="home-reminder-card-body">
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                  {card.footer && (
                    <span className="home-reminder-card-footer">
                      {card.icon === "calendar" && "🔔 "}
                      {card.icon === "study" && "🕐 "}
                      {card.footer}
                    </span>
                  )}
                </div>
              </article>
            ))
          : todayReminders.map((reminder) => {
              const accent = reminderAccentForType(reminder.reminderType);
              const icon = reminderIconForType(reminder.reminderType);
              return (
                <article
                  key={reminder.id}
                  className={`home-reminder-card home-reminder-card--${accent}`}
                >
                  <div className="home-reminder-card-icon">
                    <ReminderCardIcon kind={icon} />
                  </div>
                  <div className="home-reminder-card-body">
                    <strong>{reminder.title}</strong>
                    <p>{reminder.message ?? "已启用的本地提醒"}</p>
                    <span className="home-reminder-card-footer">{reminderFooter(reminder)}</span>
                  </div>
                </article>
              );
            })}
      </div>
    </section>
  );
}
