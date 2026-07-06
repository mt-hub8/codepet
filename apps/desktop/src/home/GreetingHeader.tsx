import { getTimeGreeting } from "../shared/utils/greeting";
import { PetStatusCard } from "./PetStatusCard";

const USER_NAME = "张小北";

export function GreetingHeader() {
  const greeting = getTimeGreeting();

  return (
    <header className="home-greeting">
      <div className="home-greeting-copy">
        <h1>
          {greeting}，{USER_NAME} 👋
        </h1>
        <p>今天也由 CodePet 陪你高效编码 ✨</p>
      </div>
      <PetStatusCard />
    </header>
  );
}
