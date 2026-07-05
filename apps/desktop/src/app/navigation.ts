export type MainNavRoute =
  | "home"
  | "reminders"
  | "local-ai"
  | "characters"
  | "tasks"
  | "settings";

export type AppRoute = MainNavRoute | "work-status" | "pet-hatch";

export type NavItem = {
  id: MainNavRoute;
  label: string;
};

export const navItems: NavItem[] = [
  { id: "home", label: "首页" },
  { id: "reminders", label: "提醒" },
  { id: "local-ai", label: "本地 AI" },
  { id: "characters", label: "角色" },
  { id: "tasks", label: "任务监控" },
  { id: "settings", label: "设置" },
];

export const DEFAULT_ROUTE: AppRoute = "home";
