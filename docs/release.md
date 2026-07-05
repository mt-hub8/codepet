# 发布与 GitHub Release

CodePet 通过 **GitHub Actions** 构建 Windows 安装包，并发布到 **GitHub Releases**。

- **发布标签**：`v1.0.0-beta.1`
- **应用内版本号**：`1.0.0`（Tauri / Cargo / package.json 不支持 prerelease 字符串）
- **对外名称**：**CodePet v1.0.0-beta.1 Public Beta**

---

## CodePet v1.0.0-beta.1 Public Beta — Release Notes

发布 GitHub Release 时，可将以下内容作为 Release 说明（或与 Actions 草稿合并编辑）：

```markdown
# CodePet v1.0.0-beta.1 Public Beta

## 当前定位

**CodePet** 是一个本地优先的 AI 桌面伙伴，用桌宠提醒用户处理提醒、任务、休息、本地 AI 和 Coding Agent 状态。

默认不上传你的代码、命令日志、聊天、提醒、宠物素材与基础记忆。

## 主要功能

- 桌宠悬浮窗口
- 本地提醒
- 自定义提示音
- Ollama 本地 AI（可选）
- 命令任务监控
- Codex / Cursor / Claude Code 轻量接管提醒
- 等待确认检测
- 长时间无输出检测
- 宠物素材导入
- 宠物孵化提示词向导
- 工作状态中心
- 基础行为记忆
- 首次启动引导
- 依赖诊断

## 下载与安装

1. 打开 [GitHub Releases](https://github.com/mt-hub8/codepet/releases)
2. 选择 **v1.0.0-beta.1**
3. **Windows** 下载：
   - **推荐**：`CodePet_*_x64_en-US.msi`
   - **备选**：`CodePet_*_x64-setup.exe`
4. 当前为 **Beta**，**未代码签名** → 若提示未知发布者：「更多信息」→「仍要运行」
5. 安装后启动，跟随新手引导（可跳过）

**macOS / Linux**：暂未正式支持安装包，请从源码 `pnpm tauri dev`。

## 隐私说明

- 默认本地运行
- 默认不上传用户代码、命令日志、聊天、提醒、宠物素材和基础记忆
- 安装包不包含用户运行期数据
- 远程 Ollama 与 Codex / Cursor / Claude Code 等外部工具可能有各自数据策略，请自行确认

详见 [docs/privacy.md](https://github.com/mt-hub8/codepet/blob/main/docs/privacy.md)

## 已知问题

完整列表：[docs/known-issues.md](https://github.com/mt-hub8/codepet/blob/main/docs/known-issues.md)

- 未代码签名
- Ollama / Agent CLI 需用户自行安装配置
- 等待确认检测可能不完全准确
- Public Beta 兼容性风险

## 反馈

- [Bug 报告](https://github.com/mt-hub8/codepet/issues/new?template=bug_report.yml)
- [功能建议](https://github.com/mt-hub8/codepet/issues/new?template=feature_request.yml)
- [宠物素材问题](https://github.com/mt-hub8/codepet/issues/new?template=pet_asset_issue.yml)
```

---

## 下载方式

1. 打开本仓库 **GitHub → Releases**
2. 选择 **v1.0.0-beta.1**
3. Windows 下载 `.msi`（推荐）或 `-setup.exe`
4. macOS / Linux：暂未正式支持

请**仅从本项目 GitHub Releases** 下载。

---

## 发布前人工步骤（维护者）

> 本任务**不会**自动执行 commit、tag、push 或 Release。请由维护者按序操作。

### 1. 确认本地 build 通过

```bash
# 仓库根目录
pnpm install
pnpm --filter @codepet/desktop build
```

### 2. 确认 tauri build 通过

```bash
cd apps/desktop
pnpm tauri build
```

**环境要求**：Rust stable、Node 20+、pnpm 9+、Windows WebView2、WiX / NSIS（Tauri 打包依赖）。

若本机无 Rust，可在已配置 Rust 的 Windows 机器或 CI 上验证；推送 tag 后 `release.yml` 会在 GitHub Actions 中执行完整 `tauri build`。

### 3. 提交 Release Candidate 改动

使用 GitHub Desktop 或命令行提交，推荐 commit message：

```
chore: prepare v1.0.0-beta.1 release candidate
```

### 4. 创建 tag

```bash
git tag v1.0.0-beta.1
```

### 5. 推送 tag

```bash
git push origin v1.0.0-beta.1
```

推送 `v*` tag 将触发 `.github/workflows/release.yml`。

### 6. 等待 GitHub Actions

打开 **Actions → release** workflow，确认 Windows 构建成功。

也可使用 **workflow_dispatch** 手动触发，填写 tag `v1.0.0-beta.1`。

### 7. 检查 GitHub Release

- [ ] Release 标题含 `v1.0.0-beta.1` / Public Beta
- [ ] Release Notes 完整（可编辑 Actions 生成的草稿）
- [ ] 附件含 Windows `.msi` 与/或 `-setup.exe`
- [ ] 标记为 **Pre-release**
- [ ] 下载链接可正常下载

### 8. 干净环境试装

在另一台 Windows 或虚拟机中：

1. 下载安装包并安装
2. 首次启动与新手引导
3. 创建提醒、打开依赖诊断
4. 按 [qa-checklist.md](qa-checklist.md) 冒烟验收

### 9. 发布前检查清单（摘要）

- [ ] 版本号：`1.0.0`（代码）+ `v1.0.0-beta.1`（tag / 文档）
- [ ] README 截图已补充或保留占位说明
- [ ] 无 `.env`、数据库、日志、用户宠物素材误提交
- [ ] LICENSE 已确认（当前为 MIT）
- [ ] Issue / PR 模板齐全

---

## CI 职责

| 工作流 | 触发 | 职责 |
|--------|------|------|
| `build.yml` | push/PR → `main` | `pnpm --filter @codepet/desktop build` |
| `release.yml` | tag `v*` 或 `workflow_dispatch` | `apps/desktop` 下 Tauri 打包并上传 Release |

`release.yml` 配置要点：

- `projectPath: apps/desktop`
- `prerelease: true`、`releaseDraft: true`（发布前可编辑草稿）
- 不打包用户运行期数据（仅 `dist` + Tauri 资源）

---

## 打包边界

安装包与仓库**不应包含**：

- `.env`、`*.sqlite`、`*.db`
- `logs/`、`models/`、`sounds/`、`user-sounds/`
- `pets/`、`user-pets/`（用户导入素材）
- 聊天记录、命令日志、基础记忆数据库
- 第三方无授权宠物素材

`.gitignore` 已覆盖上述路径。用户数据保存在 `%APPDATA%\dev.codepet.app\codepet\`。

---

## 版本号说明

| 位置 | 值 |
|------|-----|
| `package.json` / `Cargo.toml` / `tauri.conf.json` | `1.0.0` |
| Git tag / GitHub Release | `v1.0.0-beta.1` |
| 对外宣传 | CodePet v1.0.0-beta.1 Public Beta |

---

## 后续计划

- **V1.1**：稳定性与反馈修复
- **V1.5+**：角色工作室、Skill Lite
- 代码签名、macOS/Linux 正式包、自动更新：单独评估，不在 beta.1 范围
