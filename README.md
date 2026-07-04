# CodePet

CodePet 是一个本地优先（Local-first，优先在用户本机保存和运行）、轻量、可扩展的 AI 桌面伙伴。它的早期目标是做成一个别人可以下载、安装、运行的桌宠提醒工具；长期目标是扩展为支持本地模型、Codex / Cursor / Claude Code 任务监控、角色化记忆、Skill（技能）系统、多角色讨论和 Roundtable（圆桌会议）工作流的 Desktop Agent Companion（桌面 Agent 伙伴）。

当前状态：early MVP（早期最小可行版本）。当前已完成 **V0.4.2 Agent CLI Adapter + Takeover Alerts（AI Coding Agent 适配器 + 用户接管提醒增强）**，优先支持 Windows，macOS / Linux 后续兼容。

CodePet 适合这些用户：

- 使用 Cursor / Codex / Claude Code 的开发者。
- 想要本地桌宠提醒的用户。
- 想要轻量本地 AI 陪伴工具的用户。
- 想要参与开源、可扩展桌面 Agent 项目的开发者。

## 当前 V0.4.2 做了什么

- 在 V0.4.1 通用命令监控基础上，新增 Codex / Cursor / Claude Code 轻量 CLI Adapter。
- 统一 `AgentCommandAdapter` 接口：构造命令、检测等待确认输出，不自动确认权限。
- 等待用户确认检测：stdout / stderr 出现关键词时任务变为「等待确认」，桌宠气泡与提示音提醒。
- 长时间无输出检测：超过设定分钟数无新输出时提醒，不自动 kill 进程，用户可继续等待或取消。
- 依赖检测面板：Git、Node.js、pnpm、Codex / Cursor / Claude Code CLI，支持自定义路径与重新检测。
- 用户可自定义 CLI 可执行文件路径与等待确认关键词；未安装外部 CLI 时显示中文友好提示，应用不崩溃。
- 可选「用本地 AI 总结失败原因」按钮（手动触发，仅发送到本机 Ollama）。
- 保留 V0.4.1 通用命令监控、V0.3.5 轻量首页、V0.1 桌宠、V0.2 提醒、V0.3 Ollama 全部能力。
- 命令与日志默认本地 SQLite 保存，不上传云端；不保存 API Key，不处理外部工具登录。

## 本地启动开发版

```bash
git clone <your-repo-url>
cd codepet/apps/desktop
pnpm install
pnpm tauri dev
```

如果你已经在本地打开了项目目录，也可以直接执行：

```bash
cd apps/desktop
pnpm install
pnpm tauri dev
```

启动后默认进入本地产品首页。左侧导航可进入提醒、本地 AI、角色、任务监控和设置。

## 当前暂不支持

- 暂未发布安装包。
- 暂未实现 Petdex 宠物素材导入（规划 V0.4.5）。
- 暂未实现宠物孵化提示词向导（规划 V0.4.6）。
- 暂未实现记忆系统、Skill 系统或多角色圆桌会议。
- 暂未实现 AI 语音提醒。

## 后续计划

CodePet 后续会逐步支持：

- 更完整的 Ollama 本地模型体验。
- V0.4.5 Petdex 宠物素材导入。
- V0.4.6 宠物孵化提示词向导。
- Persona（人格设定）系统。
- Skill 系统。
- 记忆系统。
- 多角色 Workflow（工作流）。
- Roundtable 圆桌会议。
- GitHub Release 安装包分发。

提示音说明：V0.2 的提示音默认在本地播放，用户导入的音频文件会复制到本机应用数据目录，不上传。请不要把用户导入的音频文件提交到 GitHub。

本地 AI 说明：V0.3 默认只连接 `http://localhost:11434/api`。CodePet 不内置云 API Key，不会自动上传聊天、提醒、代码或本地文件。如果你把 Ollama API 地址改成远程地址，请自行确认隐私风险。

命令监控说明：V0.4.2 通过 CLI Wrapper 监控外部 Agent。CodePet 不做屏幕识别，不替用户确认权限，不保证所有 CLI 输出格式完全一致。命令、stdout / stderr 日志和 exit code 默认只保存在本机，不会上传到云端。命令必须由你主动点击启动。外部工具（Codex / Cursor / Claude Code）可能有各自的数据策略，请自行确认。

Agent CLI 配置见 [docs/codex-cursor-claude-code-setup.md](docs/codex-cursor-claude-code-setup.md)。

详细版本链见 [docs/roadmap.md](docs/roadmap.md)。

## 开发文档

- [架构原则](docs/architecture.md)
- [快速开始](docs/quick-start.md)
- [安装说明](docs/install.md)
- [GitHub Desktop 工作流](docs/github-desktop-workflow.md)
- [隐私说明](docs/privacy.md)
- [Codex / Cursor / Claude Code 接入说明](docs/codex-cursor-claude-code-setup.md)
- [发布策略](docs/release.md)

## 开源许可

本项目使用 MIT License，见 [LICENSE](LICENSE)。
