import { defaultCharacterFace } from "../characters/defaultCharacter";
import type { PetState } from "./petState";

type PetAvatarProps = {
  state: PetState;
};

export function PetAvatar({ state }: PetAvatarProps) {
  return (
    <div className={`pet-avatar pet-avatar-${state}`} aria-label={`CodePet ${state}`}>
      <div className="pet-ear pet-ear-left" />
      <div className="pet-ear pet-ear-right" />
      <div className="pet-face">{defaultCharacterFace[state]}</div>
      <div className="pet-shadow" />
    </div>
  );
}

