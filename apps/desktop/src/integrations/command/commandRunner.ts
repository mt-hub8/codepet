import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export type CommandOutputPayload = {
  taskId: string;
  stream: "stdout" | "stderr";
  content: string;
};

export type CommandFinishedPayload = {
  taskId: string;
  exitCode: number;
  status: "succeeded" | "failed" | "cancelled";
};

export type CommandStatusChangedPayload = {
  taskId: string;
  status: string;
};

export const commandRunner = {
  start: (taskId: string, acknowledgeDangerous = false) =>
    invoke<void>("start_command_task", { taskId, acknowledgeDangerous }),

  cancel: (taskId: string) => invoke<void>("cancel_command_task", { taskId }),

  onOutput: (handler: (payload: CommandOutputPayload) => void) =>
    listen<CommandOutputPayload>("command-output", (event) => handler(event.payload)),

  onFinished: (handler: (payload: CommandFinishedPayload) => void) =>
    listen<CommandFinishedPayload>("command-finished", (event) => handler(event.payload)),

  onStatusChanged: (handler: (payload: CommandStatusChangedPayload) => void) =>
    listen<CommandStatusChangedPayload>("command-status-changed", (event) => handler(event.payload)),

  subscribe: async (handlers: {
    onOutput?: (payload: CommandOutputPayload) => void;
    onFinished?: (payload: CommandFinishedPayload) => void;
    onStatusChanged?: (payload: CommandStatusChangedPayload) => void;
  }): Promise<UnlistenFn[]> => {
    const unlisteners: UnlistenFn[] = [];
    if (handlers.onOutput) {
      unlisteners.push(await commandRunner.onOutput(handlers.onOutput));
    }
    if (handlers.onFinished) {
      unlisteners.push(await commandRunner.onFinished(handlers.onFinished));
    }
    if (handlers.onStatusChanged) {
      unlisteners.push(await commandRunner.onStatusChanged(handlers.onStatusChanged));
    }
    return unlisteners;
  },
};
