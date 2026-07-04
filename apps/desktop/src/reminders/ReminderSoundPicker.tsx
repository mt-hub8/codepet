import type { ReminderSound } from "./reminderSoundTypes";

type ReminderSoundPickerProps = {
  sounds: ReminderSound[];
  soundEnabled: boolean;
  selectedSoundId?: string;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSoundChange: (soundId: string) => void;
  onImportSound: () => void;
  onPlaySound: (sound: ReminderSound) => void;
  onDeleteSound: (sound: ReminderSound) => void;
};

export function ReminderSoundPicker({
  sounds,
  soundEnabled,
  selectedSoundId,
  onSoundEnabledChange,
  onSoundChange,
  onImportSound,
  onPlaySound,
  onDeleteSound,
}: ReminderSoundPickerProps) {
  return (
    <section className="sound-picker" aria-label="提示音设置">
      <label className="check-row">
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(event) => onSoundEnabledChange(event.target.checked)}
        />
        播放提示音
      </label>

      <div className="field-row">
        <label>
          提示音
          <select
            disabled={!soundEnabled}
            value={selectedSoundId || "default-beep"}
            onChange={(event) => onSoundChange(event.target.value)}
          >
            {sounds.map((sound) => (
              <option key={sound.id} value={sound.id}>
                {sound.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onImportSound}>
          导入
        </button>
      </div>

      <ul className="sound-list">
        {sounds.map((sound) => (
          <li key={sound.id}>
            <span>{sound.name}</span>
            <button type="button" onClick={() => onPlaySound(sound)}>
              试听
            </button>
            <button
              type="button"
              disabled={sound.source === "built_in"}
              onClick={() => onDeleteSound(sound)}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

