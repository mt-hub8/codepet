import { invoke } from "@tauri-apps/api/core";

export async function startWindowDrag() {
  await invoke("start_window_drag");
}

export async function toggleAlwaysOnTop() {
  return await invoke<boolean>("toggle_always_on_top");
}

export async function getAlwaysOnTop() {
  return await invoke<boolean>("get_always_on_top");
}

