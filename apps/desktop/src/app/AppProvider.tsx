import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { commandAlertService } from "../integrations/command/commandAlertService";
import { dependencyDetection } from "../integrations/command/dependencyDetection";
import { ollamaService, type ReminderPromptTone } from "../integrations/ollama/ollamaService";
import type { LocalAiSettings, OllamaStatus } from "../integrations/ollama/ollamaTypes";
import { commandRunner } from "../integrations/command/commandRunner";
import {
  commandService,
  type CreateCommandTaskInput,
} from "../integrations/command/commandService";
import type { CommandEvent, CommandTask } from "../integrations/command/commandTypes";
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
  commandTasks: CommandTask[];
  commandEvents: Record<string, CommandEvent[]>;
  selectedCommandTaskId: string | null;
  setSelectedCommandTaskId: (taskId: string | null) => void;
  commandError: string;
  setCommandError: (message: string) => void;
  refreshCommandTasks: () => Promise<void>;
  handleCreateCommandTask: (input: CreateCommandTaskInput) => Promise<CommandTask>;
  handleUpdateCommandTask: (task: CommandTask) => Promise<void>;
  handleDeleteCommandTask: (task: CommandTask) => Promise<void>;
  handleStartCommandTask: (task: CommandTask) => Promise<void>;
  handleCancelCommandTask: (task: CommandTask) => Promise<void>;
  handleRerunCommandTask: (task: CommandTask) => Promise<void>;
  handlePickWorkingDirectory: () => Promise<string | null>;
  handleContinueWaitingCommandTask: (task: CommandTask) => Promise<void>;
  handleSummarizeCommandFailure: (task: CommandTask) => Promise<void>;
  recentCommandTasks: CommandTask[];
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
  const [commandTasks, setCommandTasks] = useState<CommandTask[]>([]);
  const [commandEvents, setCommandEvents] = useState<Record<string, CommandEvent[]>>({});
  const [selectedCommandTaskId, setSelectedCommandTaskId] = useState<string | null>(null);
  const [commandError, setCommandError] = useState("");
  const lastOutputAtRef = useRef<Record<string, number>>({});
  const commandKeywordsRef = useRef<string[]>([]);

  const normalizeCommandTask = useCallback((task: CommandTask): CommandTask => ({
    ...task,
    adapterType: task.adapterType ?? "generic",
    noOutputTimeoutMinutes: task.noOutputTimeoutMinutes ?? 5,
  }), []);

  const playCommandAlertSound = useCallback(async () => {
    const soundList = await reminderSoundService.listSounds();
    const defaultSound = soundList.find((sound) => sound.id === "default-beep");
    if (defaultSound) {
      await reminderSoundService.playSound(defaultSound);
    }
  }, []);

  const displayedState = activeReminder ? "reminding" : petState;
  const activeTitle = useMemo(
    () => activeReminder?.title ?? "当前提醒",
    [activeReminder],
  );
  const aiReady = Boolean(localAiSettings.enabled && localAiSettings.selectedModel);
  const recentCommandTasks = useMemo(
    () => commandService.getRecentTasks(commandTasks, 3),
    [commandTasks],
  );

  const refreshCommandTasks = useCallback(async () => {
    const nextTasks = (await commandService.listTasks()).map(normalizeCommandTask);
    setCommandTasks(nextTasks);
    if (selectedCommandTaskId) {
      const events = await commandService.listEvents(selectedCommandTaskId);
      setCommandEvents((current) => ({ ...current, [selectedCommandTaskId]: events }));
    }
  }, [normalizeCommandTask, selectedCommandTaskId]);

  const refreshAll = useCallback(async () => {
    const [nextReminders, nextEvents, nextSounds] = await Promise.all([
      reminderService.listReminders(),
      reminderService.listEvents(20),
      reminderSoundService.listSounds(),
    ]);
    setReminders(nextReminders);
    setEvents(nextEvents);
    setSounds(nextSounds);
    const nextTasks = (await commandService.listTasks()).map(normalizeCommandTask);
    setCommandTasks(nextTasks);
  }, [normalizeCommandTask]);

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

    void refreshCommandTasks();
    void dependencyDetection.loadKeywords().then((keywords) => {
      commandKeywordsRef.current = keywords;
    });
  }, [refreshAll, refreshCommandTasks]);

  useEffect(() => {
    if (!selectedCommandTaskId) {
      return;
    }
    void commandService.listEvents(selectedCommandTaskId).then((events) => {
      setCommandEvents((current) => ({ ...current, [selectedCommandTaskId]: events }));
    });
  }, [selectedCommandTaskId]);

  useEffect(() => {
    let unlisteners: Array<() => void> = [];
    let disposed = false;

    const alertCallbacks = {
      onNeedsUserInput: (task: CommandTask, _line: string) => {
        if (!activeReminder) {
          setPetState("warning");
          setActiveMessage("外部 Agent 可能正在等待你确认");
        }
        void playCommandAlertSound();
        void refreshCommandTasks();
      },
      onNoOutputTimeout: (task: CommandTask) => {
        if (!activeReminder) {
          setPetState("warning");
          setActiveMessage("命令已经一段时间没有新输出了");
        }
        void playCommandAlertSound();
        void refreshCommandTasks();
      },
      onOutputReceived: (taskId: string) => {
        lastOutputAtRef.current[taskId] = Date.now();
      },
    };

    void commandRunner.subscribe({
      onOutput: (payload) => {
        lastOutputAtRef.current[payload.taskId] = Date.now();
        void (async () => {
          const events = await commandService.listEvents(payload.taskId);
          if (disposed) {
            return;
          }
          setCommandEvents((current) => ({ ...current, [payload.taskId]: events }));
          const task = commandTasks.find((item) => item.id === payload.taskId);
          if (!task) {
            const tasks = await commandService.listTasks();
            const found = tasks.map(normalizeCommandTask).find((item) => item.id === payload.taskId);
            if (found) {
              await commandAlertService.handleOutputLine(
                found,
                payload.content,
                commandKeywordsRef.current,
                alertCallbacks,
              );
            }
            return;
          }
          await commandAlertService.handleOutputLine(
            task,
            payload.content,
            commandKeywordsRef.current,
            alertCallbacks,
          );
          await refreshCommandTasks();
        })();
      },
      onStatusChanged: () => {
        void refreshCommandTasks();
      },
      onFinished: (payload) => {
        delete lastOutputAtRef.current[payload.taskId];
        void (async () => {
          const events = await commandService.listEvents(payload.taskId);
          const tasks = (await commandService.listTasks()).map(normalizeCommandTask);
          if (disposed) {
            return;
          }
          setCommandEvents((current) => ({ ...current, [payload.taskId]: events }));
          setCommandTasks(tasks);

          if (!activeReminder) {
            if (payload.status === "succeeded") {
              setPetState("success");
              setActiveMessage("任务执行完成");
              await playCommandAlertSound();
            } else if (payload.status === "failed") {
              setPetState("warning");
              setActiveMessage("任务执行失败，请查看日志");
              await playCommandAlertSound();
            } else {
              setPetState(manualPetState);
              setActiveMessage("任务已取消");
            }
            window.setTimeout(() => {
              if (!activeReminder) {
                setPetState(manualPetState);
                setActiveMessage("");
              }
            }, 2400);
          }
        })();
      },
    }).then((listeners) => {
      if (disposed) {
        listeners.forEach((unlisten) => unlisten());
        return;
      }
      unlisteners = listeners;
    });

    return () => {
      disposed = true;
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [
    activeReminder,
    commandTasks,
    manualPetState,
    normalizeCommandTask,
    playCommandAlertSound,
    refreshCommandTasks,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      commandTasks.forEach((task) => {
        if (!commandService.isActiveStatus(task.status)) {
          return;
        }
        const lastOutput = lastOutputAtRef.current[task.id] ?? now;
        const timeoutMs = task.noOutputTimeoutMinutes * 60_000;
        if (now - lastOutput < timeoutMs) {
          return;
        }
        if (task.status === "no_output_timeout") {
          return;
        }
        void commandAlertService.triggerNoOutputTimeout(task, {
          onNeedsUserInput: () => undefined,
          onNoOutputTimeout: () => {
            if (!activeReminder) {
              setPetState("warning");
              setActiveMessage("命令已经一段时间没有新输出了");
            }
            void playCommandAlertSound();
            void refreshCommandTasks();
          },
          onOutputReceived: (taskId) => {
            lastOutputAtRef.current[taskId] = Date.now();
          },
        });
      });
    }, 15_000);

    return () => window.clearInterval(timer);
  }, [activeReminder, commandTasks, playCommandAlertSound, refreshCommandTasks]);

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

  const handleCreateCommandTask = useCallback(async (input: CreateCommandTaskInput) => {
    const task = await commandService.createTask(input);
    await refreshCommandTasks();
    return task;
  }, [refreshCommandTasks]);

  const handleUpdateCommandTask = useCallback(
    async (task: CommandTask) => {
      await commandService.updateTask(task);
      await refreshCommandTasks();
    },
    [refreshCommandTasks],
  );

  const handleDeleteCommandTask = useCallback(
    async (task: CommandTask) => {
      if (!window.confirm(`确定删除命令任务“${task.title}”吗？`)) {
        return;
      }
      await commandService.deleteTask(task);
      if (selectedCommandTaskId === task.id) {
        setSelectedCommandTaskId(null);
      }
      await refreshCommandTasks();
    },
    [refreshCommandTasks, selectedCommandTaskId],
  );

  const handleStartCommandTask = useCallback(
    async (task: CommandTask) => {
      setCommandError("");
      try {
        if (!activeReminder) {
          setPetState("focusing");
          setActiveMessage("任务正在执行");
        }
        const events = await commandService.listEvents(task.id);
        setCommandEvents((current) => ({ ...current, [task.id]: events }));
        setSelectedCommandTaskId(task.id);
        lastOutputAtRef.current[task.id] = Date.now();
        await commandService.startTask(task);
        await refreshCommandTasks();
      } catch (startError) {
        if (!activeReminder) {
          setPetState(manualPetState);
          setActiveMessage("");
        }
        setCommandError(startError instanceof Error ? startError.message : "启动命令失败");
        throw startError;
      }
    },
    [activeReminder, manualPetState, refreshCommandTasks],
  );

  const handleCancelCommandTask = useCallback(
    async (task: CommandTask) => {
      setCommandError("");
      try {
        await commandService.cancelTask(task.id);
        await refreshCommandTasks();
        if (!activeReminder) {
          setPetState(manualPetState);
          setActiveMessage("任务已取消");
        }
      } catch (cancelError) {
        setCommandError(cancelError instanceof Error ? cancelError.message : "取消任务失败");
      }
    },
    [activeReminder, manualPetState, refreshCommandTasks],
  );

  const handleRerunCommandTask = useCallback(
    async (task: CommandTask) => {
      const reset = await commandService.resetTaskForRerun(task);
      await refreshCommandTasks();
      await handleStartCommandTask(reset);
    },
    [handleStartCommandTask, refreshCommandTasks],
  );

  const handlePickWorkingDirectory = useCallback(
    () => commandService.pickWorkingDirectory(),
    [],
  );

  const handleContinueWaitingCommandTask = useCallback(
    async (task: CommandTask) => {
      lastOutputAtRef.current[task.id] = Date.now();
      await commandService.updateTaskStatus(task.id, "running", "用户选择继续等待");
      await refreshCommandTasks();
      if (!activeReminder) {
        setPetState("focusing");
        setActiveMessage("继续监控任务输出");
      }
    },
    [activeReminder, refreshCommandTasks],
  );

  const handleSummarizeCommandFailure = useCallback(
    async (task: CommandTask) => {
      if (!aiReady) {
        throw new Error("请先启用本地 AI 并选择模型。");
      }
      const events = await commandService.listEvents(task.id);
      const logs = commandService
        .filterLogEvents(events)
        .slice(-12)
        .map((event) => event.content ?? "")
        .join("\n");
      if (!logs.trim()) {
        throw new Error("没有可总结的日志内容。");
      }
      if (
        !window.confirm(
          "将把最近一小段 stdout / stderr 发送到你当前配置的 Ollama 地址进行总结。请确认隐私风险。",
        )
      ) {
        return;
      }
      setPetState("thinking");
      setActiveMessage("我在请本地模型总结失败原因。");
      try {
        const reply = await ollamaService.chat(localAiSettings, [
          {
            role: "user",
            content: `请用中文简要总结以下命令失败的可能原因，不要建议自动执行任何命令：\n${logs}`,
          },
        ]);
        setActiveMessage(reply.slice(0, 120));
        setPetState("warning");
      } catch (summaryError) {
        setPetState("warning");
        throw summaryError;
      }
    },
    [aiReady, localAiSettings],
  );

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
      commandTasks,
      commandEvents,
      selectedCommandTaskId,
      setSelectedCommandTaskId,
      commandError,
      setCommandError,
      refreshCommandTasks,
      handleCreateCommandTask,
      handleUpdateCommandTask,
      handleDeleteCommandTask,
      handleStartCommandTask,
      handleCancelCommandTask,
      handleRerunCommandTask,
      handlePickWorkingDirectory,
      handleContinueWaitingCommandTask,
      handleSummarizeCommandFailure,
      recentCommandTasks,
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
      commandTasks,
      commandEvents,
      selectedCommandTaskId,
      commandError,
      refreshCommandTasks,
      handleCreateCommandTask,
      handleUpdateCommandTask,
      handleDeleteCommandTask,
      handleStartCommandTask,
      handleCancelCommandTask,
      handleRerunCommandTask,
      handlePickWorkingDirectory,
      handleContinueWaitingCommandTask,
      handleSummarizeCommandFailure,
      recentCommandTasks,
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
