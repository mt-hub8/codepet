# Codex / Cursor / Claude Code 接入设计

CodePet 后续会支持三类 AI coding agent（AI 编程代理）：

- Codex
- Cursor
- Claude Code

V0.0 阶段只预留目录和文档，不接入真实 CLI（命令行工具）。

## 接入方向

后续接入方式优先走 CLI Wrapper（命令行包装器），而不是屏幕识别。屏幕识别不稳定，也更难保证隐私和可解释性。

CLI Wrapper 的基本逻辑：

1. CodePet 启动外部命令。
2. 捕获 `stdout`。
3. 捕获 `stderr`。
4. 记录 `exit code`。
5. 识别运行中 / 成功 / 失败 / 等待用户确认 / 长时间无输出。
6. 通过桌宠提醒用户。

## 统一 Adapter 接口

三个适配器后续都应该遵守统一接口：

- `startTask`
- `stopTask`
- `getStatus`
- `readLogs`
- `detectNeedsUserInput`

不要把 Codex / Cursor / Claude Code 的逻辑写死在 UI 组件里。UI 只读取状态和触发用户操作，具体命令生命周期由 `integrations` 下的 Adapter 负责。

## Generic Command Monitor

后续还要支持 Generic Command Monitor（通用命令监控），例如：

- `npm test`
- `pnpm build`
- `mvn test`
- `pytest`
- `cargo test`

通用命令监控应该复用同一套任务状态、日志读取和提醒机制。

