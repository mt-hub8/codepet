# CodePet

CodePet 是一个本地优先（Local-first，优先在用户本机保存和运行）、轻量、可扩展的 AI 桌面伙伴。它的早期目标是做成一个别人可以下载、安装、运行的桌宠提醒工具；长期目标是扩展为支持本地模型、Codex / Cursor / Claude Code 任务监控、角色化记忆、Skill（技能）系统、多角色讨论和 Roundtable（圆桌会议）工作流的 Desktop Agent Companion（桌面 Agent 伙伴）。

当前状态：early MVP（早期最小可行版本）。当前已完成 **V0.4.5 Pet Asset Import System（宠物素材导入系统）**，优先支持 Windows，macOS / Linux 后续兼容。

CodePet 适合这些用户：

- 使用 Cursor / Codex / Claude Code 的开发者。
- 想要本地桌宠提醒的用户。
- 想要轻量本地 AI 陪伴工具的用户。
- 想要参与开源、可扩展桌面 Agent 项目的开发者。

## 当前 V0.4.5 做了什么

- 支持用户导入 Petdex / Codex-compatible 宠物素材包：`pet.json` + `spritesheet.png` / `webp`。
- 支持文件夹导入与选择 `pet.json` 文件导入；最小 `pet.json` 可自动按 8×9 / 192×208 推断网格。
- 新增 `SpritePetRenderer` spritesheet 动画渲染，桌宠状态自动映射到动画状态。
- 宠物库页面：查看已导入宠物、预览 8 种动画状态、设为当前桌宠、删除用户导入宠物。
- 默认内置 CodePet 原创占位桌宠；**默认不内置第三方社区素材**。
- 导入素材复制到本机应用数据目录，不上传；用户需自行确认版权与使用权限。
- 保留 V0.4.2 Agent CLI、V0.4.1 命令监控、V0.3.5 轻量首页及此前全部能力。

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
- 暂未实现 zip 宠物包导入（可规划到后续版本）。
- 暂未实现宠物孵化提示词向导（规划 V0.4.6）。
- 暂未实现 AI 生成宠物。
- 暂未实现记忆系统、Skill 系统或多角色圆桌会议。
- 暂未实现 AI 语音提醒。

## 后续计划

CodePet 后续会逐步支持：

- 更完整的 Ollama 本地模型体验。
- V0.4.6 宠物孵化提示词向导（hatch-pet 风格）。
- Persona（人格设定）系统。
- Skill 系统。
- 记忆系统。
- 多角色 Workflow（工作流）。
- Roundtable 圆桌会议。
- GitHub Release 安装包分发。

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
