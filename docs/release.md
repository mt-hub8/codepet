# 发布与 GitHub Release

CodePet 通过 **GitHub Actions** 构建 Windows 安装包，并发布到 **GitHub Releases**。

当前版本：**1.0.0 — CodePet v1.0 Public Beta**

---

## CodePet v1.0 Public Beta Release Notes

发布时可将以下内容复制到 GitHub Release 说明：

```markdown
# CodePet v1.0 Public Beta

## 定位

**CodePet** 是一个本地优先的 AI 桌面伙伴：桌宠陪伴、本地提醒、Ollama 本地 AI、命令与 Coding Agent 状态监控。

默认不上传你的代码、命令日志、聊天、提醒或宠物素材。

## 适合谁

- 使用 Codex / Cursor / Claude Code 时容易错过任务状态的人
- 需要本地提醒和学习 / 工作节奏陪伴的人
- 想用 Ollama 在本机跑模型的人
- 喜欢自定义桌宠素材的人
- 想研究 AI 桌面助手、Agent monitor、本地优先产品的人

## 当前功能

- 桌宠悬浮窗口（拖动、置顶、托盘）
- 本地提醒与自定义提示音（零配置可用）
- Ollama 本地 AI（可选）
- 通用命令监控 + Codex / Cursor / Claude Code 轻量适配（可选）
- 等待确认与长时间无输出提醒
- 宠物素材导入（pet.json + spritesheet）
- 宠物孵化提示词向导
- 工作状态中心与基础行为记忆
- 8 步首次启动引导
- 依赖诊断与脱敏诊断信息

## 下载与安装

1. 打开 [GitHub Releases](https://github.com/mt-hub8/codepet/releases)
2. 下载 Windows 安装包：
   - **推荐**：`CodePet_*_x64_en-US.msi`
   - **备选**：`CodePet_*_x64-setup.exe`
3. 若提示未知发布者：「更多信息」→「仍要运行」
4. 安装后启动 CodePet，跟随新手引导（可跳过）

macOS / Linux：暂未正式提供安装包，请从源码运行。

## 隐私

- 默认本地运行，不上传用户数据
- 安装包不包含用户运行期数据
- 远程 Ollama 与外部 Agent 工具有各自数据策略

详见：https://github.com/mt-hub8/codepet/blob/main/docs/privacy.md

## 已知问题

- 未代码签名
- Ollama / Agent CLI 需自行安装配置
- 等待确认检测可能不完全准确
- Public Beta 兼容性风险

完整列表：https://github.com/mt-hub8/codepet/blob/main/docs/known-issues.md

## 反馈

- Bug：https://github.com/mt-hub8/codepet/issues/new?template=bug_report.yml
- 功能建议：https://github.com/mt-hub8/codepet/issues/new?template=feature_request.yml
- 宠物素材：https://github.com/mt-hub8/codepet/issues/new?template=pet_asset_issue.yml

## 开发者

```bash
git clone https://github.com/mt-hub8/codepet.git
cd codepet && pnpm install
cd apps/desktop && pnpm tauri dev
```

贡献指南：https://github.com/mt-hub8/codepet/blob/main/CONTRIBUTING.md
```

---

## 下载方式

1. 打开本仓库 **GitHub → Releases** 页面。
2. 选择最新版本（例如 `v1.0.0`）。
3. **Windows 用户**下载 `.msi`（推荐）或 `-setup.exe`。
4. **macOS / Linux**：暂未正式支持安装包。

请**仅从本项目 GitHub Releases** 下载。

---

## 安装说明（Windows）

详见 [install.md](install.md)。要点：

- Public Beta，未代码签名
- 首次启动可跟随新手引导
- 卸载后用户数据可能保留在 `%APPDATA%\dev.codepet.app\codepet\`

---

## 手动发布流程

### 1. 本地验证

```bash
pnpm install
pnpm --filter @codepet/desktop build
cd apps/desktop
pnpm tauri build
```

### 2. 更新版本号

同步 `package.json`、`apps/desktop/package.json`、`Cargo.toml`、`tauri.conf.json`、`CHANGELOG.md`。

### 3. 提交并打 tag（由维护者执行）

```bash
git tag v1.0.0
git push origin v1.0.0
```

推送 `v*` tag 触发 `.github/workflows/release.yml`。

### 4. 检查 Release

- 标记为 **Pre-release**（Beta 期间建议保持）
- 附件含 Windows `.msi` / `.exe`
- Release Notes 使用上文模板

---

## CI 职责

| 工作流 | 职责 |
|--------|------|
| `build.yml` | PR / push：`pnpm --filter @codepet/desktop build` |
| `release.yml` | tag `v*`：构建 Windows 安装包并上传 Release |

---

## 打包边界

安装包**不包含**：`.env`、本地数据库、日志、用户宠物、用户音频、聊天记录。

详见 [privacy.md](privacy.md) 与 [qa-checklist.md](qa-checklist.md)。

---

## 后续计划

- **V1.1**：稳定性与反馈修复
- **V1.5+**：角色工作室、Skill Lite
- **后续**：代码签名、macOS/Linux 正式包、自动更新（单独评估）

本阶段**不实现**：自动更新、代码签名、遥测。
