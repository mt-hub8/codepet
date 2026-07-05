# CodePet

[![build](https://github.com/mt-hub8/codepet/actions/workflows/build.yml/badge.svg)](https://github.com/mt-hub8/codepet/actions/workflows/build.yml)
[![release](https://img.shields.io/github/v/release/mt-hub8/codepet?label=release)](https://github.com/mt-hub8/codepet/releases)
[![license](https://img.shields.io/github/license/mt-hub8/codepet)](LICENSE)

**CodePet 是一个本地优先的 AI 桌面伙伴**，用桌宠提醒你处理任务、休息、学习、本地 AI 和 Coding Agent 状态。

> **CodePet v1.0 Public Beta** — Windows 优先公开测试版。未代码签名，安装时可能出现「未知发布者」提示。macOS / Linux 暂未正式支持安装包。

---

## 截图

> 截图文件需人工补充，见 [docs/demo.md](docs/demo.md) 中的截图清单。

| 首页 | 新手引导 | 提醒 |
|:---:|:---:|:---:|
| ![首页](docs/assets/screenshots/home.png) | ![新手引导](docs/assets/screenshots/onboarding.png) | ![提醒](docs/assets/screenshots/reminders.png) |

| 本地 AI | 任务监控 | 依赖诊断 |
|:---:|:---:|:---:|
| ![本地 AI](docs/assets/screenshots/local-ai.png) | ![任务监控](docs/assets/screenshots/command-monitor.png) | ![依赖诊断](docs/assets/screenshots/dependency-doctor.png) |

| 宠物素材库 |
|:---:|
| ![宠物素材库](docs/assets/screenshots/pet-library.png) |

---

## 功能概览

- **桌宠悬浮窗口** — 拖动、置顶、托盘，状态与气泡联动
- **本地提醒** — 喝水、休息、学习、工作；默认可用，无需额外依赖
- **自定义提示音** — 导入、试听、按提醒单独配置
- **Ollama 本地 AI**（可选）— 检测、选模型、本地聊天、提醒文案生成
- **命令 / Agent 任务监控**（可选）— 监控 `pnpm build`、`pytest` 等通用命令
- **等待确认与长时间无输出提醒** — Codex / Cursor / Claude Code 轻量适配
- **宠物素材导入** — `pet.json` + spritesheet（png / webp）
- **宠物孵化提示词向导** — 生成提示词，不生成图片
- **工作状态中心** — 今日概览与事件摘要
- **基础行为记忆** — 轻量本地偏好，可查看、可删除
- **首次启动引导** — 8 步可跳过，说明零配置与可选依赖
- **依赖诊断** — Git、Node、pnpm、Ollama、Agent CLI；可复制脱敏诊断信息

---

## 下载

| 平台 | 状态 | 说明 |
|------|------|------|
| **Windows** | ✅ 推荐 | [GitHub Releases](https://github.com/mt-hub8/codepet/releases) 下载最新 `.msi` 或 `-setup.exe` |
| macOS | ⏳ 暂未正式支持 | 可从源码构建 |
| Linux | ⏳ 暂未正式支持 | 可从源码构建 |

- 当前为 **Public Beta**，请仅从本仓库 **GitHub Releases** 下载。
- **暂未代码签名**，Windows 可能提示未知发布者 →「更多信息」→「仍要运行」。
- 安装与卸载详见 [docs/install.md](docs/install.md)。

---

## 快速开始

### 普通用户

1. 从 [GitHub Releases](https://github.com/mt-hub8/codepet/releases) 下载并安装 Windows 安装包。
2. 打开 CodePet，跟随**新手引导**（每步可跳过）。
3. 在首页查看提醒与工作状态；默认提醒已创建，可直接使用。
4. **可选**：安装 [Ollama](https://ollama.com/) →「本地 AI」或「依赖诊断」中检测。
5. **可选**：在「设置 → Agent 工具」配置 Codex / Cursor / Claude Code CLI。

详细步骤：[docs/quick-start.md](docs/quick-start.md) · 演示路线：[docs/demo.md](docs/demo.md)

### 开发者

```bash
git clone https://github.com/mt-hub8/codepet.git
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

贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

---

## 隐私承诺

CodePet **默认本地运行**，默认不上传：

- 用户代码与项目文件
- 命令日志（stdout / stderr）
- Ollama 聊天内容
- 提醒配置与提醒历史
- 导入的宠物素材与提示音
- 基础行为记忆

安装包**不包含**任何用户运行期数据。远程 Ollama 与 Codex / Cursor / Claude Code 等外部工具有各自的数据策略，请自行确认。

详见 [docs/privacy.md](docs/privacy.md)

---

## 当前限制

- 当前为 **Public Beta**，可能存在兼容性问题
- **Windows 优先**；macOS / Linux 暂无正式安装包
- **未代码签名**；部分杀毒软件可能误报
- **Ollama** 需用户自行安装、启动并 `pull` 模型
- **Codex / Cursor / Claude Code** 需用户自行安装并配置 CLI 路径
- **宠物素材版权**由用户自行确认
- 不同 CLI 输出格式不同，**等待确认检测**可能不完全准确

更多见 [docs/known-issues.md](docs/known-issues.md)

---

## 反馈

- [报告 Bug](https://github.com/mt-hub8/codepet/issues/new?template=bug_report.yml)
- [功能建议](https://github.com/mt-hub8/codepet/issues/new?template=feature_request.yml)
- [宠物素材问题](https://github.com/mt-hub8/codepet/issues/new?template=pet_asset_issue.yml)

发布说明：[docs/release.md](docs/release.md) · 路线图：[docs/roadmap.md](docs/roadmap.md) · QA 清单：[docs/qa-checklist.md](docs/qa-checklist.md)

---

## 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/quick-start.md) | 普通用户上手 |
| [安装说明](docs/install.md) | Windows 安装与卸载 |
| [演示路线](docs/demo.md) | 3 / 10 分钟 Demo |
| [隐私说明](docs/privacy.md) | 数据与边界 |
| [已知问题](docs/known-issues.md) | Beta 限制 |
| [架构原则](docs/architecture.md) | 技术结构 |
| [Ollama 设置](docs/ollama-setup.md) | 本地 AI |
| [Agent CLI 接入](docs/codex-cursor-claude-code-setup.md) | 任务监控 |

---

## License

[MIT License](LICENSE)
