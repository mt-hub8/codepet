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

## V0.3.5 Local Product UI Simplification（已完成）

- 本地产品 UI 减负与首页重构。
- 左侧简洁导航 + 右侧主工作台布局。
- 设计系统 token 抽离（`design/theme.ts`、`tokens.css`、`components.css`）。
- 首页拆分：`GreetingHeader`、`TodayReminderSection`、`RoleCardSection`、`RecentTaskStatusSection`、`PetStatusCard`。
- `App.tsx` 减负，状态迁移至 `AppProvider`。
- 轻量角色卡片预设展示（4 个默认角色）。
- 任务监控入口与占位页（不含真实命令监控）。

## V0.4.1 Generic Command Monitor MVP（已完成）

- 通用命令任务创建：标题、工作目录、命令、参数。
- 用户主动点击启动与取消，不自动执行命令。
- 捕获 stdout / stderr，记录 exit code。
- 成功 / 失败 / 取消时更新桌宠状态与首页任务摘要。
- SQLite 本地保存 `command_tasks` 与 `command_events`。
- 高风险命令二次确认。

## V0.4.2 Agent CLI Adapter + Takeover Alerts（已完成）

- Codex / Cursor / Claude Code 轻量 CLI Adapter，统一 `AgentCommandAdapter` 接口。
- 等待用户确认检测（可配置关键词），不自动输入或确认。
- 长时间无输出检测（默认 5 分钟），不自动 kill，用户可继续等待或取消。
- 依赖检测面板：Git、Node.js、pnpm、Codex / Cursor / Claude Code CLI。
- 用户可自定义 CLI 路径；未安装时中文友好提示。
- 可选手动「用本地 AI 总结失败原因」。

## V0.4.5 Pet Asset Import System（已完成）

- 用户导入 `pet.json` + spritesheet.png / webp。
- Petdex / Codex-compatible 最小格式与 CodePet 增强格式。
- 默认 8×9 / 192×208 网格推断与动画状态预览。
- 设为当前桌宠；`SpritePetRenderer` 状态联动。
- 默认不内置第三方社区素材；用户自行确认版权。

## V0.5 Local Alpha Completion（已完成）

- Agent CLI 监控增强与接管提醒（延续 V0.4.2）。
- 依赖检测 Lite：Git / Node / pnpm / Ollama / Agent CLI。
- 宠物孵化提示词向导（不生成图片，复用 V0.4.5 导入）。
- 工作状态中心：首页摘要 + 详情页。
- 基础行为记忆：轻量本地偏好与行为记录。
- 新手引导 Lite：可跳过式首次引导。

## V0.6 GitHub Release Installer（已完成）

- GitHub Actions 构建 Windows 安装包（msi + nsis）。
- GitHub Releases 发布流程与 release notes 模板。
- README 下载区与普通用户快速开始。
- 未代码签名；未实现自动更新。

## V0.7 First-Run Onboarding（规划中）

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

