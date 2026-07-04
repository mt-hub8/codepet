import { GreetingHeader } from "./GreetingHeader";
import { RecentTaskStatusSection } from "./RecentTaskStatusSection";
import { RoleCardSection } from "./RoleCardSection";
import { TodayReminderSection } from "./TodayReminderSection";

export function HomePage() {
  return (
    <div className="page-stack home-grid">
      <GreetingHeader />
      <TodayReminderSection />
      <RoleCardSection />
      <RecentTaskStatusSection />
    </div>
  );
}
