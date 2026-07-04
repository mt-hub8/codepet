import { useState } from "react";
import { ollamaService } from "./ollamaService";
import type { ChatMessage, LocalAiSettings } from "./ollamaTypes";

type LocalChatPanelProps = {
  settings: LocalAiSettings;
  onThinking: () => void;
  onReply: (reply: string) => void;
  onError: (message: string) => void;
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

export function LocalChatPanel({ settings, onThinking, onReply, onError }: LocalChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    const content = input.trim();
    if (!content || isLoading) {
      return;
    }
    const nextMessages = [...messages, createMessage("user", content)];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    onThinking();

    try {
      const reply = await ollamaService.chat(settings, nextMessages);
      const assistantMessage = createMessage("assistant", reply);
      setMessages([...nextMessages, assistantMessage]);
      onReply(reply);
    } catch (error) {
      onError(error instanceof Error ? error.message : "本地模型响应失败。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="local-chat-panel" aria-label="本地聊天">
      <div className="panel-title">
        <h1>本地聊天</h1>
        <button type="button" onClick={() => setMessages([])}>
          清空
        </button>
      </div>

      {!settings.enabled && <p className="empty-text">本地 AI 已关闭，请先在设置中启用。</p>}
      {settings.enabled && !settings.selectedModel && (
        <p className="empty-text">请先选择一个本地模型。</p>
      )}

      <div className="chat-log">
        {messages.length === 0 ? (
          <p className="empty-text">可以用一句话测试本地模型。</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`chat-message chat-message-${message.role}`}>
              <span>{message.role === "user" ? "你" : "CodePet"}</span>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          disabled={!settings.enabled || !settings.selectedModel || isLoading}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleSend();
            }
          }}
          placeholder="和本地模型说句话"
        />
        <button
          type="button"
          disabled={!settings.enabled || !settings.selectedModel || isLoading}
          onClick={() => void handleSend()}
        >
          {isLoading ? "发送中" : "发送"}
        </button>
      </div>
    </section>
  );
}

