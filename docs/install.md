# 安装说明

CodePet V0.6 起提供 **Windows 安装包**（GitHub Releases）。本文区分普通用户安装与开发者本地运行。

---

## 普通用户安装（Windows）

### 系统要求

- Windows 10 / 11（64 位）优先
- 约 200MB 磁盘空间（含安装包与运行数据）
- 可选：本机 Ollama（本地 AI）
- 可选：Git、Node.js、pnpm、Codex / Cursor / Claude Code CLI

### 下载

1. 打开本仓库 **GitHub → Releases** 页面。
2. 下载最新 **Pre-release** 中的 Windows 安装包：
   - **推荐**：`.msi`
   - **备选**：`*-setup.exe`

### 安装步骤

1. 双击安装包。
2. 若出现「未知发布者」提示，点击「更多信息」→「仍要运行」。
3. 按向导完成安装。
4. 从开始菜单或桌面快捷方式启动 CodePet。

### 首次使用

1. 跟随新手引导（每步可跳过）。
2. 查看首页今日提醒与工作状态摘要。
3. 可选：在「本地 AI」配置 Ollama。
4. 可选：在「任务监控」配置 Agent CLI。
5. 可选：在「角色」导入宠物素材。

### 卸载

通过 Windows「设置 → 应用」卸载 CodePet。

卸载后用户数据可能仍保留在：

```text
%APPDATA%\dev.codepet.app\codepet\
```

如需彻底删除本地提醒、数据库、导入宠物与记忆，请手动删除该目录。

---

## 开发者本地运行

### 环境要求

- Node.js 20+
- pnpm 9+
- Rust stable
- Tauri v2 Windows 构建依赖（WebView2、WiX / NSIS 等，仅打包时需要）

### 开发模式

```bash
git clone <your-repo-url>
cd codepet
pnpm install
cd apps/desktop
pnpm tauri dev
```

### 本地构建安装包

```bash
cd apps/desktop
pnpm install   # 若未在根目录安装
pnpm build
pnpm tauri build
```

产物目录：

```text
apps/desktop/src-tauri/target/release/bundle/msi/
apps/desktop/src-tauri/target/release/bundle/nsis/
```

### 仅验证前端

```bash
pnpm --filter @codepet/desktop build
```

---

## macOS / Linux

当前**未正式提供**安装包。开发者可尝试从源码 `pnpm tauri dev` / `pnpm tauri build`，兼容性自行验证。

---

## Alpha 说明

当前发布版本为 **Local Alpha**，不保证完全稳定。遇到问题请到 GitHub Issues 反馈。

更多发布流程见 [release.md](release.md)。
