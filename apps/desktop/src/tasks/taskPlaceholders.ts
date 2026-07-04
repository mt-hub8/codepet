export type TaskStatus = "completed" | "pending" | "failed";

export type TaskPlaceholder = {
  id: string;
  title: string;
  status: TaskStatus;
};

export const demoTaskPlaceholders: TaskPlaceholder[] = [
  { id: "demo-1", title: "重构用户认证模块", status: "completed" },
  { id: "demo-2", title: "生成产品需求文档", status: "pending" },
  { id: "demo-3", title: "修复支付回调逻辑", status: "failed" },
];

export const taskStatusLabels: Record<TaskStatus, string> = {
  completed: "已完成",
  pending: "等待确认",
  failed: "失败",
};

export const taskStatusTagClass: Record<TaskStatus, string> = {
  completed: "cp-tag-green",
  pending: "cp-tag-amber",
  failed: "cp-tag-danger",
};
