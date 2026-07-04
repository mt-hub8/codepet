# Roadmap

CodePet 的版本链从轻量桌面骨架开始，逐步扩展到提醒、本地模型、外部 Agent 监控、多角色工作流和社区生态。

## V0.0 Open Source Product Skeleton（已完成）

- 开源仓库骨架。
- README。
- CI 骨架。
- 架构文档。
- 扩展目录预留。

## V0.1 Desktop Pet Shell MVP（已完成）

- 桌宠悬浮窗。
- 拖动。
- 置顶。
- 托盘。
- 基础状态。

## V0.2 Local Reminder System（已完成）

- 喝水提醒。
- 休息提醒。
- 学习提醒。
- 工作提醒。
- SQLite 本地保存。
- 默认提醒模板。
- 提醒触发历史。
- 默认提示音。
- 自定义提示音导入、试听和删除。
- 每个提醒可单独选择提示音或关闭提示音。

## V0.3 Local AI via Ollama（已完成）

- Ollama 检测。
- 本地模型列表。
- 默认模型配置。
- 本地聊天面板。
- AI 提醒文案生成。
- 本地模型配置引导。

V0.3 不自动安装 Ollama，不自动下载模型，不实现 AI 语音或本地 TTS。后续可探索本地 TTS 或用户自定义语音包，但不能影响轻量默认体验。

## V0.4 Command / Codex / Cursor / Claude Code Monitor

- 通用命令监控。
- Codex CLI 监控。
- Cursor CLI 监控。
- Claude Code CLI 监控。
- `stdout` / `stderr` 捕获。
- 完成 / 失败 / 等待用户确认提醒。

## V0.5 Work Status Center + Basic Memory

- 任务历史。
- 行为记录。
- 工作状态中心。
- 轻量偏好记忆。
- 隐私说明。

## V0.6 GitHub Release Installer

- Windows 安装包。
- GitHub Release。
- release notes。
- changelog。
- 后续预留 macOS / Linux 安装包。

## V0.7 First-Run Onboarding

- 新手引导。
- 依赖检测。
- Ollama 检测。
- Codex / Cursor / Claude Code 检测。
- 配置向导。
- 错误诊断页。

## V1.0 Public Beta

- 普通用户可下载。
- 普通用户可安装。
- 普通用户可配置。
- 普通用户可在 10 分钟内用起来。

## V1.2 Character & Persona Import

- 用户自定义角色外观。
- 人格卡片导入。
- 角色基础配置。

## V1.3 Skill System Lite

- Skill 配置文件。
- Skill 模板。
- 角色绑定 Skill。

## V1.4 Role-Scoped Memory

- 每个角色独立记忆。
- 用户可选共享记忆空间。
- 记忆可查看、可删除、可导出。

## V1.5 Skill Suggestion from Usage

- 根据用户习惯建议 Skill。
- 自动生成的 Skill 必须用户确认后才能启用。

## V1.6 Multi-Role Task Discussion

- 多角色文本讨论。
- 主持人总结。
- 用户选择最终方案。

## V1.7 Desktop Roundtable

- 多角色桌面气泡讨论。
- 争论。
- 投票。
- 对齐方案。

## V2.0 MCP / Plugin / Multi-Agent Platform

- MCP。
- 插件化。
- 外部 Agent 接入。
- 多 Agent 工作流。

## V2.5 Role Evolution / Fusion

- 角色融合。
- 继承记忆摘要。
- 创建新角色。
- 保留原角色。

## V3.0 Community Role & Skill Ecosystem

- 角色模板分享。
- Skill 分享。
- 社区生态。

