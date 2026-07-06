import { GreetingHeader } from "./GreetingHeader";
import { RecentTaskStatusSection } from "./RecentTaskStatusSection";
import { RoleCardSection } from "./RoleCardSection";
import { TodayReminderSection } from "./TodayReminderSection";
import "./home.css";

export function HomePage() {
  return (
    <div className="home-page">
      <GreetingHeader />
      <TodayReminderSection />
      <RoleCardSection />
      <RecentTaskStatusSection />
    </div>
  );
}
