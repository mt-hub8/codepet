import { CharactersPage } from "../characters/CharactersPage";
import { HomePage } from "../home/HomePage";
import { LocalAiPage } from "../integrations/ollama/LocalAiPage";
import { RemindersPage } from "../reminders/RemindersPage";
import { SettingsPage } from "../settings/SettingsPage";
import { TasksPage } from "../tasks/TasksPage";
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
    default:
      return <HomePage />;
  }
}
