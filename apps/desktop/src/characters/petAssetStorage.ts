import { invoke } from "@tauri-apps/api/core";
import type { PetAsset, PetGrid, PetAnimations } from "./petAssetTypes";

export type PetAssetRecordDto = {
  id: string;
  displayName: string;
  description?: string;
  source: string;
  manifestPath: string;
  spritesheetPath: string;
  gridJson: string;
  animationsJson: string;
  createdAt: string;
  updatedAt: string;
};

export type PetImportPreviewDto = {
  folderPath: string;
  manifestPath: string;
  spritesheetPath: string;
  manifest: unknown;
};

function mapRecord(record: PetAssetRecordDto): PetAsset {
  let grid: PetGrid | undefined;
  let animations: PetAnimations | undefined;
  try {
    grid = JSON.parse(record.gridJson) as PetGrid;
    animations = JSON.parse(record.animationsJson) as PetAnimations;
  } catch {
    grid = undefined;
    animations = undefined;
  }

  return {
    id: record.id,
    displayName: record.displayName,
    description: record.description,
    source: record.source === "built_in" ? "built_in" : "user_imported",
    manifestPath: record.manifestPath,
    spritesheetPath: record.spritesheetPath,
    grid,
    animations,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const petAssetStorage = {
  previewImport: (sourcePath: string) =>
    invoke<PetImportPreviewDto>("preview_pet_import", { sourcePath }),

  importAsset: (input: {
    sourceFolder: string;
    grid: PetGrid;
    animations: PetAnimations;
  }) =>
    invoke<PetAssetRecordDto>("import_pet_asset", {
      sourceFolder: input.sourceFolder,
      gridJson: JSON.stringify(input.grid),
      animationsJson: JSON.stringify(input.animations),
    }).then(mapRecord),

  listAssets: () =>
    invoke<PetAssetRecordDto[]>("list_pet_assets").then((records) => records.map(mapRecord)),

  deleteAsset: (id: string) => invoke<void>("delete_pet_asset", { id }),

  getCurrentPetId: () => invoke<string | null>("get_current_pet_id"),

  setCurrentPetId: (id: string | null) => invoke<void>("set_current_pet_id", { id }),
};
