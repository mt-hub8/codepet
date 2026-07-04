import type { PetState } from "../pet/petState";
import type { AnimationState, PetAnimations, PetGrid } from "./petAssetTypes";

export function petStateToAnimation(state: PetState): AnimationState {
  switch (state) {
    case "idle":
      return "idle";
    case "focusing":
      return "working";
    case "thinking":
      return "thinking";
    case "reminding":
      return "waiting";
    case "success":
      return "done";
    case "warning":
      return "warning";
    default:
      return "idle";
  }
}

export function resolveAnimation(
  animations: PetAnimations,
  state: AnimationState,
): AnimationState {
  if (animations[state]) {
    return state;
  }
  return animations.idle ? "idle" : state;
}

export function getFramePosition(
  grid: PetGrid,
  row: number,
  frameIndex: number,
): { x: number; y: number } {
  return {
    x: frameIndex * grid.frameWidth,
    y: row * grid.frameHeight,
  };
}

export function getSpritesheetSize(grid: PetGrid): { width: number; height: number } {
  return {
    width: grid.columns * grid.frameWidth,
    height: grid.rows * grid.frameHeight,
  };
}

export async function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("spritesheet 图片加载失败，请确认文件未损坏且格式为 png 或 webp。"));
    image.src = src;
  });
}
