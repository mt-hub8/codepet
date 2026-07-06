import { ActivePetRenderer } from "../characters/ActivePetRenderer";
import { useApp } from "../app/AppProvider";

export function PetStatusCard() {
  const { displayedState, currentPet } = useApp();

  return (
    <section className="home-pet-card" aria-label="桌宠状态">
      <div className="home-pet-card-visual">
        <ActivePetRenderer state={displayedState} pet={currentPet} scale={0.42} />
      </div>
      <div className="home-pet-card-meta">
        <span className="home-pet-online">
          <span className="home-pet-online-dot" aria-hidden />
          在线
        </span>
        <span className="home-pet-subline">随时为你服务 ✦</span>
      </div>
    </section>
  );
}
