import type { RolePreset } from "./roleTypes";

export const defaultRolePresets: RolePreset[] = [
  {
    id: "strict-engineer",
    name: "严格工程师",
    description: "代码质量优先，严格遵循工程规范。",
    memoryScope: "workspace",
    tools: ["代码检查", "终端", "Git"],
    accent: "green",
  },
  {
    id: "product-manager",
    name: "产品经理",
    description: "从用户价值出发，梳理需求与方案。",
    memoryScope: "project",
    tools: ["需求拆解", "数据洞察"],
    accent: "blue",
  },
  {
    id: "learning-coach",
    name: "学习教练",
    description: "引导式讲解，帮你建立知识体系。",
    memoryScope: "session",
    tools: ["学习计划", "复盘总结"],
    accent: "amber",
  },
  {
    id: "companion",
    name: "陪伴模式",
    description: "温柔陪伴，倾听你的想法与灵感。",
    memoryScope: "session",
    tools: ["情绪陪伴", "提醒"],
    accent: "mint",
  },
];
