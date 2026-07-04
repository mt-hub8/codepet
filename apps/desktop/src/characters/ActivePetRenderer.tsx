import { PetAvatar } from "../pet/PetAvatar";
import type { PetState } from "../pet/petState";
import type { PetAsset } from "./petAssetTypes";
import { petStateToAnimation } from "./petSpriteUtils";
import { SpritePetRenderer } from "./SpritePetRenderer";
import { petAssetService } from "./petAssetService";

type ActivePetRendererProps = {
  state: PetState;
  pet: PetAsset;
  scale?: number;
  className?: string;
};

export function ActivePetRenderer({ state, pet, scale = 0.42, className = "" }: ActivePetRendererProps) {
  if (pet.source === "built_in" || !pet.grid || !pet.animations || !pet.spritesheetPath) {
    return <PetAvatar state={state} />;
  }

  const spritesheetUrl = petAssetService.getSpritesheetUrl(pet);
  if (!spritesheetUrl) {
    return <PetAvatar state={state} />;
  }

  return (
    <div className={`active-pet-renderer ${className}`}>
      <SpritePetRenderer
        spritesheetUrl={spritesheetUrl}
        grid={pet.grid}
        animations={pet.animations}
        animationState={petStateToAnimation(state)}
        scale={scale}
      />
    </div>
  );
}
