type PetHatchPromptPreviewProps = {
  prompt: string;
  onCopy: () => void;
};

export function PetHatchPromptPreview({ prompt, onCopy }: PetHatchPromptPreviewProps) {
  return (
    <section className="cp-card pet-hatch-preview">
      <div className="cp-section-header">
        <h2>生成结果</h2>
        <button type="button" className="cp-btn cp-btn-primary cp-btn-sm" onClick={onCopy}>
          复制提示词
        </button>
      </div>
      <pre className="pet-hatch-prompt-output">{prompt || "填写表单并点击「生成提示词」"}</pre>
    </section>
  );
}
