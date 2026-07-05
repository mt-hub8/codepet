import type { PetHatchFormInput, PetHatchTemplateId } from "./petHatchTypes";

export const DEFAULT_HATCH_FORM: PetHatchFormInput = {
  petName: "",
  petType: "",
  visualStyle: "",
  primaryColor: "",
  personality: "",
  signatureElements: "",
  usageScene: "桌面悬浮陪伴",
  animationStates: "idle, working, thinking, waiting, done, sleeping, warning, error",
  templateId: "codex_hatch_pet",
};

export const TECH_SPECS_BLOCK = `技术规格：
- spritesheet 8 列 × 9 行
- 每帧 192 × 208 像素
- 透明背景
- 无文字、无水印
- 动作差异明显，适合桌面悬浮显示
- 输出 pet.json + spritesheet.png 或 spritesheet.webp`;

export const FORBIDDEN_BLOCK = `禁止事项：
- 不要包含文字、Logo、水印
- 不要生成侵权角色或未经授权的 IP
- 不要使用低对比度导致桌面看不清的配色`;

const TEMPLATE_INTROS: Record<PetHatchTemplateId, string> = {
  codex_hatch_pet:
    "请按 Codex hatch-pet 工作流生成一套桌面宠物素材包，强调角色辨识度和动作连贯性。",
  chatgpt_image:
    "请按 ChatGPT 图像生成工作流，输出可切片的角色 spritesheet 与配套 pet.json。",
  generic_image_model:
    "请按通用图像模型提示方式，生成透明背景角色 spritesheet，并保证动作帧清晰可切。",
  manual_draw: "请为画师/设计者输出一份可执行的绘制需求说明，用于手工制作桌宠素材。",
};

export function buildHatchPrompt(input: PetHatchFormInput): string {
  const intro = TEMPLATE_INTROS[input.templateId];
  return [
    intro,
    "",
    "【宠物基本设定】",
    `- 名称：${input.petName || "未命名桌宠"}`,
    `- 类型：${input.petType || "原创角色"}`,
    `- 使用场景：${input.usageScene || "桌面悬浮陪伴"}`,
    "",
    "【视觉风格】",
    `- 风格：${input.visualStyle || "简约可爱"}`,
    `- 主色调：${input.primaryColor || "柔和浅色"}`,
  "",
    "【性格设定】",
    input.personality || "温和、可靠、适合长时间陪伴。",
    "",
    "【标志元素】",
    input.signatureElements || "请设计 1-2 个高辨识度标志元素。",
    "",
    "【动作状态】",
    `需要覆盖以下状态动画：${input.animationStates}`,
    "每行对应一个状态，帧之间动作差异明显。",
    "",
    TECH_SPECS_BLOCK,
    "",
    "【输出要求】",
    "- 输出 pet.json（包含 id、displayName、description、spritesheetPath）",
    "- 输出 spritesheet.png 或 spritesheet.webp",
    "- pet.json 可与 CodePet V0.4.5 导入格式兼容",
    "",
    FORBIDDEN_BLOCK,
    "",
    "【重要说明】",
    "- CodePet 不会直接生成图片，也不会调用 hatch-pet。",
    "- 请用户自行在外部工具生成后，通过 CodePet「导入宠物」功能导入。",
    "- 用户需自行确认生成素材的版权和使用权限。",
  ].join("\n");
}
