import { CharactersPage } from "../characters/CharactersPage";
import { PetHatchWizardPage } from "../characters/hatch/PetHatchWizardPage";
import { HomePage } from "../home/HomePage";
import { LocalAiPage } from "../integrations/ollama/LocalAiPage";
import { RemindersPage } from "../reminders/RemindersPage";
import { SettingsPage } from "../settings/SettingsPage";
import { TasksPage } from "../tasks/TasksPage";
import { WorkStatusPage } from "../work-status/WorkStatusPage";
import { useApp } from "./AppProvider";

export function AppRoutes() {
  const { currentRoute } = useApp();

  switch (currentRoute) {
    case "home":
      return <HomePage />;
    case "reminders":
      return <RemindersPage />;
    case "local-ai":
      return <LocalAiPage />;
    case "characters":
      return <CharactersPage />;
    case "tasks":
      return <TasksPage />;
    case "settings":
      return <SettingsPage />;
    case "work-status":
      return <WorkStatusPage />;
    case "pet-hatch":
      return <PetHatchWizardPage />;
    default:
      return <HomePage />;
  }
}
