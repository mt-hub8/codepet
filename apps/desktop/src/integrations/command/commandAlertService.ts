import { getAgentAdapter } from "./agentAdapters";
import { detectNeedsUserInput, mergeDetectionKeywords } from "./commandDetection";
import { commandService } from "./commandService";
import type { CommandTask } from "./commandTypes";

export type CommandAlertCallbacks = {
  onNeedsUserInput: (task: CommandTask, line: string) => void;
  onNoOutputTimeout: (task: CommandTask) => void;
  onOutputReceived: (taskId: string) => void;
};

export const commandAlertService = {
  async handleOutputLine(
    task: CommandTask,
    line: string,
    customKeywords: string[],
    callbacks: CommandAlertCallbacks,
  ): Promise<void> {
    callbacks.onOutputReceived(task.id);

    if (task.status !== "running" && task.status !== "no_output_timeout") {
      return;
    }

    const adapter = getAgentAdapter(task.adapterType);
    const keywords = mergeDetectionKeywords(customKeywords);
    const needsInput = detectNeedsUserInput(line, {
      adapterType: task.adapterType,
      keywords,
      adapterDetect: adapter.detectNeedsUserInput,
    });

    if (!needsInput) {
      if (task.status === "no_output_timeout") {
        const restored = await commandService.updateTaskStatus(task.id, "running", "收到新输出，恢复运行中");
        callbacks.onOutputReceived(restored.id);
      }
      return;
    }

    const updated = await commandService.updateTaskStatus(
      task.id,
      "needs_user_input",
      line.slice(0, 500),
    );
    callbacks.onNeedsUserInput(updated, line);
  },

  async triggerNoOutputTimeout(
    task: CommandTask,
    callbacks: CommandAlertCallbacks,
  ): Promise<void> {
    if (!commandService.isActiveStatus(task.status)) {
      return;
    }
    const updated = await commandService.updateTaskStatus(
      task.id,
      "no_output_timeout",
      `超过 ${task.noOutputTimeoutMinutes} 分钟没有新输出`,
    );
    callbacks.onNoOutputTimeout(updated);
  },
};
