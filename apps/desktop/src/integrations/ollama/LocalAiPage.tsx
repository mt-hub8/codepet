import { useState } from "react";
import { useApp } from "../../app/AppProvider";
import { LocalChatPanel } from "./LocalChatPanel";
import { OllamaSettingsPanel } from "./OllamaSettingsPanel";

type LocalAiTab = "settings" | "chat";

export function LocalAiPage() {
  const {
    localAiSettings,
    setLocalAiSettings,
    ollamaStatus,
    isCheckingOllama,
    isRemoteBaseUrl,
    handleDetectOllama,
    handleSaveLocalAiSettings,
    handleChatThinking,
    handleChatReply,
    handleChatError,
  } = useApp();
  const [activeTab, setActiveTab] = useState<LocalAiTab>("settings");

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>本地 AI</h1>
        <p>通过 Ollama 使用本机模型，支持设置、检测和本地聊天测试。</p>
      </header>

      <div className="local-ai-tabs" role="tablist" aria-label="本地 AI 功能">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          AI 设置
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "chat"}
          className={activeTab === "chat" ? "active" : ""}
          onClick={() => setActiveTab("chat")}
        >
          本地聊天
        </button>
      </div>

      {activeTab === "settings" ? (
        <OllamaSettingsPanel
          settings={localAiSettings}
          status={ollamaStatus}
          isChecking={isCheckingOllama}
          isRemoteBaseUrl={isRemoteBaseUrl}
          onSettingsChange={setLocalAiSettings}
          onSave={handleSaveLocalAiSettings}
          onDetect={handleDetectOllama}
        />
      ) : (
        <LocalChatPanel
          settings={localAiSettings}
          onThinking={handleChatThinking}
          onReply={handleChatReply}
          onError={handleChatError}
        />
      )}
    </div>
  );
}
