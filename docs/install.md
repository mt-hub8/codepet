# 安装说明

V0.0 阶段暂未发布安装包，只支持开发者从源码启动。

## 当前要求

- Windows 优先。
- Node.js 20 或更高版本。
- pnpm 9 或更高版本。
- Rust 稳定版工具链。
- Tauri v2 所需系统依赖。

## 从源码启动

```bash
git clone <your-repo-url>
cd codepet/apps/desktop
pnpm install
pnpm tauri dev
```

## 安装包计划

V0.6 目标是通过 GitHub Release 发布 Windows 安装包。macOS / Linux 会在后续版本逐步兼容。

