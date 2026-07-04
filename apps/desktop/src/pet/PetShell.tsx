import { useEffect, useMemo, useState } from "react";
import { LocalChatPanel } from "../integrations/ollama/LocalChatPanel";
import { OllamaSettingsPanel } from "../integrations/ollama/OllamaSettingsPanel";
import { ollamaService, type ReminderPromptTone } from "../integrations/ollama/ollamaService";
import type { LocalAiSettings, OllamaStatus } from "../integrations/ollama/ollamaTypes";
import { ReminderPanel } from "../reminders/ReminderPanel";
import { checkDueReminder } from "../reminders/reminderScheduler";
import { reminderService } from "../reminders/reminderService";
import { reminderSoundService } from "../reminders/reminderSoundService";
import type { ReminderSound } from "../reminders/reminderSoundTypes";
import type { Reminder, ReminderEvent } from "../reminders/reminderTypes";
import { calculateNextTrigger, nowIso } from "../reminders/reminderTime";
import {
  getAlwaysOnTop,
  startWindowDrag,
  toggleAlwaysOnTop,
} from "../shared/desktopWindowService";
import { PetAvatar } from "./PetAvatar";
import { PetBubble } from "./PetBubble";
import { PetStatusPanel } from "./PetStatusPanel";
import type { PetState } from "./petState";

type WorkspaceTab = "reminders" | "ai-settings" | "chat";

const defaultOllamaStatus: OllamaStatus = {
  status: "checking",
  baseUrl: "http://localhost:11434/api",
  models: [],
};

const defaultLocalAiSettings: LocalAiSettings = {
  enabled: false,
  provider: "ollama",
  baseUrl: "http://localhost:11434/api",
  selectedModel: undefined,
  updatedAt: new Date().toISOString(),
};

