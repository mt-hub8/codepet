# 架构原则

CodePet 的架构目标是轻量、本地优先、模块化、可扩展。桌宠是入口，不是所有业务逻辑的容器。

## 核心原则

1. Core（核心层）保持轻量，只负责启动、基础配置和模块编排。
2. UI 不直接写数据库、模型调用或外部工具监控逻辑。
3. Local-first（本地优先）是默认方向，提醒、提示音、本地 AI 配置优先保存在用户本机。
4. 功能模块化，每个能力有清晰目录和边界。
5. 高级能力通过 Feature Flag（功能开关）或显式设置控制。
6. 默认体验必须简单，没有 Ollama 时 CodePet 仍然可以作为提醒工具使用。
7. 外部能力必须通过 Adapter（适配器）或 service（服务层）接入，不写死在 UI 组件里。

## 当前模块边界

- `app`：应用入口、`AppProvider` 全局状态、`AppShell` 布局、`AppRoutes` 页面切换、`navigation` 导航定义。
- `home`：本地产品首页，包含问候区、今日提醒、角色卡片、最近任务摘要和桌宠状态卡片。
- `design`：设计系统 token 与通用 UI 样式（`theme.ts`、`tokens.css`、`components.css`）。
- `pet`：桌宠展示、状态、气泡 UI 和桌面交互入口。
- `characters`：轻量角色预设（`rolePresets`）与角色页占位，不含完整角色工作室。
- `reminders`：提醒配置、默认模板、轻量调度、触发历史、提示音配置和提醒管理 UI。
- `integrations/ollama`：Ollama 本地模型适配器，负责配置、检测、聊天和 AI 提醒文案生成。
- `integrations/command`：通用命令监控 MVP，负责任务创建、用户确认启动、日志展示和状态流转。
- `tasks`：任务监控页面，组合 `CommandTaskPanel`。
- `settings`：窗口与桌宠调试等基础设置页。
- `shared`：通用组件、图标、工具函数和桌面窗口服务封装。
- `storage`：后续统一承载本地存储抽象。当前 SQLite 初始化和访问在 Tauri / Rust 侧，前端通过 service 调用命令。

## V0.3.5 UI 信息架构

V0.3.5 将原先集中在 `PetShell` 的 UI 拆分为：

```
app/App.tsx          → 挂载 AppProvider + AppShell
app/AppProvider.tsx  → 提醒调度、Ollama 状态、桌宠状态（不含页面 UI）
app/AppShell.tsx     → 侧边栏 + 标题栏 + 全局提醒横幅
app/AppRoutes.tsx    → 按路由渲染页面
home/HomePage.tsx    → 默认本地首页
```

首页只展示最关键的信息，完整功能通过左侧导航进入二级页面：

- `/reminders`（状态路由 `reminders`）→ 提醒管理
- `/local-ai` → Ollama 设置与本地聊天
- `/characters` → 轻量角色预设
- `/tasks` → 命令任务监控
- `/settings` → 窗口与桌宠调试

当前使用组件内状态路由，不引入额外路由库。

## V0.1 桌宠壳子

V0.1 的置顶、显示、隐藏、关闭隐藏到托盘、退出等能力由 Tauri / Rust 侧承载。前端通过 `desktopWindowService` 调用命令，不直接关心平台细节。

桌宠状态使用 `PetState`：

- `idle`：待机。
- `focusing`：专注。
- `thinking`：思考。
- `reminding`：提醒。
- `success`：完成。
- `warning`：警告。

## V0.2 提醒模块

V0.2 的提醒链路分层如下：

- UI 组件只负责表单、列表、历史和按钮交互。
- `reminderService` 负责校验、默认模板、提醒状态流转和历史记录。
- `reminderStorage` 负责调用 Tauri 命令，不直接暴露数据库。
- `reminderScheduler` 只负责检查到期提醒和触发统一回调，不直接写 UI。
- `pet` 负责展示状态和气泡，不保存提醒业务数据。

SQLite 表包括：

- `reminders`
- `reminder_events`
- `reminder_sounds`
- `app_meta`

## V0.4.1 通用命令监控

`integrations/command` 分层如下：

