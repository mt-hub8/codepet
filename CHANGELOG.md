# Changelog

所有重要变更会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## 1.0.0-beta.1 — CodePet v1.0.0-beta.1 Public Beta（Release Candidate）

**第一个公开 Beta 发布候选**。不新增核心业务功能。

### 发布准备

- 版本：代码 `1.0.0`，标签 `v1.0.0-beta.1`
- `docs/release.md`：beta.1 Release Notes 与人工发布步骤
- `release.yml`：更新为 Public Beta 文案，支持 `v1.0.0-beta.1` tag
- README：beta.1 标注；截图改为占位表（避免 broken image）
- `tauri.conf.json`：安装包描述更新为 Public Beta

### 验收

- `pnpm --filter @codepet/desktop build` 通过
- `pnpm tauri build` 需在已安装 Rust 的环境验证（CI release workflow 可构建）

### 说明

- 不自动打 tag / 发布 Release
- Windows 安装包仍未代码签名

## 1.0.0 — CodePet v1.0 Public Beta Readiness

**公开 Beta 发布准备**。本版本不新增核心业务功能，聚焦文档、模板、验收与开源项目包装。

### 新增

- README 公开展示首屏：定位、功能、下载、隐私、限制、反馈入口
- `docs/demo.md` — 3 / 10 分钟演示路线与截图清单
- `docs/qa-checklist.md` — 发布前 QA 验收清单
- `docs/known-issues.md` — 已知问题与 Beta 限制
- `CONTRIBUTING.md`、`SECURITY.md`
- GitHub Issue 模板（Bug、功能建议、宠物素材）与 PR 模板
- `docs/assets/screenshots/` 截图目录与占位说明
- V1.0 Public Beta Release Notes 模板（`docs/release.md`）

### 变更

- 版本号统一为 `1.0.0`（文档标注 **CodePet v1.0 Public Beta**）
- `docs/roadmap.md` 收敛后续大阶段（V1.1 / V1.5 / V2.0 / V3.0）
- `docs/privacy.md` 最终检查与补充

### 说明

- 不新增核心功能；不自动打 tag / 发布 Release
- Windows 安装包仍未代码签名

## 0.7.0

- 新增 8 步首次启动引导：说明零配置功能与可选依赖，每步可跳过。
- 引导状态保存：`onboarding_completed`、`onboarding_completed_at`、`onboarding_skipped`。
- 新增依赖诊断页：Git、Node.js、pnpm、Ollama、Agent CLI 与应用环境。
- 新增诊断信息区域：复制脱敏报告、打开数据/日志目录、重新检测、清除检测缓存。
- 统一常见依赖错误中文提示。
- 设置页分组：基础、本地 AI、Agent、宠物、隐私与数据。
- 首页轻量系统状态提示（最多 2 条）。
- 更新 README、快速开始、安装、Ollama、Agent、隐私、路线图、发布文档。
- 不新增核心业务功能；不自动安装依赖、不保存 API Key。

## 0.6.0

- 新增 GitHub Actions `release.yml`：支持 tag `v*` 与 `workflow_dispatch` 触发 Windows 安装包构建。
- Windows 发布产物：WiX `.msi` 与 NSIS `-setup.exe`（推荐 MSI）。
- 同步版本号至 0.6.0；补充占位应用图标（后续替换正式图标）。
- 更新 README 下载区、install.md、release.md、privacy.md、roadmap.md。
- 不新增产品功能；不包含用户运行期数据。

## 0.5.0

- 本地 Alpha 收敛：整合 Agent CLI 监控、接管提醒、依赖检测 Lite、宠物孵化向导、工作状态中心、基础行为记忆、新手引导 Lite。
- 依赖检测 Lite 新增 Ollama 检测；设置页与引导页可访问。
- 宠物孵化提示词向导：生成 hatch-pet / 图像模型提示词，复用 V0.4.5 导入流程。
- 工作状态中心：首页摘要 + 二级详情页（今日概览、事件流、规则建议）。
- 基础行为记忆：`basic_memory` 表，可查看与删除。
- 新手引导 Lite：可跳过，设置页可重新打开。
- 更新 README、架构、路线图、快速开始、隐私与角色文档。

## 0.4.5

- 新增宠物素材导入：支持 `pet.json` + spritesheet.png / webp 文件夹导入。
- 兼容 Petdex / Codex-compatible 最小格式；默认 8×9 / 192×208 网格推断。
- 新增 `SpritePetRenderer`、动画状态预览、设为当前桌宠。
- 桌宠状态与 spritesheet 动画联动；内置默认占位桌宠不可删除。
- SQLite 新增 `pet_assets` 表；`app_meta` 保存 `current_pet_id`。
- 更新 README、架构、路线图、快速开始、角色系统文档与隐私说明。

