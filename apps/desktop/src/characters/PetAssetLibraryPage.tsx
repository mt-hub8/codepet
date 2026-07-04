import { useApp } from "../app/AppProvider";
import { BUILT_IN_PET_ID, petSourceLabels, type PetAsset } from "./petAssetTypes";
import { petAssetService } from "./petAssetService";
import { PetImportPanel } from "./PetImportPanel";
import { PetAnimationPreview } from "./PetAnimationPreview";
import { ActivePetRenderer } from "./ActivePetRenderer";
import { useState } from "react";

function PetAssetCard({
  pet,
  isCurrent,
  onSetCurrent,
  onDelete,
}: {
  pet: PetAsset;
  isCurrent: boolean;
  onSetCurrent: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const spritesheetUrl = petAssetService.getSpritesheetUrl(pet);
  const canPreview = Boolean(pet.grid && pet.animations && spritesheetUrl);

  return (
    <article className={`cp-card pet-asset-card ${isCurrent ? "pet-asset-card-current" : ""}`}>
      <div className="pet-asset-card-top">
        <div className="pet-asset-card-preview">
          <ActivePetRenderer state="idle" pet={pet} scale={0.35} />
        </div>
        <div className="pet-asset-card-meta">
          <h3>{pet.displayName}</h3>
          <div className="pet-asset-card-tags">
            <span className="cp-tag cp-tag-muted">{petSourceLabels[pet.source]}</span>
            {isCurrent && <span className="cp-tag cp-tag-primary">当前桌宠</span>}
          </div>
          {pet.description && <p>{pet.description}</p>}
        </div>
      </div>

      {canPreview && spritesheetUrl && pet.grid && pet.animations && (
        <div className="pet-asset-card-preview-toggle">
          <button
            type="button"
            className="cp-btn cp-btn-sm"
            onClick={() => setShowPreview((value) => !value)}
          >
            {showPreview ? "收起动画预览" : "预览动画状态"}
          </button>
          {showPreview && (
            <PetAnimationPreview
              spritesheetUrl={spritesheetUrl}
              grid={pet.grid}
              animations={pet.animations}
              scale={0.32}
            />
          )}
        </div>
      )}

      <div className="pet-asset-card-actions">
        {!isCurrent && (
          <button type="button" className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => onSetCurrent(pet.id)}>
            设为当前桌宠
          </button>
        )}
        {pet.source === "user_imported" && onDelete && (
          <button type="button" className="cp-btn cp-btn-danger cp-btn-sm" onClick={() => onDelete(pet.id)}>
            删除
          </button>
        )}
      </div>
    </article>
  );
}

export function PetAssetLibraryPage() {
  const {
    petAssets,
    currentPetId,
    petAssetError,
    setPetAssetError,
    refreshPetAssets,
    handleSetCurrentPet,
    handleDeletePetAsset,
  } = useApp();

  const sortedAssets = [...petAssets].sort((a, b) => {
    if (a.id === BUILT_IN_PET_ID) return -1;
    if (b.id === BUILT_IN_PET_ID) return 1;
    return 0;
  });

  return (
    <>
      <div className="v04-banner">
        CodePet 默认不内置第三方社区素材。导入素材仅保存在本机，不上传。请自行确认版权与使用权限。
      </div>

      {petAssetError && (
        <div className="cp-alert cp-alert-warning" role="alert">
          {petAssetError}
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => setPetAssetError("")}>
            关闭
          </button>
        </div>
      )}

      <PetImportPanel
        onImported={refreshPetAssets}
        onError={(message) => setPetAssetError(message)}
      />

      <section className="pet-asset-list">
        <h2>宠物库</h2>
        <div className="pet-asset-grid">
          {sortedAssets.map((pet) => (
            <PetAssetCard
              key={pet.id}
              pet={pet}
              isCurrent={currentPetId === pet.id}
              onSetCurrent={handleSetCurrentPet}
              onDelete={pet.id === BUILT_IN_PET_ID ? undefined : handleDeletePetAsset}
            />
          ))}
        </div>
      </section>
    </>
  );
}
