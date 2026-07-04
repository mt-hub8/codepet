import { useEffect, useState } from "react";
import { ReminderSoundPicker } from "./ReminderSoundPicker";
import type { ReminderSound } from "./reminderSoundTypes";
import type { Reminder, ReminderMode, ReminderType } from "./reminderTypes";
import { reminderTypeLabels } from "./reminderTypes";
import { calculateNextTrigger, createId, nowIso } from "./reminderTime";

type ReminderFormProps = {
  editingReminder?: Reminder | null;
  sounds: ReminderSound[];
  onCancelEdit: () => void;
  onSave: (reminder: Reminder) => Promise<void>;
  onImportSound: () => void;
  onPlaySound: (sound: ReminderSound) => void;
  onDeleteSound: (sound: ReminderSound) => void;
};

const reminderTypes = Object.keys(reminderTypeLabels) as ReminderType[];

function createBlankReminder(): Reminder {
  const createdAt = nowIso();
  const draft: Reminder = {
    id: createId("reminder"),
    title: "",
    reminderType: "custom",
    mode: "interval",
    intervalMinutes: 30,
    enabled: true,
    soundId: "default-beep",
    soundEnabled: true,
    createdAt,
    updatedAt: createdAt,
  };
  return { ...draft, nextTriggerAt: calculateNextTrigger(draft) };
}

export function ReminderForm({
  editingReminder,
  sounds,
  onCancelEdit,
  onSave,
  onImportSound,
  onPlaySound,
  onDeleteSound,
}: ReminderFormProps) {
  const [draft, setDraft] = useState<Reminder>(createBlankReminder);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(editingReminder ?? createBlankReminder());
    setError("");
  }, [editingReminder]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await onSave(draft);
      setDraft(createBlankReminder());
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存提醒失败");
    }
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <h2>{editingReminder ? "编辑提醒" : "创建提醒"}</h2>
      {error && <p className="form-error">{error}</p>}

      <label>
        标题
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="例如：喝水提醒"
        />
      </label>

      <div className="field-grid">
        <label>
          类型
          <select
            value={draft.reminderType}
            onChange={(event) =>
              setDraft({ ...draft, reminderType: event.target.value as ReminderType })
            }
          >
            {reminderTypes.map((type) => (
              <option key={type} value={type}>
                {reminderTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label>
          模式
          <select
            value={draft.mode}
            onChange={(event) => setDraft({ ...draft, mode: event.target.value as ReminderMode })}
          >
            <option value="interval">间隔</option>
            <option value="fixed_time">固定时间</option>
          </select>
        </label>
      </div>

      {draft.mode === "interval" ? (
        <label>
          间隔分钟
          <input
            type="number"
            min={1}
            value={draft.intervalMinutes ?? 30}
            onChange={(event) =>
              setDraft({ ...draft, intervalMinutes: Number(event.target.value) })
            }
          />
        </label>
      ) : (
        <label>
          固定时间
          <input
            type="time"
            value={draft.fixedTime ?? "09:00"}
            onChange={(event) => setDraft({ ...draft, fixedTime: event.target.value })}
          />
        </label>
      )}

      <label>
        提醒文案
        <textarea
          value={draft.message ?? ""}
          onChange={(event) => setDraft({ ...draft, message: event.target.value })}
          placeholder="可选，不填时使用标题生成文案"
        />
      </label>

      <label className="check-row">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
        />
        启用提醒
      </label>

      <ReminderSoundPicker
        sounds={sounds}
        soundEnabled={draft.soundEnabled}
        selectedSoundId={draft.soundId}
        onSoundEnabledChange={(enabled) => setDraft({ ...draft, soundEnabled: enabled })}
        onSoundChange={(soundId) => setDraft({ ...draft, soundId })}
        onImportSound={onImportSound}
        onPlaySound={onPlaySound}
        onDeleteSound={onDeleteSound}
      />

      <div className="form-actions">
        <button type="submit">{editingReminder ? "保存修改" : "创建提醒"}</button>
        {editingReminder && (
          <button type="button" onClick={onCancelEdit}>
            取消
          </button>
        )}
      </div>
    </form>
  );
}

