# 隐私说明

CodePet **默认本地运行**。本文说明 v1.0 Public Beta 的数据存储、不上传承诺与风险边界。

**摘要**：默认不上传代码、命令日志、聊天、提醒、宠物素材与基础记忆。安装包不含用户数据。远程 Ollama 与外部 Agent 工具有各自策略，请自行确认。

---

## 安装包与本地数据

V1.0 Public Beta 的 **Windows 安装包不包含任何用户数据**。安装包仅包含应用本体与必要静态资源。

用户运行期数据（提醒、SQLite 数据库、导入提示音、宠物素材、命令日志、基础记忆等）保存在本机应用数据目录，例如：

```text
%APPDATA%\dev.codepet.app\codepet\
```

- 默认不上传这些数据。
- **卸载应用可能不会自动删除**上述目录；如需彻底清理请手动删除。
- 请勿将本地数据库或导入素材提交到 GitHub。

## 本地提醒和提示音

提醒配置、提醒历史与提示音配置保存在本机 SQLite。用户导入的提示音复制到应用数据目录 `sounds/`，**不上传**。

## 本地 AI（Ollama 聊天）

默认连接本机 `http://localhost:11434/api`。**默认不上传**聊天内容、提醒内容、代码或本地文件。CodePet 不内置云 API Key。

**远程 Ollama 风险**：若 API 地址改为非 localhost，聊天与 AI 生成提醒文案的输入可能发送到该远程服务，请自行确认其隐私政策。

## 本地命令监控与命令日志

命令任务配置、**stdout / stderr 日志**、exit code 保存在本机 SQLite，**不上传**。

Codex / Cursor / Claude Code 监控：CodePet 不替用户确认权限，不保存 API Key，不处理登录。命令须**用户主动启动**。

危险命令会二次确认。等待确认关键词保存在本机 `agent_tool_settings`。

可选「用本地 AI 总结失败原因」仅在手动触发时，将**最近一小段**日志发往当前 Ollama 地址。

## 宠物素材

V0.4.5 起，用户导入的 `pet.json` 与 spritesheet 默认保存在本机应用数据目录 `pets/<pet-id>/`，不上传到任何服务。

CodePet 默认不内置第三方 Petdex 社区素材。用户需自行确认导入素材的版权与使用权限。CodePet 不对用户导入素材的版权负责。

请不要将用户导入的宠物素材提交到 GitHub。`.gitignore` 已忽略 `pets/` 与 `user-pets/`。

## 基础行为记忆

V0.5 起，轻量偏好与行为记录保存在 SQLite `basic_memory` 表，默认不上传。用户可在设置页查看和删除。不做向量检索、embedding 或敏感画像。

新手引导状态（`onboarding_completed`、`onboarding_completed_at`、`onboarding_skipped`）也保存在此表中。

## 依赖诊断与诊断信息（V0.7）

V0.7 起提供 **依赖诊断** 与 **诊断信息** 功能：

- 检测 Git、Node.js、pnpm、Ollama、Agent CLI 与应用环境。
- 只读检测，不自动安装依赖、不拉取模型、不保存 API Key。
- **复制诊断信息**时会对路径脱敏（如将用户名替换为 `<user>`）。
- **不会**包含：完整命令日志、聊天记录、提醒正文、用户导入宠物素材中的敏感路径细节。

用户可在设置页或依赖诊断页打开本机数据目录与日志目录。

## 宠物孵化向导

V0.5 的孵化向导只生成提示词，不上传用户输入。若用户将提示词复制到外部工具，需自行确认外部工具的数据策略。

## 外部工具（Codex / Cursor / Claude Code）

这些工具可能有独立的数据策略、日志上传与命令执行行为。CodePet 仅读取 CLI 输出用于监控与提醒，**不控制**外部工具如何处理你的代码。请阅读各工具文档并自行评估风险。

## 记忆数据

角色记忆和共享记忆是后续能力。它们必须可查看、可删除、可导出。共享记忆必须由用户显式开启。

## 不要误提交

本地数据库、日志、模型文件、用户导入的提示音、聊天记录文件不要误提交到 GitHub。请确认 `.gitignore` 覆盖：

- `*.sqlite`
- `*.db`
- `logs/`
- `models/`
- `sounds/`
- `user-sounds/`
- `chat-records/`
- `local-chat/`
- `*.log`
- `.env`

CodePet 当前为 **v1.0 Public Beta**。Public Beta 阶段仍遵循上述本地优先原则；后续版本若有变更将在 CHANGELOG 与本文更新。