- `commandTypes`：任务与事件类型定义。
- `commandStorage`：调用 Tauri 命令读写 SQLite。
- `commandRunner`：订阅 `command-output` / `command-finished` 事件，调用启动与取消命令。
- `commandService`：任务 CRUD、危险命令确认、状态流转编排。
- `commandSafety`：高风险命令模式检测与二次确认。
- `CommandTaskPanel` / `CommandTaskForm` / `CommandLogViewer`：任务监控 UI。

进程启动、stdout / stderr 捕获和 exit code 记录在 Tauri / Rust 的 `command_monitor` 模块中。UI 不直接运行命令。

SQLite 新增表：

- `command_tasks`
- `command_events`

命令必须由用户主动点击启动。不会自动执行 AI 生成的命令，也不会后台偷偷运行。

## V0.4.2 Agent CLI Adapter + Takeover Alerts

在 V0.4.1 基础上扩展：

- `agentAdapterTypes` / `agentAdapters`：统一 `AgentCommandAdapter` 接口与注册表。
- `genericAdapter`：通用命令适配器。
- `integrations/codex`、`integrations/cursor`、`integrations/claude-code`：轻量 CLI 封装。
- `commandDetection`：可配置的等待确认关键词检测。
- `commandAlertService`：输出检测与长时间无输出轮询；有新输出后 `no_output_timeout` 恢复为 `running`。
- `dependencyDetection` / `dependencyStorage` / `DependencyCheckPanel`：依赖检测与 CLI 路径配置。
- `agent_tools`（Rust）：CLI 可执行文件检测与 `agent_tool_settings` 持久化。

`command_tasks` 扩展字段：`adapter_type`、`prompt_or_command`、`executable_path`、`no_output_timeout_minutes`。

`command_events` 新增事件类型：`needs_user_input`、`no_output_timeout`。

CodePet 通过 CLI Wrapper 监控外部工具，不做屏幕识别，不替用户确认权限，不保存 API Key。

## V0.3 Ollama 本地 AI

`integrations/ollama` 是外部本地模型适配器。

- `ollamaClient`：只负责调用 Tauri 命令。
- `ollamaService`：负责状态检测、模型列表、聊天、AI 提醒文案生成和错误转换。
- `ollamaSettingsStorage`：负责本地 AI 配置持久化。
- `OllamaSettingsPanel`：负责设置 UI。
- `LocalChatPanel`：负责聊天 UI。
- `LocalAiPage`：组合设置与聊天入口。

Ollama HTTP 请求封装在 Tauri / Rust 侧，前端不直接请求 Ollama。这样可以避免浏览器 CORS 问题，也能把“只请求用户配置的 Ollama 地址”集中在后端命令中。

本地 AI 配置保存在 SQLite 的 `local_ai_settings` 表中。默认地址是：

```text
http://localhost:11434/api
```

提醒系统可以通过明确接口请求 AI 文案生成，但不能直接依赖 Ollama HTTP 细节。AI 生成的提醒文案只填入表单，必须由用户点击保存后才写入提醒配置。

## 角色与宠物素材（V0.4.5）

`characters/` 模块负责宠物素材导入与渲染：

- `petManifestParser`：解析 `pet.json`，补全默认 grid / animations。
- `petAssetService` / `petAssetStorage`：导入、删除、设置当前宠物。
- `SpritePetRenderer` / `ActivePetRenderer`：spritesheet 动画与桌宠联动。
- `PetAssetLibraryPage`：宠物库 UI。

Rust `pet_assets` 模块将文件复制到 `{app_data}/codepet/pets/<id>/`，元数据写入 `pet_assets` 表。`current_pet_id` 存在 `app_meta`。

默认不内置第三方社区素材。用户自行确认版权。不上传导入素材。

## V0.5 本地 Alpha 模块

- `work-status/`：工作状态中心与首页摘要。
- `memory/`：基础行为记忆。
- `onboarding/`：新手引导 Lite。
- `characters/hatch/`：宠物孵化提示词向导（复用 V0.4.5 导入，不重做 parser / renderer）。
- `integrations/command/DependencyCheckLite.tsx`：设置页轻量依赖检测。

## 外部 Agent 边界

Codex / Cursor / Claude Code 适配器只负责构造命令和检测输出，不直接操作 UI，不自动确认权限，不自动执行 AI 生成的命令。用户可自定义 CLI 路径与等待确认关键词。未安装对应 CLI 时显示友好提示，应用不崩溃。

宠物孵化提示词向导规划在 V0.4.6。AI 生成宠物规划在后续版本。
