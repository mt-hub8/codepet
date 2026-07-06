import type { ReminderType } from "../reminders/reminderTypes";

export type DemoReminderCard = {
  id: string;
  title: string;
  description: string;
  footer?: string;
  accent: "green" | "blue" | "amber";
  icon: "calendar" | "folder" | "study";
};

export type DemoTaskRow = {
  id: string;
  title: string;
  meta: string;
  status: "succeeded" | "needs_user_input" | "failed";
  statusLabel: string;
  actionLabel: string;
};

export const demoReminderCards: DemoReminderCard[] = [
  {
    id: "demo-1",
    title: "站会 · 10:00",
    description: "研发进度同步会议",
    footer: "即将开始",
    accent: "green",
    icon: "calendar",
  },
  {
    id: "demo-2",
    title: "PR 评审待处理",
    description: "有 2 个 Pull Request 需要你审批",
    accent: "blue",
    icon: "folder",
  },
  {
    id: "demo-3",
    title: "学习计划",
    description: "每日一课：Rust 异步编程",
    footer: "今天 18:00",
    accent: "amber",
    icon: "study",
  },
];

export const demoTaskRows: DemoTaskRow[] = [
  {
    id: "demo-task-1",
    title: "重构用户认证模块",
    meta: "严格工程师 · 2 分钟前",
    status: "succeeded",
    statusLabel: "已完成",
    actionLabel: "查看结果",
  },
  {
    id: "demo-task-2",
    title: "生成产品需求文档",
    meta: "产品经理 · 15 分钟前",
    status: "needs_user_input",
    statusLabel: "等待确认",
    actionLabel: "查看详情",
  },
  {
    id: "demo-task-3",
    title: "修复支付回调逻辑",
    meta: "严格工程师 · 1 小时前",
    status: "failed",
    statusLabel: "失败",
    actionLabel: "查看日志",
  },
];

export function reminderAccentForType(type: ReminderType): DemoReminderCard["accent"] {
  switch (type) {
    case "water":
    case "rest":
      return "green";
    case "work":
      return "blue";
    case "study":
      return "amber";
    default:
      return "blue";
  }
}

export function reminderIconForType(type: ReminderType): DemoReminderCard["icon"] {
  switch (type) {
    case "study":
      return "study";
    case "work":
      return "folder";
    default:
      return "calendar";
  }
}