export function PetShell() {
  const [petState, setPetState] = useState<PetState>("idle");
  const [manualPetState, setManualPetState] = useState<PetState>("idle");
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<ReminderEvent[]>([]);
  const [sounds, setSounds] = useState<ReminderSound[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [activeMessage, setActiveMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("reminders");
  const [localAiSettings, setLocalAiSettings] =
    useState<LocalAiSettings>(defaultLocalAiSettings);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>(defaultOllamaStatus);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [isRemoteBaseUrl, setIsRemoteBaseUrl] = useState(false);

  const displayedState = activeReminder ? "reminding" : petState;
  const activeTitle = useMemo(() => activeReminder?.title ?? "当前提醒", [activeReminder]);

  async function refreshAll() {
    const [nextReminders, nextEvents, nextSounds] = await Promise.all([
      reminderService.listReminders(),
      reminderService.listEvents(20),
      reminderSoundService.listSounds(),
    ]);
    setReminders(nextReminders);
    setEvents(nextEvents);
    setSounds(nextSounds);
  }

  useEffect(() => {
    getAlwaysOnTop()
      .then(setIsAlwaysOnTop)
      .catch(() => setIsAlwaysOnTop(false));

    reminderService
      .initializeDefaultsOnce()
      .then(refreshAll)
      .catch((error) => setError(error instanceof Error ? error.message : "初始化提醒失败"));

    ollamaService
      .getSettings()
      .then((settings) => {
        setLocalAiSettings(settings);
        setOllamaStatus({ ...defaultOllamaStatus, baseUrl: settings.baseUrl });
        return Promise.all([
          ollamaService.isLocalBaseUrl(settings.baseUrl),
          ollamaService.detectStatus(settings),
        ]);
      })
      .then(([isLocal, status]) => {
        setIsRemoteBaseUrl(!isLocal);
        setOllamaStatus(status);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      checkDueReminder(reminders, sounds, activeReminder)
        .then((trigger) => {
          if (!trigger) {
            return;
          }
          setActiveReminder(trigger.reminder);
          setActiveMessage(trigger.message);
          setPetState("reminding");
          void refreshAll();
        })
        .catch((error) =>
          setError(error instanceof Error ? error.message : "检查提醒时出现问题"),
        );
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [activeReminder, reminders, sounds]);

  async function handleToggleAlwaysOnTop() {
    const nextValue = await toggleAlwaysOnTop();
    setIsAlwaysOnTop(nextValue);
  }

  async function handleSave(reminder: Reminder) {
    await reminderService.saveReminder(reminder);
    setEditingReminder(null);
    await refreshAll();
  }

  async function handleToggleReminder(reminder: Reminder) {
    await reminderService.saveReminder({
      ...reminder,
      enabled: !reminder.enabled,
      nextTriggerAt: !reminder.enabled ? calculateNextTrigger(reminder) : undefined,
      updatedAt: nowIso(),
    });
    await refreshAll();
  }

  async function handleDeleteReminder(reminder: Reminder) {
    if (!window.confirm(`确定删除“${reminder.title}”吗？`)) {
      return;
    }
    await reminderService.deleteReminder(reminder.id);
    if (editingReminder?.id === reminder.id) {
      setEditingReminder(null);
    }
    await refreshAll();
  }

  async function handleRestoreDefaults() {
    await reminderService.restoreDefaultReminders();
    await refreshAll();
  }

  async function handleDetectOllama() {
    setIsCheckingOllama(true);
    setOllamaStatus({ ...ollamaStatus, status: "checking", errorMessage: undefined });
    try {
      const [isLocal, status] = await Promise.all([
        ollamaService.isLocalBaseUrl(localAiSettings.baseUrl),
        ollamaService.detectStatus(localAiSettings),
      ]);
      setIsRemoteBaseUrl(!isLocal);
      setOllamaStatus(status);
    } finally {
      setIsCheckingOllama(false);
    }
  }

  async function handleSaveLocalAiSettings() {
    await ollamaService.saveSettings(localAiSettings);
    await handleDetectOllama();
  }

  async function handleGenerateReminderMessage(input: {
    title: string;
    reminderType: Reminder["reminderType"];
    message?: string;
    tone: ReminderPromptTone;
  }) {
    setPetState("thinking");
    setActiveMessage("我在请本地模型帮你写提醒文案。");
    try {
      const message = await ollamaService.generateReminderMessage(localAiSettings, input);
      setPetState("success");
      setActiveMessage(message);
      window.setTimeout(() => {
        if (!activeReminder) {
          setPetState(manualPetState);
          setActiveMessage("");
        }
      }, 2000);
      return message;
    } catch (error) {
      setPetState("warning");
      throw error;
    }
  }

  async function handleImportSound() {
    const sound = await reminderSoundService.importSound();
    if (sound) {
      await refreshAll();
    }
  }

  async function handleDeleteSound(sound: ReminderSound) {
    const usedByReminder = reminders.some((reminder) => reminder.soundId === sound.id);
    const message = usedByReminder
      ? `“${sound.name}”正在被提醒使用，删除后这些提醒会回退到默认提示音。继续吗？`
      : `确定删除“${sound.name}”吗？`;
    if (!window.confirm(message)) {
      return;
    }
    await reminderSoundService.deleteSound(sound);
    await refreshAll();
  }

  async function finishActiveReminder(action: "completed" | "snoozed" | "ignored") {
    if (!activeReminder) {
      return;
    }
    if (action === "completed") {
      await reminderService.completeReminder(activeReminder);
      setPetState("success");
    }
    if (action === "snoozed") {
      await reminderService.snoozeReminder(activeReminder);
      setPetState("idle");
    }
    if (action === "ignored") {
      await reminderService.ignoreReminder(activeReminder);
      setPetState("idle");
    }
    setActiveReminder(null);
    setActiveMessage("");
    await refreshAll();
    window.setTimeout(() => setPetState(manualPetState), 1600);
  }

  function handleManualStateChange(state: PetState) {
    setManualPetState(state);
    if (!activeReminder) {
      setPetState(state);
    }
  }

  const aiReady = Boolean(localAiSettings.enabled && localAiSettings.selectedModel);

  return (
    <main className={`pet-shell pet-shell-${displayedState}`}>
      <header
        className="drag-region"
        data-tauri-drag-region
        onMouseDown={() => void startWindowDrag()}
      >
        <span>CodePet</span>
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={handleToggleAlwaysOnTop}
        >
          {isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
        </button>
      </header>

      {error && <p className="app-error">{error}</p>}

      <section className="pet-stage">
        <PetBubble state={displayedState} message={activeMessage} />
        <PetAvatar state={displayedState} />
        <PetStatusPanel currentState={manualPetState} onChange={handleManualStateChange} />
      </section>

      {activeReminder && (
        <section className="active-reminder" aria-label="当前提醒">
          <strong>{activeTitle}</strong>
          <p>{activeMessage}</p>
          <div>
            <button type="button" onClick={() => void finishActiveReminder("completed")}>
              完成
            </button>
            <button type="button" onClick={() => void finishActiveReminder("snoozed")}>
              稍后提醒
            </button>
            <button type="button" onClick={() => void finishActiveReminder("ignored")}>
              忽略
            </button>
          </div>
        </section>
      )}

      <nav className="workspace-tabs" aria-label="功能入口">
        <button
          type="button"
          className={activeTab === "reminders" ? "active" : ""}
          onClick={() => setActiveTab("reminders")}
        >
          本地提醒
        </button>
        <button
          type="button"
          className={activeTab === "ai-settings" ? "active" : ""}
          onClick={() => setActiveTab("ai-settings")}
        >
          本地 AI 设置
        </button>
        <button
          type="button"
          className={activeTab === "chat" ? "active" : ""}
          onClick={() => setActiveTab("chat")}
        >
          本地聊天
        </button>
      </nav>

      {activeTab === "reminders" && (
        <ReminderPanel
          reminders={reminders}
          events={events}
          sounds={sounds}
          editingReminder={editingReminder}
          onEdit={setEditingReminder}
          onSave={handleSave}
          onToggle={handleToggleReminder}
          onDelete={handleDeleteReminder}
          onRestoreDefaults={handleRestoreDefaults}
          onImportSound={handleImportSound}
          onPlaySound={(sound) => void reminderSoundService.playSound(sound)}
          onDeleteSound={handleDeleteSound}
          onGenerateReminderMessage={handleGenerateReminderMessage}
          aiEnabled={aiReady}
        />
      )}

      {activeTab === "ai-settings" && (
        <OllamaSettingsPanel
          settings={localAiSettings}
          status={ollamaStatus}
          isChecking={isCheckingOllama}
          isRemoteBaseUrl={isRemoteBaseUrl}
          onSettingsChange={setLocalAiSettings}
          onSave={handleSaveLocalAiSettings}
          onDetect={handleDetectOllama}
        />
      )}

      {activeTab === "chat" && (
        <LocalChatPanel
          settings={localAiSettings}
          onThinking={() => {
            setPetState("thinking");
            setActiveMessage("我在问本地模型，稍等一下。");
          }}
          onReply={(reply) => {
            setPetState("success");
            setActiveMessage(reply.slice(0, 60));
            window.setTimeout(() => {
              if (!activeReminder) {
                setPetState(manualPetState);
                setActiveMessage("");
              }
            }, 2400);
          }}
          onError={(message) => {
            setPetState("warning");
            setError(message);
          }}
        />
      )}
    </main>
  );
}
