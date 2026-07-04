import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  BUILT_IN_PET_ID,
  builtInPetAsset,
  type PetAsset,
  type PetImportPreviewState,
} from "./petAssetTypes";
import { parsePetManifest, resolvePetAsset } from "./petManifestParser";
import { loadImageDimensions } from "./petSpriteUtils";
import { petAssetStorage } from "./petAssetStorage";

export const petAssetService = {
  getBuiltInPet: () => builtInPetAsset,

  async pickImportSource(): Promise<string | null> {
    const selected = await open({
      multiple: false,
      directory: true,
    });
    if (!selected || Array.isArray(selected)) {
      const fileSelected = await open({
        multiple: false,
        filters: [{ name: "宠物配置", extensions: ["json"] }],
      });
      if (!fileSelected || Array.isArray(fileSelected)) {
        return null;
      }
      return fileSelected;
    }
    return selected;
  },

  async previewImport(sourcePath: string): Promise<PetImportPreviewState> {
    const preview = await petAssetStorage.previewImport(sourcePath);
    const manifest = parsePetManifest(preview.manifest);
    const spritesheetUrl = convertFileSrc(preview.spritesheetPath);
    const { width, height } = await loadImageDimensions(spritesheetUrl);
    const parsed = resolvePetAsset(manifest, width, height);

    return {
      folderPath: preview.folderPath,
      spritesheetPath: preview.spritesheetPath,
      parsed,
      imageWidth: width,
      imageHeight: height,
    };
  },

  async importFromPreview(preview: PetImportPreviewState): Promise<PetAsset> {
    return petAssetStorage.importAsset({
      sourceFolder: preview.folderPath,
      grid: preview.parsed.grid,
      animations: preview.parsed.animations,
    });
  },

  async listImportedAssets(): Promise<PetAsset[]> {
    return petAssetStorage.listAssets();
  },

  async listAllAssets(): Promise<PetAsset[]> {
    const imported = await this.listImportedAssets();
    return [builtInPetAsset, ...imported];
  },

  async deleteAsset(id: string): Promise<void> {
    if (id === BUILT_IN_PET_ID) {
      throw new Error("内置默认宠物不能删除。");
    }
    await petAssetStorage.deleteAsset(id);
  },

  async getCurrentPetId(): Promise<string | null> {
    return petAssetStorage.getCurrentPetId();
  },

  async setCurrentPet(id: string): Promise<void> {
    if (id === BUILT_IN_PET_ID) {
      await petAssetStorage.setCurrentPetId(null);
      return;
    }
    await petAssetStorage.setCurrentPetId(id);
  },

  async resolveCurrentPet(assets: PetAsset[]): Promise<PetAsset> {
    const currentId = await this.getCurrentPetId();
    const match = assets.find((asset) => asset.id === currentId);
    if (match?.source === "user_imported" && match.grid && match.spritesheetPath) {
      return match;
    }
    return builtInPetAsset;
  },

  getSpritesheetUrl(asset: PetAsset): string | null {
    if (!asset.spritesheetPath) {
      return null;
    }
    return convertFileSrc(asset.spritesheetPath);
  },
};
