# CodePet

CodePet 是一个本地优先（Local-first，优先在用户本机保存和运行）、轻量、可扩展的 AI 桌面伙伴。它的早期目标是做成一个别人可以下载、安装、运行的桌宠提醒工具；长期目标是扩展为支持本地模型、Codex / Cursor / Claude Code 任务监控、角色化记忆、Skill（技能）系统、多角色讨论和 Roundtable（圆桌会议）工作流的 Desktop Agent Companion（桌面 Agent 伙伴）。

当前状态：early MVP（早期最小可行版本）。当前已完成 **V0.5 Local Alpha Completion（本地 Alpha 收敛阶段）**，优先支持 Windows，macOS / Linux 后续兼容。

## 当前 V0.5 做了什么

- **本地 Alpha 收敛**：在 V0.4.5 基础上整合 Agent CLI 监控、接管提醒、依赖检测、宠物孵化向导、工作状态中心、基础行为记忆与新手引导 Lite。
- **Agent CLI 监控增强**（延续 V0.4.2）：generic / codex / cursor / claude_code，可配置 CLI 路径，等待确认与长时间无输出检测。
- **依赖检测 Lite**：设置页与新手引导中检测 Git、Node.js、pnpm、Ollama、Agent CLI，不自动安装。
- **宠物孵化提示词向导**：只生成提示词，不生成图片；生成后使用 V0.4.5 已有导入功能导入。
- **工作状态中心**：首页摘要 + 二级详情页，汇总今日提醒、命令任务与规则建议。
- **基础行为记忆**：轻量本地偏好与行为记录，可查看和删除。
- **新手引导 Lite**：首次启动可跳过式引导，设置页可重新打开。
- 保留 V0.4.5 宠物素材导入、V0.3.5 简约首页及此前全部能力；默认本地运行，不上传用户数据。

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

- 暂未发布安装包（规划 V0.6 GitHub Release）。
- 暂未实现 zip 宠物包导入。
- 暂未实现 AI 生成宠物图像。
- 暂未实现 Skill 系统、角色私有记忆、多角色圆桌会议。
- 暂未实现 AI 语音提醒。

## 后续计划

CodePet 后续会逐步支持：

- V0.6 GitHub Release 安装包分发。
- V1.0 Public Beta。
- V1.5+ 角色工作室、Skill 系统、圆桌会议。

提示音说明：V0.2 的提示音默认在本地播放，用户导入的音频文件会复制到本机应用数据目录，不上传。请不要把用户导入的音频文件提交到 GitHub。

本地 AI 说明：V0.3 默认只连接 `http://localhost:11434/api`。CodePet 不内置云 API Key，不会自动上传聊天、提醒、代码或本地文件。如果你把 Ollama API 地址改成远程地址，请自行确认隐私风险。

命令监控说明：V0.4.2 通过 CLI Wrapper 监控外部 Agent。CodePet 不做屏幕识别，不替用户确认权限。命令与日志默认只保存在本机。

宠物素材说明：V0.4.5 支持用户自行导入 `pet.json` + spritesheet，默认不内置第三方社区素材，不上传导入文件。请自行确认素材版权与使用权限。用户导入的宠物素材不要提交到 GitHub。

Agent CLI 配置见 [docs/codex-cursor-claude-code-setup.md](docs/codex-cursor-claude-code-setup.md)。宠物素材说明见 [docs/character-system.md](docs/character-system.md)。

详细版本链见 [docs/roadmap.md](docs/roadmap.md)。

## 开发文档

- [架构原则](docs/architecture.md)
- [快速开始](docs/quick-start.md)
- [安装说明](docs/install.md)
- [GitHub Desktop 工作流](docs/github-desktop-workflow.md)
- [隐私说明](docs/privacy.md)
- [角色与宠物素材](docs/character-system.md)
- [Codex / Cursor / Claude Code 接入说明](docs/codex-cursor-claude-code-setup.md)
- [发布策略](docs/release.md)

## 开源许可

本项目使用 MIT License，见 [LICENSE](LICENSE)。
