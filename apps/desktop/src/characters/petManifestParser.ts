import type {
  AnimationState,
  PetAnimations,
  PetGrid,
  PetManifest,
  ParsedPetAsset,
} from "./petAssetTypes";

export const DEFAULT_GRID: PetGrid = {
  columns: 8,
  rows: 9,
  frameWidth: 192,
  frameHeight: 208,
};

export const DEFAULT_SHEET_WIDTH = DEFAULT_GRID.columns * DEFAULT_GRID.frameWidth;
export const DEFAULT_SHEET_HEIGHT = DEFAULT_GRID.rows * DEFAULT_GRID.frameHeight;

const DEFAULT_ROW_FRAMES = [0, 1, 2, 3, 4, 5];
const DEFAULT_ROW_FRAMES_FULL = [0, 1, 2, 3, 4, 5, 6, 7];

export function buildDefaultAnimations(grid: PetGrid): PetAnimations {
  const rowFrames = (row: number, frames = DEFAULT_ROW_FRAMES): PetAnimationDefLike => ({
    row,
    frames,
    fps: 8,
    loop: true,
  });

  return {
    idle: { ...rowFrames(0), fps: 8, loop: true },
    working: { row: 1, frames: DEFAULT_ROW_FRAMES_FULL, fps: 10, loop: true },
    thinking: { row: 2, frames: [0, 1, 2, 3], fps: 6, loop: true },
    waiting: { row: 3, frames: [0, 1, 2, 3], fps: 6, loop: true },
    done: { row: 4, frames: [0, 1, 2, 3], fps: 8, loop: false },
    sleeping: { row: 5, frames: [0, 1, 2, 3], fps: 4, loop: true },
    warning: { row: 6, frames: [0, 1, 2, 3], fps: 8, loop: true },
    error: { row: 7, frames: [0, 1, 2, 3], fps: 8, loop: true },
  };
}

type PetAnimationDefLike = {
  row: number;
  frames: number[];
  fps: number;
  loop: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readGrid(value: unknown): PetGrid | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const columns = Number(value.columns);
  const rows = Number(value.rows);
  const frameWidth = Number(value.frameWidth);
  const frameHeight = Number(value.frameHeight);
  if (![columns, rows, frameWidth, frameHeight].every((n) => Number.isFinite(n) && n > 0)) {
    return undefined;
  }
  return { columns, rows, frameWidth, frameHeight };
}

function readAnimations(value: unknown): PetAnimations | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const result: PetAnimations = {};
  (Object.keys(value) as AnimationState[]).forEach((key) => {
    const raw = value[key];
    if (!isRecord(raw)) {
      return;
    }
    const row = Number(raw.row);
    const fps = Number(raw.fps);
    const loop = Boolean(raw.loop);
    const frames = Array.isArray(raw.frames)
      ? raw.frames.map((frame) => Number(frame)).filter((frame) => Number.isFinite(frame))
      : [];
    if (!Number.isFinite(row) || !Number.isFinite(fps) || frames.length === 0) {
      return;
    }
    result[key] = { row, frames, fps, loop };
  });

  return Object.keys(result).length > 0 ? result : undefined;
}

export function parsePetManifest(raw: unknown): PetManifest {
  if (!isRecord(raw)) {
    throw new Error("pet.json 根节点必须是 JSON 对象。");
  }

  const id = readString(raw, "id");
  if (!id) {
    throw new Error("pet.json 缺少必填字段 id。");
  }

  const displayName = readString(raw, "displayName") ?? readString(raw, "name");
  if (!displayName) {
    throw new Error("pet.json 缺少必填字段 displayName（或 name）。");
  }

  const spritesheetPath = readString(raw, "spritesheetPath");
  if (!spritesheetPath) {
    throw new Error("pet.json 缺少必填字段 spritesheetPath。");
  }

  return {
    id,
    displayName,
    description: readString(raw, "description"),
    spritesheetPath,
    grid: readGrid(raw.grid),
    animations: readAnimations(raw.animations),
  };
}

export function inferGrid(
  imageWidth: number,
  imageHeight: number,
  manifest: PetManifest,
): PetGrid {
  if (manifest.grid) {
    const expectedWidth = manifest.grid.columns * manifest.grid.frameWidth;
    const expectedHeight = manifest.grid.rows * manifest.grid.frameHeight;
    if (imageWidth === expectedWidth && imageHeight === expectedHeight) {
      return manifest.grid;
    }
    throw new Error(
      `图片尺寸 ${imageWidth}×${imageHeight} 与 pet.json 中的 grid 不匹配，请检查配置。`,
    );
  }

  if (imageWidth === DEFAULT_SHEET_WIDTH && imageHeight === DEFAULT_SHEET_HEIGHT) {
    return DEFAULT_GRID;
  }

  if (
    imageWidth % DEFAULT_GRID.columns === 0 &&
    imageHeight % DEFAULT_GRID.rows === 0
  ) {
    const frameWidth = imageWidth / DEFAULT_GRID.columns;
    const frameHeight = imageHeight / DEFAULT_GRID.rows;
    if (frameWidth === DEFAULT_GRID.frameWidth && frameHeight === DEFAULT_GRID.frameHeight) {
      return DEFAULT_GRID;
    }
  }

  throw new Error(
    `无法根据图片尺寸 ${imageWidth}×${imageHeight} 自动推断网格。请在 pet.json 中添加 grid 字段，或使用常见的 1536×1872（8×9 / 192×208）spritesheet。`,
  );
}

export function resolvePetAsset(
  manifest: PetManifest,
  imageWidth: number,
  imageHeight: number,
): ParsedPetAsset {
  const grid = inferGrid(imageWidth, imageHeight, manifest);
  const animations = manifest.animations ?? buildDefaultAnimations(grid);
  return { manifest, grid, animations };
}
