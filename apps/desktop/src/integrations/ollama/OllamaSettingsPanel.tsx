import { recommendedOllamaModels, type LocalAiSettings, type OllamaStatus } from "./ollamaTypes";

type OllamaSettingsPanelProps = {
  settings: LocalAiSettings;
  status: OllamaStatus;
  isChecking: boolean;
  isRemoteBaseUrl: boolean;
  onSettingsChange: (settings: LocalAiSettings) => void;
  onSave: () => Promise<void>;
  onDetect: () => Promise<void>;
};

const statusLabels: Record<OllamaStatus["status"], string> = {
  checking: "检测中",
  available: "可用",
  unavailable: "不可用",
  error: "异常",
};

export function OllamaSettingsPanel({
  settings,
  status,
  isChecking,
  isRemoteBaseUrl,
  onSettingsChange,
  onSave,
  onDetect,
}: OllamaSettingsPanelProps) {
  return (
    <section className="ollama-panel" aria-label="本地 AI 设置">
      <div className="panel-title">
        <h1>本地 AI 设置</h1>
        <button type="button" onClick={() => void onDetect()} disabled={isChecking}>
          {isChecking ? "检测中" : "重新检测"}
        </button>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onSettingsChange({ ...settings, enabled: event.target.checked })}
        />
        启用本地 AI
      </label>

      <label>
        Ollama API 地址
        <input
          value={settings.baseUrl}
          onChange={(event) => onSettingsChange({ ...settings, baseUrl: event.target.value })}
        />
      </label>

      {isRemoteBaseUrl && (
        <p className="privacy-warning">
          当前不是 localhost 地址，聊天内容和提醒文案可能会发送到远程服务。
        </p>
      )}

      <div className={`ollama-status ollama-status-${status.status}`}>
        <strong>连接状态：{statusLabels[status.status]}</strong>
        {status.errorMessage && <span>{status.errorMessage}</span>}
      </div>

      <label>
        默认模型
        <select
          value={settings.selectedModel || ""}
          onChange={(event) =>
            onSettingsChange({ ...settings, selectedModel: event.target.value || undefined })
          }
        >
          <option value="">请选择模型</option>
          {status.models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="button" onClick={() => void onSave()}>
          保存本地 AI 配置
        </button>
      </div>

      <section className="model-tips" aria-label="推荐模型">
        <h2>推荐模型</h2>
        <p>CodePet 不会自动下载模型，请你在终端自行执行命令。</p>
        <ul>
          {recommendedOllamaModels.map((model) => (
            <li key={model.name}>
              <strong>{model.name}</strong>
              <span>{model.description}</span>
              <code>{model.command}</code>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

