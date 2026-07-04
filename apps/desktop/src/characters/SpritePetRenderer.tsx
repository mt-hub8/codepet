import { useEffect, useMemo, useState } from "react";
import type { AnimationState, PetAnimations, PetGrid } from "./petAssetTypes";
import { getFramePosition, getSpritesheetSize, resolveAnimation } from "./petSpriteUtils";

type SpritePetRendererProps = {
  spritesheetUrl: string;
  grid: PetGrid;
  animations: PetAnimations;
  animationState: AnimationState;
  scale?: number;
  className?: string;
  onLoadError?: () => void;
};

export function SpritePetRenderer({
  spritesheetUrl,
  grid,
  animations,
  animationState,
  scale = 1,
  className = "",
  onLoadError,
}: SpritePetRendererProps) {
  const resolvedState = resolveAnimation(animations, animationState);
  const animation = animations[resolvedState] ?? animations.idle;
  const [frameCursor, setFrameCursor] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setFrameCursor(0);
  }, [resolvedState, spritesheetUrl]);

  useEffect(() => {
    if (!animation) {
      return undefined;
    }
    const intervalMs = 1000 / Math.max(animation.fps, 1);
    const timer = window.setInterval(() => {
      setFrameCursor((current) => {
        const next = current + 1;
        if (next >= animation.frames.length) {
          return animation.loop ? 0 : animation.frames.length - 1;
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [animation]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setLoadFailed(false);
    image.onerror = () => {
      setLoadFailed(true);
      onLoadError?.();
    };
    image.src = spritesheetUrl;
  }, [spritesheetUrl, onLoadError]);

  const sheetSize = useMemo(() => getSpritesheetSize(grid), [grid]);

  if (!animation || loadFailed) {
    return (
      <div className={`sprite-pet-renderer sprite-pet-renderer-error ${className}`}>
        <span>素材加载失败</span>
      </div>
    );
  }

  const frameIndex = animation.frames[frameCursor] ?? animation.frames[0] ?? 0;
  const { x, y } = getFramePosition(grid, animation.row, frameIndex);
  const width = grid.frameWidth * scale;
  const height = grid.frameHeight * scale;

  return (
    <div
      className={`sprite-pet-renderer ${className}`}
      style={{
        width,
        height,
        backgroundImage: `url("${spritesheetUrl}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sheetSize.width * scale}px ${sheetSize.height * scale}px`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
      }}
      aria-label={`宠物动画 ${resolvedState}`}
    />
  );
}
