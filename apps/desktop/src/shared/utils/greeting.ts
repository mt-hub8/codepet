export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "早安";
  }
  if (hour < 18) {
    return "下午好";
  }
  return "晚上好";
}
