export type PetState = "idle" | "focusing" | "thinking" | "reminding" | "success" | "warning";

export const petStateLabels: Record<PetState, string> = {
  idle: "待机",
  focusing: "专注",
  thinking: "思考",
  reminding: "提醒",
  success: "完成",
  warning: "警告",
};

export const petBubbleMessages: Record<PetState, string> = {
  idle: "我在这里，随时提醒你。",
  focusing: "专注中，先别乱切任务。",
  thinking: "我在问本地模型，稍等一下。",
  reminding: "该休息一下了。",
  success: "任务完成，做得不错。",
  warning: "这里可能需要你注意。",
};

export const petStates = Object.keys(petStateLabels) as PetState[];
