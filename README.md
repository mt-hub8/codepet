# CodePet

CodePet 是一个本地优先（Local-first）、轻量、可扩展的 AI 桌面伙伴。当前版本为 **V0.6 Local Alpha**，可通过 Windows 安装包体验，无需 clone 代码或配置开发环境。

> **Alpha 状态**：当前为本地 Alpha 预发布版本，不保证完全稳定。未代码签名，Windows 可能提示未知发布者。

---

## 下载

| 平台 | 状态 | 说明 |
|------|------|------|
| **Windows** | ✅ 推荐 | 前往本仓库 **GitHub → Releases** 下载 `.msi` 或 `-setup.exe` |
| macOS | 🧪 测试中 | 暂未正式提供安装包，可从源码构建 |
| Linux | 🧪 测试中 | 暂未正式提供安装包，可从源码构建 |

请**仅从本项目 GitHub Releases** 下载安装包。

安装与卸载说明见 [docs/install.md](docs/install.md)。发布流程见 [docs/release.md](docs/release.md)。

---

## 普通用户快速开始

1. 下载并安装 Windows 安装包。
2. 启动 CodePet，按新手引导完成初始设置（可跳过）。
3. 在首页查看今日提醒与工作状态。
4. **可选**：安装 [Ollama](https://ollama.com/) 并在「本地 AI」中启用。
5. **可选**：在「任务监控」配置 Codex / Cursor / Claude Code CLI 路径。
6. **可选**：在「角色」使用孵化向导生成提示词，或导入 `pet.json` + spritesheet。

详细步骤见 [docs/quick-start.md](docs/quick-start.md)。

---

## 开发者快速开始

```bash
git clone <your-repo-url>
cd codepet
pnpm install
cd apps/desktop
pnpm tauri dev
```

构建安装包：

```bash
cd apps/desktop
pnpm build
pnpm tauri build
```

---

## 当前 V0.6 做了什么

- **GitHub Release 安装包**：通过 GitHub Actions 构建 Windows `.msi` / NSIS `.exe` 并发布。
- **发布文档**：安装、发布流程、隐私与 Alpha 说明。
- 保留 V0.5 全部本地 Alpha 功能（提醒、本地 AI、命令监控、宠物导入等）。

---

## 主要功能（V0.5 Alpha）

- 桌宠悬浮窗口与状态联动
- 本地提醒与自定义提示音
- Ollama 本地 AI
- 命令 / Agent 任务监控与接管提醒
- 宠物素材导入与孵化提示词向导
- 工作状态中心与基础行为记忆
- 新手引导 Lite

---

## 隐私

默认本地运行，不上传用户代码、命令、日志、聊天、提醒、宠物素材与基础记忆。安装包不包含用户数据。详见 [docs/privacy.md](docs/privacy.md)。

---

## 开发文档

- [安装说明](docs/install.md)
- [快速开始](docs/quick-start.md)
- [发布策略](docs/release.md)
- [架构原则](docs/architecture.md)
- [隐私说明](docs/privacy.md)
- [路线图](docs/roadmap.md)
- [角色与宠物素材](docs/character-system.md)
- [Codex / Cursor / Claude Code 接入](docs/codex-cursor-claude-code-setup.md)

## 开源许可

MIT License，见 [LICENSE](LICENSE)。
