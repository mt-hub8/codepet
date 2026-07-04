# CodePet

CodePet 是一个本地优先（Local-first，优先在用户本机保存和运行）、轻量、可扩展的 AI 桌面伙伴。它的早期目标是做成一个别人可以下载、安装、运行的桌宠提醒工具；长期目标是扩展为支持本地模型、Codex / Cursor / Claude Code 任务监控、角色化记忆、Skill（技能）系统、多角色讨论和 Roundtable（圆桌会议）工作流的 Desktop Agent Companion（桌面 Agent 伙伴）。

当前状态：early MVP（早期最小可行版本）。当前已完成 **V0.3.5 Local Product UI Simplification（本地产品 UI 减负 + 首页重构）**，优先支持 Windows，macOS / Linux 后续兼容。

CodePet 适合这些用户：

- 使用 Cursor / Codex / Claude Code 的开发者。
- 想要本地桌宠提醒的用户。
- 想要轻量本地 AI 陪伴工具的用户。
- 想要参与开源、可扩展桌面 Agent 项目的开发者。

## 当前 V0.3.5 做了什么

- 重构本地产品首页为轻量工作面板：左侧简洁导航，右侧主工作台。
- 首页展示问候区、今日提醒、自定义角色卡片、最近任务状态占位和桌宠状态卡片。
- 抽离设计系统 token（颜色、圆角、阴影）到 `design/` 目录。
- 拆分 `App.tsx` 职责：`AppProvider` 管理全局状态，`AppShell` 负责布局，`AppRoutes` 负责页面切换。
- 保留 V0.1 桌宠状态、拖动、置顶、托盘能力。
- 保留 V0.2 提醒管理、提示音、提醒历史、本地 SQLite 保存。
- 保留 V0.3 Ollama 设置、本地聊天、AI 提醒文案生成。
- 新增轻量角色预设展示（严格工程师、产品经理、学习教练、陪伴模式），不含完整角色工作室。
- 任务监控入口与占位页已预留，真实命令监控在 V0.4 实现。

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
- 暂未内置或自动下载本地模型。
- 暂未接入 Codex / Cursor / Claude Code。
- 暂未实现命令监控（V0.4）。
- 暂未实现 Petdex 宠物素材导入。
- 暂未实现记忆系统、Skill 系统或多角色圆桌会议。
- 暂未实现 AI 语音提醒。

## 后续计划

CodePet 后续会逐步支持：

- V0.4 命令监控与 Codex / Cursor / Claude Code 接入。
- 更完整的 Ollama 本地模型体验。
- Character（角色外观）系统与 Petdex 素材导入。
- Persona（人格设定）系统。
- Skill 系统。
- 记忆系统。
- 多角色 Workflow（工作流）。
- Roundtable 圆桌会议。
- GitHub Release 安装包分发。

提示音说明：V0.2 的提示音默认在本地播放，用户导入的音频文件会复制到本机应用数据目录，不上传。请不要把用户导入的音频文件提交到 GitHub。

本地 AI 说明：V0.3 默认只连接 `http://localhost:11434/api`。CodePet 不内置云 API Key，不会自动上传聊天、提醒、代码或本地文件。如果你把 Ollama API 地址改成远程地址，请自行确认隐私风险。

详细版本链见 [docs/roadmap.md](docs/roadmap.md)。

## 开发文档

- [架构原则](docs/architecture.md)
- [快速开始](docs/quick-start.md)
- [安装说明](docs/install.md)
- [GitHub Desktop 工作流](docs/github-desktop-workflow.md)
- [隐私说明](docs/privacy.md)
- [发布策略](docs/release.md)

## 开源许可

本项目使用 MIT License，见 [LICENSE](LICENSE)。
