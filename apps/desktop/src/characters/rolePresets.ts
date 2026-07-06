import type { RolePreset } from "./roleTypes";

export const defaultRolePresets: RolePreset[] = [
  {
    id: "strict-engineer",
    name: "严格工程师",
    description: "代码质量优先，严格遵循工程规范。",
    memoryScope: "workspace",
    tools: ["终端", "设置", "GitHub", "文档", "测试"],
    accent: "green",
  },
  {
    id: "product-manager",
    name: "产品经理",
    description: "从用户价值出发，梳理需求与方案。",
    memoryScope: "project",
    tools: ["Figma", "数据", "组件", "需求", "复盘"],
    accent: "blue",
  },
  {
    id: "learning-coach",
    name: "学习教练",
    description: "引导式讲解，帮你建立知识体系。",
    memoryScope: "session",
    tools: ["书籍", "Notion", "文档", "计划", "笔记"],
    accent: "amber",
  },
  {
    id: "companion",
    name: "陪伴模式",
    description: "温柔陪伴，倾听你的想法与灵感。",
    memoryScope: "session",
    tools: ["聊天", "音乐", "花朵", "提醒", "灵感"],
    accent: "mint",
  },
];
