import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ollamaService, type ReminderPromptTone } from "../integrations/ollama/ollamaService";
import type { LocalAiSettings, OllamaStatus } from "../integrations/ollama/ollamaTypes";
import type { PetState } from "../pet/petState";
import { checkDueReminder } from "../reminders/reminderScheduler";
import { reminderService } from "../reminders/reminderService";
import { reminderSoundService } from "../reminders/reminderSoundService";
import type { ReminderSound } from "../reminders/reminderSoundTypes";
import type { Reminder, ReminderEvent } from "../reminders/reminderTypes";
import { calculateNextTrigger, nowIso } from "../reminders/reminderTime";
import { getAlwaysOnTop, toggleAlwaysOnTop } from "../shared/desktopWindowService";
import type { AppRoute } from "./navigation";
import { DEFAULT_ROUTE } from "./navigation";

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

type AppContextValue = {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  petState: PetState;
  displayedState: PetState;
  manualPetState: PetState;
  setManualPetState: (state: PetState) => void;
  setPetState: (state: PetState) => void;
  setActiveMessage: (message: string) => void;
  isAlwaysOnTop: boolean;
  togglePin: () => Promise<void>;
  reminders: Reminder[];
  events: ReminderEvent[];
  sounds: ReminderSound[];
  editingReminder: Reminder | null;
  setEditingReminder: (reminder: Reminder | null) => void;
  activeReminder: Reminder | null;
  activeMessage: string;
  activeTitle: string;
  error: string;
  setError: (message: string) => void;
  refreshAll: () => Promise<void>;
  handleSaveReminder: (reminder: Reminder) => Promise<void>;
  handleToggleReminder: (reminder: Reminder) => Promise<void>;
  handleDeleteReminder: (reminder: Reminder) => Promise<void>;
  handleRestoreDefaults: () => Promise<void>;
  handleImportSound: () => Promise<void>;
  handleDeleteSound: (sound: ReminderSound) => Promise<void>;
  handlePlaySound: (sound: ReminderSound) => void;
  finishActiveReminder: (action: "completed" | "snoozed" | "ignored") => Promise<void>;
  localAiSettings: LocalAiSettings;
  setLocalAiSettings: (settings: LocalAiSettings) => void;
  ollamaStatus: OllamaStatus;
  isCheckingOllama: boolean;
  isRemoteBaseUrl: boolean;
  handleDetectOllama: () => Promise<void>;
  handleSaveLocalAiSettings: () => Promise<void>;
  handleGenerateReminderMessage: (input: {
    title: string;
    reminderType: Reminder["reminderType"];
    message?: string;
    tone: ReminderPromptTone;
  }) => Promise<string>;
  handleChatThinking: () => void;
  handleChatReply: (reply: string) => void;
  handleChatError: (message: string) => void;
  aiReady: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(DEFAULT_ROUTE);
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
  const [localAiSettings, setLocalAiSettings] =
    useState<LocalAiSettings>(defaultLocalAiSettings);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>(defaultOllamaStatus);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [isRemoteBaseUrl, setIsRemoteBaseUrl] = useState(false);

  const displayedState = activeReminder ? "reminding" : petState;
  const activeTitle = useMemo(
    () => activeReminder?.title ?? "当前提醒",
    [activeReminder],
  );
  const aiReady = Boolean(localAiSettings.enabled && localAiSettings.selectedModel);

  const refreshAll = useCallback(async () => {
    const [nextReminders, nextEvents, nextSounds] = await Promise.all([
      reminderService.listReminders(),
      reminderService.listEvents(20),
      reminderSoundService.listSounds(),
    ]);
    setReminders(nextReminders);
    setEvents(nextEvents);
    setSounds(nextSounds);
  }, []);

  useEffect(() => {
    getAlwaysOnTop()
      .then(setIsAlwaysOnTop)
      .catch(() => setIsAlwaysOnTop(false));

    reminderService
      .initializeDefaultsOnce()
      .then(refreshAll)
      .catch((initError) =>
        setError(initError instanceof Error ? initError.message : "初始化提醒失败"),
      );

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
  }, [refreshAll]);

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
        .catch((checkError) =>
          setError(checkError instanceof Error ? checkError.message : "检查提醒时出现问题"),
        );
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [activeReminder, reminders, sounds, refreshAll]);

  const navigate = useCallback((route: AppRoute) => {
    setCurrentRoute(route);
  }, []);

  const togglePin = useCallback(async () => {
    const nextValue = await toggleAlwaysOnTop();
    setIsAlwaysOnTop(nextValue);
  }, []);

  const handleSaveReminder = useCallback(
    async (reminder: Reminder) => {
      await reminderService.saveReminder(reminder);
      setEditingReminder(null);
      await refreshAll();
    },
    [refreshAll],
  );

  const handleToggleReminder = useCallback(
    async (reminder: Reminder) => {
      await reminderService.saveReminder({
        ...reminder,
        enabled: !reminder.enabled,
        nextTriggerAt: !reminder.enabled ? calculateNextTrigger(reminder) : undefined,
        updatedAt: nowIso(),
      });
      await refreshAll();
    },
    [refreshAll],
  );

  const handleDeleteReminder = useCallback(
    async (reminder: Reminder) => {
      if (!window.confirm(`确定删除“${reminder.title}”吗？`)) {
        return;
      }
      await reminderService.deleteReminder(reminder.id);
      setEditingReminder((current) => (current?.id === reminder.id ? null : current));
      await refreshAll();
    },
    [refreshAll],
  );

  const handleRestoreDefaults = useCallback(async () => {
    await reminderService.restoreDefaultReminders();
    await refreshAll();
  }, [refreshAll]);

  const handleDetectOllama = useCallback(async () => {
    setIsCheckingOllama(true);
    setOllamaStatus((current) => ({ ...current, status: "checking", errorMessage: undefined }));
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
  }, [localAiSettings]);

  const handleSaveLocalAiSettings = useCallback(async () => {
    await ollamaService.saveSettings(localAiSettings);
    await handleDetectOllama();
  }, [handleDetectOllama, localAiSettings]);

  const handleGenerateReminderMessage = useCallback(
    async (input: {
      title: string;
      reminderType: Reminder["reminderType"];
      message?: string;
      tone: ReminderPromptTone;
    }) => {
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
      } catch {
        setPetState("warning");
        throw new Error("生成提醒文案失败");
      }
    },
    [localAiSettings, manualPetState, activeReminder],
  );

  const handleImportSound = useCallback(async () => {
    const sound = await reminderSoundService.importSound();
    if (sound) {
      await refreshAll();
    }
  }, [refreshAll]);

  const handleDeleteSound = useCallback(
    async (sound: ReminderSound) => {
      const usedByReminder = reminders.some((reminder) => reminder.soundId === sound.id);
      const message = usedByReminder
        ? `“${sound.name}”正在被提醒使用，删除后这些提醒会回退到默认提示音。继续吗？`
        : `确定删除“${sound.name}”吗？`;
      if (!window.confirm(message)) {
        return;
      }
      await reminderSoundService.deleteSound(sound);
      await refreshAll();
    },
    [refreshAll, reminders],
  );

  const handlePlaySound = useCallback((sound: ReminderSound) => {
    void reminderSoundService.playSound(sound);
  }, []);

  const finishActiveReminder = useCallback(
    async (action: "completed" | "snoozed" | "ignored") => {
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
    },
    [activeReminder, manualPetState, refreshAll],
  );

  const handleManualStateChange = useCallback(
    (state: PetState) => {
      setManualPetState(state);
      if (!activeReminder) {
        setPetState(state);
      }
    },
    [activeReminder],
  );

  const handleChatThinking = useCallback(() => {
    setPetState("thinking");
    setActiveMessage("我在问本地模型，稍等一下。");
  }, []);

  const handleChatReply = useCallback(
    (reply: string) => {
      setPetState("success");
      setActiveMessage(reply.slice(0, 60));
      window.setTimeout(() => {
        if (!activeReminder) {
          setPetState(manualPetState);
          setActiveMessage("");
        }
      }, 2400);
    },
    [activeReminder, manualPetState],
  );

  const handleChatError = useCallback((message: string) => {
    setPetState("warning");
    setError(message);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentRoute,
      navigate,
      petState,
      displayedState,
      manualPetState,
      setManualPetState: handleManualStateChange,
      setPetState,
      setActiveMessage,
      isAlwaysOnTop,
      togglePin,
      reminders,
      events,
      sounds,
      editingReminder,
      setEditingReminder,
      activeReminder,
      activeMessage,
      activeTitle,
      error,
      setError,
      refreshAll,
      handleSaveReminder,
      handleToggleReminder,
      handleDeleteReminder,
      handleRestoreDefaults,
      handleImportSound,
      handleDeleteSound,
      handlePlaySound,
      finishActiveReminder,
      localAiSettings,
      setLocalAiSettings,
      ollamaStatus,
      isCheckingOllama,
      isRemoteBaseUrl,
      handleDetectOllama,
      handleSaveLocalAiSettings,
      handleGenerateReminderMessage,
      handleChatThinking,
      handleChatReply,
      handleChatError,
      aiReady,
    }),
    [
      currentRoute,
      navigate,
      petState,
      displayedState,
      manualPetState,
      handleManualStateChange,
      isAlwaysOnTop,
      togglePin,
      reminders,
      events,
      sounds,
      editingReminder,
      activeReminder,
      activeMessage,
      activeTitle,
      error,
      refreshAll,
      handleSaveReminder,
      handleToggleReminder,
      handleDeleteReminder,
      handleRestoreDefaults,
      handleImportSound,
      handleDeleteSound,
      handlePlaySound,
      finishActiveReminder,
      localAiSettings,
      ollamaStatus,
      isCheckingOllama,
      isRemoteBaseUrl,
      handleDetectOllama,
      handleSaveLocalAiSettings,
      handleGenerateReminderMessage,
      handleChatThinking,
      handleChatReply,
      handleChatError,
      aiReady,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
