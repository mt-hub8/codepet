import type { PetHatchFormInput } from "./petHatchTypes";

type PetHatchFormProps = {
  value: PetHatchFormInput;
  onChange: (value: PetHatchFormInput) => void;
};

export function PetHatchForm({ value, onChange }: PetHatchFormProps) {
  function update<K extends keyof PetHatchFormInput>(key: K, next: PetHatchFormInput[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="pet-hatch-form">
      <label>
        宠物名称
        <input value={value.petName} onChange={(event) => update("petName", event.target.value)} />
      </label>
      <label>
        宠物类型
        <input value={value.petType} onChange={(event) => update("petType", event.target.value)} />
      </label>
      <label>
        视觉风格
        <input value={value.visualStyle} onChange={(event) => update("visualStyle", event.target.value)} />
      </label>
      <label>
        主色调
        <input value={value.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} />
      </label>
      <label>
        性格设定
        <textarea value={value.personality} onChange={(event) => update("personality", event.target.value)} />
      </label>
      <label>
        标志元素
        <textarea
          value={value.signatureElements}
          onChange={(event) => update("signatureElements", event.target.value)}
        />
      </label>
      <label>
        使用场景
        <input value={value.usageScene} onChange={(event) => update("usageScene", event.target.value)} />
      </label>
      <label>
        动作状态
        <input
          value={value.animationStates}
          onChange={(event) => update("animationStates", event.target.value)}
        />
      </label>
    </div>
  );
}
