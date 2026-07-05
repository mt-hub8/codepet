# 发布与 GitHub Release

CodePet V0.6 起通过 **GitHub Actions** 构建 Windows 安装包，并发布到 **GitHub Releases**。

当前版本：**v0.6.0 Local Alpha**（本地 Alpha 预发布，不保证完全稳定）。

---

## 版本定位

**CodePet v0.6.0 Local Alpha**

CodePet 是一个本地优先的 AI 桌面伙伴。当前安装包为 **Local Alpha** 版本，适合愿意尝鲜的 Windows 用户。不需要 clone 代码、不需要 pnpm、不需要 Tauri 开发环境即可体验。

### 主要功能

- 桌宠悬浮窗口
- 本地提醒和自定义提示音
- Ollama 本地 AI
- 命令 / Agent 任务监控（Codex / Cursor / Claude Code 轻量适配）
- 宠物素材导入（pet.json + spritesheet）
- 宠物孵化提示词向导
- 工作状态中心
- 基础行为记忆
- 新手引导 Lite

---

## 下载方式

1. 打开本仓库 **GitHub → Releases** 页面。
2. 选择最新版本（例如 `v0.6.0`）。
3. **Windows 用户**下载以下任一安装包：
   - **推荐**：`CodePet_*_x64_en-US.msi`（WiX MSI 安装包）
   - **备选**：`CodePet_*_x64-setup.exe`（NSIS 安装程序）
4. **macOS / Linux**：当前未正式提供安装包，请使用开发者方式从源码运行。

请**仅从本项目 GitHub Releases 下载**，不要从第三方网盘或镜像站下载。

---

## 安装说明（Windows 普通用户）

1. 下载 `.msi` 或 `-setup.exe` 安装包。
2. 双击运行安装程序。
3. 若 Windows 弹出 **未知发布者** 或 **Windows 已保护你的电脑** 提示：
   - 点击「更多信息」
   - 再点击「仍要运行」
4. 按向导完成安装并启动 CodePet。
5. 首次启动可跟随新手引导；每步均可跳过。

### 当前限制

- **暂未代码签名**，可能出现未知发布者提示。
- **Ollama** 需用户自行安装（本地 AI 为可选项）。
- **Codex / Cursor / Claude Code** 需用户自行安装并配置 CLI 路径。
- 宠物素材版权由用户自行确认。
- 当前为 **Alpha** 版本，可能存在兼容性问题。
- 部分杀毒软件可能误报未签名安装包。

### 卸载

- **MSI**：系统「设置 → 应用 → 已安装的应用」中卸载 CodePet。
- **NSIS**：开始菜单中的卸载入口，或「应用和功能」中卸载。

卸载应用**可能不会自动删除**本机用户数据目录（提醒、数据库、导入素材等）。如需彻底清理，可手动删除：

```text
%APPDATA%\dev.codepet.app\codepet\
```

（具体路径以实际 `identifier` 为准，当前为 `dev.codepet.app`。）

---

## 隐私说明（安装包版本）

- 安装包**不包含**任何用户运行期数据。
- 用户数据（提醒、命令日志、宠物素材、基础记忆等）保存在本机应用数据目录。
- 默认不上传用户代码、命令、日志、聊天、提醒、宠物素材。
- 远程 Ollama 与外部 Agent 工具可能有各自的数据策略，用户需自行确认。

详见 [privacy.md](privacy.md)。

---

## Release Notes 模板

发布新版本时，可复制以下模板到 GitHub Release 说明：

```markdown
## CodePet vX.Y.Z Local Alpha

### 当前定位
本地 Alpha 预发布版本。

### 下载
- Windows：`.msi`（推荐）或 `-setup.exe`
- macOS / Linux：暂未正式支持

### 本版本变更
- （从 CHANGELOG.md 摘要）

### 已知问题
- 未代码签名
- Ollama / Agent CLI 需自行安装
- Alpha 兼容性风险

### 隐私
默认本地运行，不上传用户数据。
```

---

## 手动发布流程

### 1. 本地验证

```bash
# 仓库根目录
pnpm install
pnpm --filter @codepet/desktop build

# 桌面应用目录（需已安装 Rust stable 与 Windows 打包依赖）
cd apps/desktop
pnpm tauri build
```

构建产物位于：

```text
apps/desktop/src-tauri/target/release/bundle/msi/
apps/desktop/src-tauri/target/release/bundle/nsis/
```

### 2. 更新版本号

同步以下文件为同一版本（例如 `0.6.0`）：

- `package.json`（根目录）
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/tauri.conf.json`
- `CHANGELOG.md`
- `README.md`（如有版本引用）

### 3. 更新 CHANGELOG

在 `CHANGELOG.md` 顶部添加新版本记录。

### 4. 提交代码

```bash
git add .
git commit -m "chore: prepare v0.6.0 release"
git push origin main
```

### 5. 创建并推送 tag

```bash
git tag v0.6.0
git push origin v0.6.0
```

推送 `v*` tag 后，`.github/workflows/release.yml` 会自动触发构建。

### 6. 或使用 workflow_dispatch 手动触发

1. 打开 GitHub → Actions → **release** workflow。
2. 点击 **Run workflow**。
3. 填写 tag（例如 `v0.6.0`）。
4. 运行后等待 Windows 构建完成。

> 推荐仍以 **推送 tag** 为主流程；手动触发适用于补发或测试。

### 7. 检查 Release

1. 打开 GitHub → Releases。
2. 确认 Release 为 **Pre-release**（预发布）。
3. 确认附件包含 Windows `.msi` 和/或 `-setup.exe`。
4. 检查 release notes 与文件名。
5. 在干净 Windows 环境试装。

### 8. 发布失败时

1. 查看 Actions 日志（Rust 依赖、WiX、NSIS、图标、前端构建等）。
2. 本地复现：`cd apps/desktop && pnpm tauri build`。
3. 修复后重新打 tag（可用 `v0.6.1`）或删除失败 Release 后重试。

---

## CI 职责划分

| 工作流 | 职责 |
|--------|------|
| `build.yml` | PR / push 到 main：运行 `pnpm --filter @codepet/desktop build` |
| `release.yml` | tag `v*` 或手动触发：构建 Windows 安装包并上传 GitHub Release |

**不要把 release 逻辑塞进 build.yml。**

---

## 打包边界

安装包**不会**包含：

- `node_modules`、构建缓存、`target` 缓存
- `.env`、本地数据库（`*.sqlite`、`*.db`）
- `logs/`、`models/`、`sounds/`、`user-sounds/`
- `pets/`、`user-pets/`（用户导入宠物）
- 用户命令日志、聊天记录、基础记忆

项目自带的必要静态资源与占位图标会打入安装包。当前应用图标为**占位图标**，后续版本将替换为正式设计。

---

## 后续计划

- **V0.7**：新手引导与依赖检测完善
- **V1.0**：Public Beta
- **后续**：代码签名、macOS / Linux 正式安装包、自动更新（V1.1+）

本阶段**不实现**：自动更新、代码签名、应用内遥测、安装统计。
