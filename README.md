# CodePet

CodePet 是一个本地优先（Local-first，优先在用户本机保存和运行）、轻量、可扩展的 AI 桌面伙伴。它的早期目标是做成一个别人可以下载、安装、运行的桌宠提醒工具；长期目标是扩展为支持本地模型、Codex / Cursor / Claude Code 任务监控、角色化记忆、Skill（技能）系统、多角色讨论和 Roundtable（圆桌会议）工作流的 Desktop Agent Companion（桌面 Agent 伙伴）。

当前状态：early MVP（早期最小可行版本）。当前已完成 V0.1 Desktop Pet Shell MVP（桌宠壳子 MVP），优先支持 Windows，macOS / Linux 后续兼容。

CodePet 适合这些用户：

- 使用 Cursor / Codex / Claude Code 的开发者。
- 想要本地桌宠提醒的用户。
- 想要轻量本地 AI 陪伴工具的用户。
- 想要参与开源、可扩展桌面 Agent 项目的开发者。

## 当前 V0.1 做了什么

- 建立 Tauri v2 + React + TypeScript 的桌面应用骨架。
- 实现一个小尺寸、尽量无边框的 CodePet 桌面窗口。
- 窗口启动后默认放在桌面右下角附近。
- 支持拖动窗口。
- 支持页面按钮和托盘菜单切换窗口置顶。
- 添加基础系统托盘，包含显示、隐藏、切换置顶、退出。
- 关闭窗口时默认隐藏到托盘，点击托盘“退出”才真正退出。
- 添加桌宠基础状态演示：待机、专注、提醒、完成、警告。
- 添加状态气泡和状态测试面板。
- 建立清晰的模块目录，为 reminders、tasks、characters、personas、skills、memory、workflows、integrations、storage 预留边界。
- 补充 README、架构文档、路线图、隐私说明、发布说明和 GitHub Desktop 工作流说明。
- 预留 Ollama、Codex、Cursor、Claude Code 集成目录，但不接入真实功能。
- 增加 GitHub Actions 基础检查骨架。

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

## 当前暂不支持

- 暂未发布安装包。
- 暂未内置本地模型。
- 暂未接入 Codex / Cursor / Claude Code。
- 暂未实现提醒调度。
- 暂未实现数据库。
- 暂未实现记忆系统。
- 暂未实现多角色圆桌会议。

## 后续计划

CodePet 后续会逐步支持：

- 桌宠提醒。
- 喝水 / 休息 / 学习 / 工作提醒。
- Ollama 本地模型。
- Codex CLI 任务监控。
- Cursor CLI 任务监控。
- Claude Code CLI 任务监控。
- 通用命令监控。
- Character（角色外观）系统。
- Persona（人格设定）系统。
- Skill 系统。
- 记忆系统。
- 多角色 Workflow（工作流）。
- Roundtable 圆桌会议。
- GitHub Release 安装包分发。

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
