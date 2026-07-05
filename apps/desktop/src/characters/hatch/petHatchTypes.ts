export type PetHatchTemplateId =
  | "codex_hatch_pet"
  | "chatgpt_image"
  | "generic_image_model"
  | "manual_draw";

export type PetHatchFormInput = {
  petName: string;
  petType: string;
  visualStyle: string;
  primaryColor: string;
  personality: string;
  signatureElements: string;
  usageScene: string;
  animationStates: string;
  templateId: PetHatchTemplateId;
};

export type PetHatchExample = {
  id: string;
  label: string;
  input: PetHatchFormInput;
};

export const petHatchTemplateLabels: Record<PetHatchTemplateId, string> = {
  codex_hatch_pet: "Codex hatch-pet 风格",
  chatgpt_image: "ChatGPT image 风格",
  generic_image_model: "通用图像模型风格",
  manual_draw: "人工绘制需求说明",
};
