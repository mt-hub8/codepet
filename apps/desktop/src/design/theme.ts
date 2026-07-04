export const theme = {
  colors: {
    background: "#F7F5F0",
    surface: "#FFFFFF",
    surfaceSoft: "#FAF9F5",
    border: "#E8E3D8",
    textPrimary: "#242424",
    textSecondary: "#6F6A60",
    textMuted: "#9A9488",
    accentGreen: "#6F8F5F",
    accentGreenSoft: "#EEF5EA",
    accentBlue: "#6B93C8",
    accentBlueSoft: "#EEF5FF",
    accentAmber: "#C99A4A",
    accentAmberSoft: "#FFF4DF",
    danger: "#D85C5C",
    dangerSoft: "#FFF0F0",
  },
  radius: {
    card: "18px",
    panel: "22px",
    button: "14px",
  },
  shadow: {
    card: "0 10px 30px rgba(35, 31, 25, 0.06)",
    subtle: "0 4px 14px rgba(35, 31, 25, 0.04)",
  },
} as const;

export type RoleAccent = "green" | "blue" | "amber" | "mint";

export const roleAccentMap: Record<
  RoleAccent,
  { color: string; soft: string }
> = {
  green: { color: theme.colors.accentGreen, soft: theme.colors.accentGreenSoft },
  blue: { color: theme.colors.accentBlue, soft: theme.colors.accentBlueSoft },
  amber: { color: theme.colors.accentAmber, soft: theme.colors.accentAmberSoft },
  mint: { color: "#5F9F8F", soft: "#E8F5F0" },
};
