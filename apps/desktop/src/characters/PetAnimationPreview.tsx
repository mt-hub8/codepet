import { useState } from "react";
import type { AnimationState, PetAnimations, PetGrid } from "./petAssetTypes";
import { animationStateLabels, animationStates } from "./petAssetTypes";
import { SpritePetRenderer } from "./SpritePetRenderer";

type PetAnimationPreviewProps = {
  spritesheetUrl: string;
  grid: PetGrid;
  animations: PetAnimations;
  scale?: number;
};

export function PetAnimationPreview({
  spritesheetUrl,
  grid,
  animations,
  scale = 0.45,
}: PetAnimationPreviewProps) {
  const [previewState, setPreviewState] = useState<AnimationState>("idle");

  return (
    <div className="pet-animation-preview">
      <div className="pet-animation-preview-stage">
        <SpritePetRenderer
          spritesheetUrl={spritesheetUrl}
          grid={grid}
          animations={animations}
          animationState={previewState}
          scale={scale}
        />
      </div>
      <div className="pet-animation-preview-actions">
        {animationStates.map((state) => (
          <button
            key={state}
            type="button"
            className={`cp-btn cp-btn-sm ${previewState === state ? "cp-btn-primary" : ""}`}
            onClick={() => setPreviewState(state)}
          >
            {animationStateLabels[state]}
          </button>
        ))}
      </div>
    </div>
  );
}
