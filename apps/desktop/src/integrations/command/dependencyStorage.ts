import { invoke } from "@tauri-apps/api/core";
import type { DependencyDetectionResult } from "./dependencyTypes";

export const dependencyStorage = {
  getSetting: (key: string) => invoke<string | null>("get_agent_tool_setting", { key }),
  saveSetting: (key: string, value: string) =>
    invoke<void>("save_agent_tool_setting", { key, value }),
  detectExecutable: (executable: string, args: string[] = ["--version"]) =>
    invoke<DependencyDetectionResult>("detect_executable", { executable, args }),
};
