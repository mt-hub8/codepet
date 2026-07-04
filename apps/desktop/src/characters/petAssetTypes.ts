export const BUILT_IN_PET_ID = "codepet-default";

export type PetAssetSource = "built_in" | "user_imported";

export type AnimationState =
  | "idle"
  | "working"
  | "thinking"
  | "waiting"
  | "done"
  | "sleeping"
  | "warning"
  | "error";

export type PetGrid = {
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
};

export type PetAnimationDef = {
  row: number;
  frames: number[];
  fps: number;
  loop: boolean;
};

export type PetAnimations = Partial<Record<AnimationState, PetAnimationDef>>;

export type PetManifest = {
  id: string;
  displayName: string;
  description?: string;
  spritesheetPath: string;
  grid?: PetGrid;
  animations?: PetAnimations;
};

export type PetAsset = {
  id: string;
  displayName: string;
  description?: string;
  source: PetAssetSource;
  manifestPath?: string;
  spritesheetPath?: string;
  grid?: PetGrid;
  animations?: PetAnimations;
  createdAt?: string;
  updatedAt?: string;
};

export type ParsedPetAsset = {
  manifest: PetManifest;
  grid: PetGrid;
  animations: PetAnimations;
};

export type PetImportPreviewState = {
  folderPath: string;
  spritesheetPath: string;
  parsed: ParsedPetAsset;
  imageWidth: number;
  imageHeight: number;
};

export const animationStateLabels: Record<AnimationState, string> = {
  idle: "待机",
  working: "工作",
  thinking: "思考",
  waiting: "等待",
  done: "完成",
  sleeping: "睡觉",
  warning: "警告",
  error: "错误",
};

export const animationStates: AnimationState[] = [
  "idle",
  "working",
  "thinking",
  "waiting",
  "done",
  "sleeping",
  "warning",
  "error",
];

export const builtInPetAsset: PetAsset = {
  id: BUILT_IN_PET_ID,
  displayName: "CodePet 默认桌宠",
  description: "原创占位形象，无需导入素材即可使用。",
  source: "built_in",
};

export const petSourceLabels: Record<PetAssetSource, string> = {
  built_in: "内置",
  user_imported: "用户导入",
};
