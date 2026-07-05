# Codex / Cursor / Claude Code 接入说明

CodePet 通过轻量 **CLI Wrapper（命令行包装器）** 监控外部 AI Coding Agent。**均为可选能力**——未安装不影响提醒与桌宠。

V0.7 起依赖检测集中在 **依赖诊断页**，入口：设置、新手引导、本地 AI 设置、任务监控。

## 核心原则

1. CodePet 只负责监控、提醒和记录。
2. 不自动确认 Codex / Cursor / Claude Code 的权限请求。
3. 不自动执行 AI 生成的命令。
4. 不保存 API Key，不处理外部工具登录。
5. 用户可以自定义 CLI 可执行文件路径。
6. 用户可以自定义“等待确认”关键词。
7. 命令与日志默认保存在本机 SQLite，不上传云端。

## 统一 AgentCommandAdapter

三个 Agent 适配器与通用命令监控共用 `AgentCommandAdapter` 接口：

- `buildCommand`：构造实际执行的 command / args
- `detectNeedsUserInput`：检测输出中是否可能需要用户确认
- `detectProgress`：可选的进度提示

适配器代码位置：

- `apps/desktop/src/integrations/command/genericAdapter.ts`
- `apps/desktop/src/integrations/codex/codexAdapter.ts`
- `apps/desktop/src/integrations/cursor/cursorAdapter.ts`
- `apps/desktop/src/integrations/claude-code/claudeCodeAdapter.ts`

## 如何配置 CLI 路径

1. 打开 CodePet → **设置 → Agent 工具**，或 **依赖诊断**。
2. 在 Codex / Cursor / Claude Code 一行填写自定义 CLI 路径（可选）。
3. 点击 **重新检测** 查看是否可用。
4. 创建任务时也可在表单中单独填写 **CLI 可执行路径**。

未安装对应 CLI 时，CodePet 会显示中文友好提示（如「未检测到 Codex CLI，可稍后配置，不影响基础功能」），不会崩溃。

## 创建 Agent 任务

1. 点击 **新建命令任务**。
2. 选择任务类型：Codex / Cursor CLI / Claude Code。
3. 填写工作目录与 prompt / 命令内容。
4. 可选填写额外参数、无输出超时分钟数。
5. **由你主动点击启动**，CodePet 不会自动运行。

## 等待确认检测

当 stdout / stderr 中出现可能等待用户输入的关键词时：

- 任务状态变为 `needs_user_input`（等待确认）
- 桌宠气泡提示：外部 Agent 可能正在等待你确认
- 可播放默认提示音

关键词可在 **依赖检测** 面板自定义，每行一个。

**CodePet 不会替你在终端输入任何内容。**

## 长时间无输出检测

命令运行中若超过 `noOutputTimeoutMinutes`（默认 5 分钟）没有新输出：

- 任务状态变为 `no_output_timeout`
- 桌宠气泡提示长时间无输出
- 进程不会被自动 kill
- 你可以选择 **继续等待** 或 **取消任务**

若之后又有新输出，状态会恢复为 `running`，并继续记录日志。

## 与本地 AI 的关系

V0.4.2 提供可选按钮 **用本地 AI 总结失败原因**：

- 仅手动触发
- 只发送最近一小段 stdout / stderr 到当前配置的 Ollama 地址
- 没有 Ollama 时按钮禁用
- 不会自动修复或执行建议命令

## 外部工具数据策略

Codex / Cursor / Claude Code 等工具可能有各自的数据与隐私策略。用户需要自行阅读并确认这些工具的条款。CodePet 文档不承担第三方工具的数据处理责任。

## 后续规划

- V0.4.5：Petdex 宠物素材导入
- V0.4.6：宠物孵化提示词向导
