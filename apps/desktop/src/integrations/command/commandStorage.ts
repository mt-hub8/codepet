import { invoke } from "@tauri-apps/api/core";
import type { CommandEvent, CommandTask, CommandTaskStatus } from "./commandTypes";

export const commandStorage = {
  listTasks: () => invoke<CommandTask[]>("list_command_tasks"),
  saveTask: (task: CommandTask) => invoke<void>("save_command_task", { task }),
  deleteTask: (id: string) => invoke<void>("delete_command_task", { id }),
  listEvents: (taskId: string) => invoke<CommandEvent[]>("list_command_events", { taskId }),
  clearEvents: (taskId: string) => invoke<void>("clear_command_events", { taskId }),
  updateTaskStatus: (taskId: string, status: CommandTaskStatus, content?: string) =>
    invoke<CommandTask>("update_command_task_status", { taskId, status, content }),
  addEvent: (event: CommandEvent) => invoke<void>("add_command_event", { event }),
};
