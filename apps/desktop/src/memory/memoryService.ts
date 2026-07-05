import type { BasicMemoryType } from "./memoryTypes";
import { memoryStorage } from "./memoryStorage";

export const memoryService = {
  list: () => memoryStorage.list(),

  async remember(
    type: BasicMemoryType,
    key: string,
    value: string,
    source = "app",
  ): Promise<void> {
    await memoryStorage.save({ type, key, value, source });
  },

  async getValue(key: string): Promise<string | undefined> {
    const items = await memoryStorage.list();
    return items.find((item) => item.key === key)?.value;
  },

  async isOnboardingCompleted(): Promise<boolean> {
    const value = await this.getValue("onboarding_completed");
    return value === "true";
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.remember("preference", "onboarding_completed", completed ? "true" : "false", "onboarding");
    if (completed) {
      await this.remember("preference", "onboarding_completed_at", new Date().toISOString(), "onboarding");
    }
  },

  async setOnboardingSkipped(skipped: boolean): Promise<void> {
    await this.remember("preference", "onboarding_skipped", skipped ? "true" : "false", "onboarding");
  },

  async isOnboardingSkipped(): Promise<boolean> {
    const value = await this.getValue("onboarding_skipped");
    return value === "true";
  },

  async getOnboardingCompletedAt(): Promise<string | undefined> {
    return this.getValue("onboarding_completed_at");
  },

  async incrementCounter(key: string, source: string): Promise<void> {
    const current = Number((await this.getValue(key)) ?? "0");
    await this.remember("behavior", key, String(current + 1), source);
  },

  async appendUniqueList(key: string, entry: string, source: string): Promise<void> {
    const raw = await this.getValue(key);
    const list = raw ? raw.split(",").map((item) => item.trim()).filter(Boolean) : [];
    if (!list.includes(entry)) {
      list.unshift(entry);
    }
    await this.remember("recent", key, list.slice(0, 10).join(","), source);
  },

  delete: (id: string) => memoryStorage.delete(id),
};
