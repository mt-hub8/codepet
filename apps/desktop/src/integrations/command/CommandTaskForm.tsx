import { useState } from "react";
import { agentAdapterLabels } from "./agentAdapterTypes";
import type { AgentAdapterType } from "./agentAdapterTypes";
import type { CommandTask } from "./commandTypes";
import type { CreateCommandTaskInput } from "./commandService";

type CommandTaskFormProps = {
  initial?: CommandTask | null;
  onSubmit: (input: CreateCommandTaskInput | CommandTask) => Promise<void>;
  onCancel?: () => void;
  onPickDirectory: () => Promise<string | null>;
};

export function CommandTaskForm({
  initial,
  onSubmit,
  onCancel,
  onPickDirectory,
}: CommandTaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [adapterType, setAdapterType] = useState<AgentAdapterType>(initial?.adapterType ?? "generic");
  const [workingDirectory, setWorkingDirectory] = useState(initial?.workingDirectory ?? "");
  const [command, setCommand] = useState(initial?.command ?? "");
  const [argsText, setArgsText] = useState(initial?.args?.join(" ") ?? "");
  const [promptOrCommand, setPromptOrCommand] = useState(initial?.promptOrCommand ?? "");
  const [executablePath, setExecutablePath] = useState(initial?.executablePath ?? "");
  const [noOutputTimeoutMinutes, setNoOutputTimeoutMinutes] = useState(
    initial?.noOutputTimeoutMinutes ?? 5,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAgentAdapter = adapterType !== "generic";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const input: CreateCommandTaskInput = {
        title,
        adapterType,
        workingDirectory,
        command: isAgentAdapter ? undefined : command,
        argsText,
        promptOrCommand: isAgentAdapter ? promptOrCommand : command,
        executablePath: isAgentAdapter ? executablePath : undefined,
        noOutputTimeoutMinutes,
      };
      if (initial) {
        const { commandService } = await import("./commandService");
        const updated = await commandService.updateTaskFromInput(input, initial);
        await onSubmit(updated);
      } else {
        await onSubmit(input);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存任务失败");
    } finally {
      setSaving(false);
    }
  }

  async function handlePickDirectory() {
    const selected = await onPickDirectory();
    if (selected) {
      setWorkingDirectory(selected);
    }
  }

  return (
    <form className="cp-card command-task-form" onSubmit={(event) => void handleSubmit(event)}>
      <h2>{initial ? "编辑命令任务" : "新建命令任务"}</h2>

      <label>
        任务类型
        <select
          value={adapterType}
          onChange={(event) => setAdapterType(event.target.value as AgentAdapterType)}
        >
          {(Object.keys(agentAdapterLabels) as AgentAdapterType[]).map((type) => (
            <option key={type} value={type}>
              {agentAdapterLabels[type]}
            </option>
          ))}
        </select>
      </label>

      <label>
        任务标题
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：桌面端构建检查"
        />
      </label>

      <label>
        工作目录
        <div className="command-directory-row">
          <input
            value={workingDirectory}
            onChange={(event) => setWorkingDirectory(event.target.value)}
            placeholder="例如：E:/code/codepet/apps/desktop"
          />
          <button type="button" className="cp-btn cp-btn-sm" onClick={() => void handlePickDirectory()}>
            选择目录
          </button>
        </div>
      </label>

      {isAgentAdapter ? (
        <>
          <label>
            CLI 可执行路径（可选）
            <input
              value={executablePath}
              onChange={(event) => setExecutablePath(event.target.value)}
              placeholder="留空则使用默认命令名，例如 codex / cursor / claude"
            />
          </label>
          <label>
            Prompt / 命令内容
            <textarea
              value={promptOrCommand}
              onChange={(event) => setPromptOrCommand(event.target.value)}
              placeholder="输入要交给 Agent 的 prompt 或命令内容"
              rows={3}
            />
          </label>
          <label>
            额外参数（可选）
            <input
              value={argsText}
              onChange={(event) => setArgsText(event.target.value)}
              placeholder="按空格分隔"
            />
          </label>
        </>
      ) : (
        <>
          <label>
            执行命令
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="例如：pnpm"
            />
          </label>
          <label>
            命令参数（可选）
            <input
              value={argsText}
              onChange={(event) => setArgsText(event.target.value)}
              placeholder="例如：build 或 test"
            />
          </label>
        </>
      )}

      <label>
        无输出超时（分钟）
        <input
          type="number"
          min={1}
          max={120}
          value={noOutputTimeoutMinutes}
          onChange={(event) => setNoOutputTimeoutMinutes(Number(event.target.value) || 5)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="cp-btn cp-btn-primary" disabled={saving}>
          {initial ? "保存修改" : "创建任务"}
        </button>
        {onCancel && (
          <button type="button" className="cp-btn cp-btn-ghost" onClick={onCancel}>
            取消
          </button>
        )}
      </div>
    </form>
  );
}
