export const theme = {
  colors: {
    background: "#F7F5F0",
    appSurface: "#FBFAF7",
    surface: "#FFFFFF",
    surfaceSoft: "#FAF9F5",
    border: "#E8E2D8",
    textPrimary: "#242424",
    textSecondary: "#6F6A60",
    textMuted: "#9A9488",
    accentGreen: "#6F9A72",
    accentGreenSoft: "#EEF7EF",
    accentBlue: "#5D95D8",
    accentBlueSoft: "#EEF6FF",
    accentAmber: "#C99A4A",
    accentAmberSoft: "#FFF4DF",
    accentMint: "#72BFA0",
    accentMintSoft: "#EEF9F4",
    danger: "#D85C5C",
    dangerSoft: "#FFF0F0",
  },
  radius: {
    card: "20px",
    panel: "26px",
    button: "14px",
  },
  shadow: {
    card: "0 12px 30px rgba(30, 25, 18, 0.06)",
    subtle: "0 4px 14px rgba(30, 25, 18, 0.04)",
  },
} as const;

export type RoleAccent = "green" | "blue" | "amber" | "mint";

export const roleAccentMap: Record<RoleAccent, { color: string; soft: string }> = {
  green: { color: theme.colors.accentGreen, soft: theme.colors.accentGreenSoft },
  blue: { color: theme.colors.accentBlue, soft: theme.colors.accentBlueSoft },
  amber: { color: theme.colors.accentAmber, soft: theme.colors.accentAmberSoft },
  mint: { color: theme.colors.accentMint, soft: theme.colors.accentMintSoft },
};
