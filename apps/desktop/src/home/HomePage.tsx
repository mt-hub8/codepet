import { GreetingHeader } from "./GreetingHeader";
import { RecentTaskStatusSection } from "./RecentTaskStatusSection";
import { RoleCardSection } from "./RoleCardSection";
import { SystemStatusHint } from "./SystemStatusHint";
import { TodayReminderSection } from "./TodayReminderSection";
import { WorkStatusSummarySection } from "../work-status/WorkStatusSummarySection";

export function HomePage() {
  return (
    <div className="page-stack home-grid">
      <GreetingHeader />
      <SystemStatusHint />
      <WorkStatusSummarySection />
      <TodayReminderSection />
      <RoleCardSection />
      <RecentTaskStatusSection />
    </div>
  );
}
