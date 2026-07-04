import { ReminderForm } from "./ReminderForm";
import { ReminderHistory } from "./ReminderHistory";
import { ReminderList } from "./ReminderList";
import type { ReminderSound } from "./reminderSoundTypes";
import type { Reminder, ReminderEvent } from "./reminderTypes";

type ReminderPanelProps = {
  reminders: Reminder[];
  events: ReminderEvent[];
  sounds: ReminderSound[];
  editingReminder?: Reminder | null;
  onEdit: (reminder: Reminder | null) => void;
  onSave: (reminder: Reminder) => Promise<void>;
  onToggle: (reminder: Reminder) => Promise<void>;
  onDelete: (reminder: Reminder) => Promise<void>;
  onRestoreDefaults: () => Promise<void>;
  onImportSound: () => Promise<void>;
  onPlaySound: (sound: ReminderSound) => void;
  onDeleteSound: (sound: ReminderSound) => Promise<void>;
};

export function ReminderPanel({
  reminders,
  events,
  sounds,
  editingReminder,
  onEdit,
  onSave,
  onToggle,
  onDelete,
  onRestoreDefaults,
  onImportSound,
  onPlaySound,
  onDeleteSound,
}: ReminderPanelProps) {
  return (
    <section className="reminder-panel" aria-label="本地提醒">
      <div className="panel-title">
        <h1>本地提醒</h1>
        <button type="button" onClick={() => void onRestoreDefaults()}>
          恢复默认提醒
        </button>
      </div>

      <ReminderForm
        editingReminder={editingReminder}
        sounds={sounds}
        onCancelEdit={() => onEdit(null)}
        onSave={onSave}
        onImportSound={() => void onImportSound()}
        onPlaySound={onPlaySound}
        onDeleteSound={(sound) => void onDeleteSound(sound)}
      />

      <ReminderList
        reminders={reminders}
        onEdit={onEdit}
        onToggle={(reminder) => void onToggle(reminder)}
        onDelete={(reminder) => void onDelete(reminder)}
      />
      <ReminderHistory events={events} />
    </section>
  );
}

