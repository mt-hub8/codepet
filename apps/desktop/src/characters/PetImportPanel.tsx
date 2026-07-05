import { useState } from "react";
import { useApp } from "../app/AppProvider";
import type { PetImportPreviewState } from "./petAssetTypes";
import { petAssetService } from "./petAssetService";
import { PetAnimationPreview } from "./PetAnimationPreview";

type PetImportPanelProps = {
  onImported: () => Promise<void>;
  onError: (message: string) => void;
};

export function PetImportPanel({ onImported, onError }: PetImportPanelProps) {
  const { navigate } = useApp();
  const [preview, setPreview] = useState<PetImportPreviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handlePickFolder = async () => {
    setIsLoading(true);
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({ multiple: false, directory: true });
      if (!selected || Array.isArray(selected)) {
        return;
      }
      const nextPreview = await petAssetService.previewImport(selected);
      setPreview(nextPreview);
    } catch (error) {
      onError(error instanceof Error ? error.message : "导入预览失败");
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickManifest = async () => {
    setIsLoading(true);
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        filters: [{ name: "宠物配置", extensions: ["json"] }],
      });
      if (!selected || Array.isArray(selected)) {
        return;
      }
      const nextPreview = await petAssetService.previewImport(selected);
      setPreview(nextPreview);
    } catch (error) {
      onError(error instanceof Error ? error.message : "导入预览失败");
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) {
      return;
    }
    setIsImporting(true);
    try {
      await petAssetService.importFromPreview(preview);
      setPreview(null);
      await onImported();
    } catch (error) {
      onError(error instanceof Error ? error.message : "导入失败");
    } finally {
      setIsImporting(false);
    }
  };

  const spritesheetUrl = preview
    ? petAssetService.getSpritesheetUrl({
        id: preview.parsed.manifest.id,
        displayName: preview.parsed.manifest.displayName,
        source: "user_imported",
        spritesheetPath: preview.spritesheetPath,
      })
    : null;

  return (
    <section className="cp-card pet-import-panel">
      <div className="pet-import-panel-header">
        <div>
          <h2>导入宠物</h2>
          <p>支持 pet.json + spritesheet.png / webp 文件夹。请自行确认素材版权与使用权限。</p>
        </div>
        <div className="pet-import-panel-actions">
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={() => void handlePickFolder()}
            disabled={isLoading || isImporting}
          >
            选择文件夹
          </button>
          <button
            type="button"
            className="cp-btn"
            onClick={() => void handlePickManifest()}
            disabled={isLoading || isImporting}
          >
            选择 pet.json
          </button>
          <button type="button" className="cp-btn" onClick={() => navigate("pet-hatch")}>
            宠物孵化向导
          </button>
        </div>
      </div>

      {preview && spritesheetUrl && (
        <div className="pet-import-preview">
          <div className="pet-import-meta">
            <strong>{preview.parsed.manifest.displayName}</strong>
            <span className="cp-tag cp-tag-muted">ID: {preview.parsed.manifest.id}</span>
            <span className="cp-tag cp-tag-muted">
              图片 {preview.imageWidth}×{preview.imageHeight}
            </span>
            {preview.parsed.manifest.description && <p>{preview.parsed.manifest.description}</p>}
          </div>
          <PetAnimationPreview
            spritesheetUrl={spritesheetUrl}
            grid={preview.parsed.grid}
            animations={preview.parsed.animations}
          />
          <div className="pet-import-confirm">
            <button
              type="button"
              className="cp-btn cp-btn-primary"
              onClick={() => void handleConfirmImport()}
              disabled={isImporting}
            >
              {isImporting ? "导入中…" : "确认导入"}
            </button>
            <button
              type="button"
              className="cp-btn"
              onClick={() => setPreview(null)}
              disabled={isImporting}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
