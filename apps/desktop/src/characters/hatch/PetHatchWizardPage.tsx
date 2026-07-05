import { useState } from "react";
import { useApp } from "../../app/AppProvider";
import { DEFAULT_HATCH_FORM, buildHatchPrompt } from "./petHatchPromptBuilder";
import { petHatchExamples } from "./petHatchExamples";
import { petHatchTemplateLabels, type PetHatchFormInput, type PetHatchTemplateId } from "./petHatchTypes";
import { PetHatchForm } from "./PetHatchForm";
import { PetHatchPromptPreview } from "./PetHatchPromptPreview";

export function PetHatchWizardPage() {
  const { navigate, setPetAssetError } = useApp();
  const [form, setForm] = useState<PetHatchFormInput>(DEFAULT_HATCH_FORM);
  const [prompt, setPrompt] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const handleGenerate = () => {
    setPrompt(buildHatchPrompt(form));
    setCopyMessage("");
  };

  const handleCopy = async () => {
    if (!prompt) {
      return;
    }
    await navigator.clipboard.writeText(prompt);
    setCopyMessage("已复制到剪贴板");
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="page-header-with-back">
          <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("characters")}>
            返回宠物素材
          </button>
          <div>
            <h1>宠物孵化向导</h1>
            <p>只生成提示词，不生成图片。生成后请到外部工具制作素材，再用已有导入功能导入 CodePet。</p>
          </div>
        </div>
      </header>

      <div className="v04-banner">
        CodePet 不会直接生成图片，也不会调用 hatch-pet。请自行确认外部工具的数据策略与素材版权。
      </div>

      <section className="cp-card">
        <h2>模板类型</h2>
        <div className="pet-hatch-template-grid">
          {(Object.keys(petHatchTemplateLabels) as PetHatchTemplateId[]).map((templateId) => (
            <button
              key={templateId}
              type="button"
              className={`cp-btn cp-btn-sm ${form.templateId === templateId ? "cp-btn-primary" : ""}`}
              onClick={() => setForm((current) => ({ ...current, templateId }))}
            >
              {petHatchTemplateLabels[templateId]}
            </button>
          ))}
        </div>
      </section>

      <section className="cp-card">
        <div className="cp-section-header">
          <h2>默认示例</h2>
        </div>
        <div className="pet-hatch-example-grid">
          {petHatchExamples.map((example) => (
            <button
              key={example.id}
              type="button"
              className="cp-btn cp-btn-sm"
              onClick={() => setForm(example.input)}
            >
              {example.label}
            </button>
          ))}
        </div>
      </section>

      <section className="cp-card">
        <PetHatchForm value={form} onChange={setForm} />
        <div className="pet-hatch-actions">
          <button type="button" className="cp-btn cp-btn-primary" onClick={handleGenerate}>
            生成提示词
          </button>
          <button type="button" className="cp-btn" onClick={() => setForm(DEFAULT_HATCH_FORM)}>
            重置表单
          </button>
          <button
            type="button"
            className="cp-btn"
            onClick={() => {
              setPetAssetError("");
              navigate("characters");
            }}
          >
            去导入宠物
          </button>
        </div>
        {copyMessage && <p className="pet-hatch-copy-message">{copyMessage}</p>}
      </section>

      <PetHatchPromptPreview prompt={prompt} onCopy={() => void handleCopy()} />
    </div>
  );
}