## 0.4.2

- 新增 Codex / Cursor / Claude Code 轻量 CLI Adapter，统一 `AgentCommandAdapter` 接口。
- 支持用户自定义 CLI 可执行路径与等待确认关键词。
- 等待用户确认检测：任务状态 `needs_user_input`，桌宠气泡与提示音提醒，不自动确认。
- 长时间无输出检测：任务状态 `no_output_timeout`，默认 5 分钟，不自动 kill 进程。
- 依赖检测面板：Git、Node.js、pnpm、Codex / Cursor / Claude Code CLI。
- 首页最近任务支持等待确认、长时间无输出、已取消等状态。
- 可选手动「用本地 AI 总结失败原因」按钮。
- SQLite 扩展 `command_tasks` 字段与 `agent_tool_settings` 表。
- 更新 README、架构文档、路线图、快速开始、隐私说明与 Agent 接入文档。

## 0.4.1

- 新增 Generic Command Monitor MVP（通用命令监控 MVP）。
- 支持创建命令任务、用户确认启动、取消、重新运行和删除。
- 捕获 stdout / stderr，记录 exit code，本地 SQLite 保存任务与事件。
- 命令完成或失败时更新桌宠状态、气泡和首页最近任务摘要。
- 高风险命令二次确认；不上传命令、日志或代码到云端。
- 更新 README、架构文档、路线图、快速开始和隐私说明。

## 0.3.5

- 重构本地产品 UI：左侧简洁导航 + 右侧主工作台。
- 新增本地首页，包含问候区、今日提醒、角色卡片、任务状态占位和桌宠状态卡片。
- 抽离设计系统 token 到 `design/` 目录。
- `App.tsx` 减负：`AppProvider` 管理全局状态，`AppShell` 负责布局，`AppRoutes` 负责页面切换。
- 新增轻量角色预设展示（4 个默认角色），不含完整角色工作室。
- 新增任务监控占位页，不含真实命令监控。
- 保留 V0.1 桌宠拖动、置顶、托盘；V0.2 提醒与提示音；V0.3 Ollama 本地 AI。
- 更新 README、架构文档、路线图、快速开始和角色系统文档。

## 0.0.0

- 初始化 CodePet 开源产品骨架。
- 添加 Tauri v2 + React + TypeScript 桌面应用基础结构。
- 添加中文 README、架构文档、路线图和隐私说明。
- 预留角色、人格、技能、记忆、工作流和外部 Agent 集成目录。

## 0.1.0

- 添加 Desktop Pet Shell MVP（桌宠壳子 MVP）。
- 实现小尺寸桌面窗口、右下角附近启动、无边框窗口和基础拖动。
- 添加窗口置顶切换。
- 添加系统托盘菜单：显示 CodePet、隐藏 CodePet、切换置顶、退出。
- 关闭窗口时隐藏到托盘，托盘退出时才真正退出应用。
- 添加 `PetState` 状态类型、状态气泡、桌宠占位形象和开发阶段状态测试面板。
- 更新 README、架构文档、路线图和快速开始文档。

## 0.2.0

- 添加 Local Reminder System（本地提醒系统）。
- 支持喝水、休息、学习、工作和自定义提醒。
- 支持创建、编辑、启用 / 禁用、删除提醒。
- 首次启动初始化默认提醒模板，并通过 `app_meta` 避免重复创建。
- 提醒到时间后切换桌宠 `reminding` 状态，展示气泡并提供完成、稍后提醒、忽略操作。
- 使用 SQLite 本地保存提醒配置、提醒历史、提示音配置和应用元数据。
- 添加提醒历史列表。
- 添加默认提示音、自定义提示音导入、试听、删除和按提醒绑定提示音。
- 用户导入的提示音会复制到本机应用数据目录，不保存原始文件路径。

## 0.3.0

- 添加 Local AI via Ollama（通过 Ollama 接入本地模型）。
- 支持检测 Ollama API 地址和本地模型列表。
- 支持启用 / 关闭本地 AI、保存 Ollama API 地址和默认模型。
- 添加本地 AI 设置面板，展示推荐模型和手动 `ollama pull` 命令。
- 添加本地聊天面板，用于测试本机模型回复。
- 提醒表单支持用本地 AI 生成或改写提醒文案，用户仍需手动保存提醒。
- 桌宠新增 `thinking` 状态，用于本地模型请求中的气泡反馈。
- Ollama 请求由 Tauri / Rust 命令封装，前端不直接请求 Ollama。
