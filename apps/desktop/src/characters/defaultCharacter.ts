import type { PetState } from "../pet/petState";

export const defaultCharacterFace: Record<PetState, string> = {
  idle: "•ᴗ•",
  focusing: "•̀ᴗ•́",
  thinking: "•~•",
  reminding: "•◡•",
  success: "＾▽＾",
  warning: "•_•!",
};
