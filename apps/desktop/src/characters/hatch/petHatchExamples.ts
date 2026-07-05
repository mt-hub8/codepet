import type { PetHatchExample } from "./petHatchTypes";

export const petHatchExamples: PetHatchExample[] = [
  {
    id: "cyber-fox",
    label: "赛博小狐狸",
    input: {
      petName: "赛博小狐狸",
      petType: "狐狸",
      visualStyle: "赛博朋克 + 轻像素边缘",
      primaryColor: "霓虹蓝 + 深灰",
      personality: "机灵、爱吐槽、工作时很专注",
      signatureElements: "发光尾巴、耳机、护目镜",
      usageScene: "编程陪伴",
      animationStates: "idle, working, thinking, waiting, done, sleeping, warning, error",
      templateId: "codex_hatch_pet",
    },
  },
  {
    id: "pixel-cat",
    label: "像素小黑猫",
    input: {
      petName: "像素小黑猫",
      petType: "猫",
      visualStyle: "16-bit 像素风",
      primaryColor: "黑色 + 薄荷绿点缀",
      personality: "慵懒但可靠",
      signatureElements: "像素胡须、小铃铛",
      usageScene: "桌面休息提醒",
      animationStates: "idle, working, thinking, waiting, done, sleeping, warning, error",
      templateId: "generic_image_model",
    },
  },
  {
    id: "desk-robot",
    label: "桌面小机器人",
    input: {
      petName: "桌面小机器人",
      petType: "机器人",
      visualStyle: "圆润机甲",
      primaryColor: "雾白 + 淡琥珀",
      personality: "稳定、耐心、偏工程师气质",
      signatureElements: "天线、胸口状态灯",
      usageScene: "命令任务监控陪伴",
      animationStates: "idle, working, thinking, waiting, done, sleeping, warning, error",
      templateId: "chatgpt_image",
    },
  },
  {
    id: "gentle-dog",
    label: "温柔陪伴小狗",
    input: {
      petName: "温柔陪伴小狗",
      petType: "小狗",
      visualStyle: "手绘水彩",
      primaryColor: "暖白 + 浅棕",
      personality: "温柔、鼓励型",
      signatureElements: "围巾、蓬松耳朵",
      usageScene: "学习提醒",
      animationStates: "idle, working, thinking, waiting, done, sleeping, warning, error",
      templateId: "manual_draw",
    },
  },
];
