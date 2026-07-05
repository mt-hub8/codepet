# 快速开始

本文面向**已安装 CodePet Windows 安装包**的普通用户。开发者请见 [install.md](install.md)。

CodePet 当前为 **V1.0 Public Beta** 版本。

---

## 第一次打开

1. 从开始菜单启动 **CodePet**。
2. 首次启动会显示 **8 步新手引导**（每步可跳过，设置页可重新打开）。
3. 引导会说明：
   - CodePet 是什么
   - 哪些功能零配置可用（提醒、桌宠、提示音、宠物导入）
   - 哪些依赖是可选的（Ollama、Codex、Cursor、Claude Code）
4. 进入首页后，你会看到问候、工作状态、今日提醒与最多 1–2 条系统状态提示。

---

## 零配置即可使用

以下功能**不需要**安装 Ollama 或 Agent CLI：

- 桌宠悬浮窗口
- 喝水 / 休息 / 学习 / 工作提醒
- 自定义提示音
- 本地宠物素材导入

首次启动会自动创建默认提醒模板。

---

## 依赖诊断（推荐）

在 **设置 → 依赖检测**，或引导中的 Ollama / Agent 步骤，可打开 **依赖诊断页**：

- 检测 Git、Node.js、pnpm
- 检测 Ollama API 与本地模型
- 检测 Codex / Cursor / Claude Code CLI
- 查看应用版本、数据目录、日志目录
- 复制**已脱敏**诊断信息（不含聊天记录、提醒正文、完整命令日志）

检测失败**不会**导致应用不可用。

---

## 配置 Ollama（可选）

1. 在本机安装并启动 [Ollama](https://ollama.com/)。
2. 终端运行：`ollama pull qwen3:0.6b`
3. 点击 **本地 AI** → 检测连接 → 选择模型并启用。
4. 或在 **依赖诊断** 中重新检测。

## 配置 Agent CLI（可选）

1. 打开 **设置 → Agent 工具** 或 **任务监控 → 依赖诊断**。
2. 填写 Codex / Cursor / Claude Code CLI 路径并重新检测。
3. 创建任务后由你主动点击启动（CodePet 不会自动执行或自动确认）。

## 导入宠物（可选）

1. 点击 **角色** → **导入宠物**（需 `pet.json` + spritesheet）。
2. 或使用 **宠物孵化向导** 生成提示词，到外部工具生成素材后再导入。
3. 请自行确认素材版权与使用权限。

## 工作状态中心

首页「今日工作状态」展示摘要，点击「查看详情」进入二级页面。

## 设置

设置页分组：基础设置、本地 AI、Agent 工具、宠物与素材、隐私与数据。可重新打开新手引导、打开数据/日志目录、查看诊断信息。

---

## 开发者启动

```bash
cd apps/desktop
pnpm install
pnpm tauri dev
```

测试首次引导：在设置页点击「重新打开新手引导」，或删除 `basic_memory` 中 `onboarding_completed` 记录后重启。

---

## 当前不要期待的功能

- zip 宠物包导入
- AI 直接生成宠物图片
- 自动更新、代码签名
- Skill 系统、角色私有记忆、圆桌会议（V1.5+）

## Alpha 说明

当前安装包为 Local Alpha。Windows 可能提示未知发布者；请从官方 GitHub Releases 下载。

V1.0 目标为 **Public Beta**。将重点放在稳定性、文档与反馈收集。

已知问题见 [known-issues.md](known-issues.md)。
