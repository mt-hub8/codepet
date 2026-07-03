import { useEffect, useState } from "react";
import {
  getAlwaysOnTop,
  startWindowDrag,
  toggleAlwaysOnTop,
} from "../shared/desktopWindowService";
import { PetAvatar } from "./PetAvatar";
import { PetBubble } from "./PetBubble";
import { PetStatusPanel } from "./PetStatusPanel";
import type { PetState } from "./petState";

export function PetShell() {
  const [petState, setPetState] = useState<PetState>("idle");
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  useEffect(() => {
    getAlwaysOnTop()
      .then(setIsAlwaysOnTop)
      .catch(() => setIsAlwaysOnTop(false));
  }, []);

  async function handleToggleAlwaysOnTop() {
    const nextValue = await toggleAlwaysOnTop();
    setIsAlwaysOnTop(nextValue);
  }

  return (
    <main className={`pet-shell pet-shell-${petState}`}>
      <header
        className="drag-region"
        data-tauri-drag-region
        onMouseDown={() => void startWindowDrag()}
      >
        <span>CodePet</span>
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={handleToggleAlwaysOnTop}
        >
          {isAlwaysOnTop ? "取消置顶" : "窗口置顶"}
        </button>
      </header>

      <PetBubble state={petState} />
      <PetAvatar state={petState} />
      <PetStatusPanel currentState={petState} onChange={setPetState} />
    </main>
  );
}
