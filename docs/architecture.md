# 架构原则

CodePet 的架构目标是轻量、本地优先、模块化、可扩展。V0.0 不实现复杂业务，只先把边界放清楚，避免后续把所有逻辑堆进 UI 或桌宠入口。

V0.1 在这个基础上加入 Desktop Pet Shell MVP（桌宠壳子 MVP）：小尺寸桌面窗口、拖动、置顶、托盘、关闭隐藏到托盘、基础状态和气泡展示。它仍然只是桌面入口，不包含提醒调度、本地模型、外部 Agent 监控、记忆或多角色工作流。

## 核心原则

1. Core（核心层）保持轻量，只负责启动、模块编排、基础事件和必要配置。
2. UI 不直接写业务逻辑。React 组件负责展示和交互，业务规则放在对应模块中。
3. Local-first（本地优先）是默认方向：用户数据、提醒、任务历史和记忆应优先保存在本机。
4. 功能模块化，每个能力有清晰目录和边界。
5. 事件驱动。模块之间优先通过事件传递状态，而不是互相直接调用内部实现。
6. 高级能力通过 Feature Flag（功能开关）控制，默认关闭实验性能力。
7. 默认体验必须简单，普通提醒用户不应该被复杂 Agent 能力打扰。
8. 桌宠只是入口，不是所有业务逻辑的垃圾桶。

## 模块边界

- `reminders`：提醒模块，后续负责喝水、休息、学习、工作提醒。
- `tasks`：任务模块，后续记录用户主动或外部 Agent 启动的任务。
- `pet`：桌宠展示模块，V0.1 负责桌宠状态、气泡 UI、状态测试面板和拖动触发。
- `characters`：Character（角色外观）模块，只关注视觉状态和资源。V0.1 只放默认占位外观。
- `personas`：Persona（人格设定）模块，关注说话方式和人格配置。
- `skills`：Skill（技能）模块，关注可配置能力和权限边界。
- `memory`：记忆模块，后续负责本地记忆管理、查看、删除和导出。
- `workflows`：Workflow（工作流）模块，后续承载多步骤任务和多角色协作。
- `integrations`：外部工具集成模块。
- `storage`：本地存储模块，后续统一管理 SQLite 和文件存储。
- `shared`：通用类型和服务封装。V0.1 中窗口拖动、置顶等桌面能力通过 `desktopWindowService` 访问。

## V0.1 桌面能力边界

V0.1 的置顶、显示、隐藏、关闭隐藏到托盘、退出等能力由 Tauri / Rust 侧承载。前端通过轻量服务调用命令，不直接关心平台细节。

状态演示使用 `PetState` 类型：

- `idle`：待机。
- `focusing`：专注。
- `reminding`：提醒。
- `success`：完成。
- `warning`：警告。

这些状态当前只用于 UI 演示，不触发真实提醒、调度或任务监控。

`Codex`、`Cursor`、`Claude Code` 都属于 `integrations` 下的外部 Agent 适配器。后续任何外部 Agent 接入都应该通过统一 Adapter（适配器）接口，而不是把逻辑写死在 UI 组件里。

## 外部 Agent Adapter 方向

后续 Adapter 可以统一暴露：

- `startTask`
- `stopTask`
- `getStatus`
- `readLogs`
- `detectNeedsUserInput`

Codex / Cursor / Claude Code / Generic Command Monitor（通用命令监控）都应该走同一类接口，方便 UI、提醒模块和任务模块复用。

## 通用事件类型草案

后续事件类型可以包括：

- `ReminderTriggered`
- `TaskStarted`
- `TaskCompleted`
- `TaskFailed`
- `AgentNeedsUserInput`
- `AgentOutputReceived`
- `MemoryCreated`
- `SkillSuggested`
- `WorkflowStarted`
- `RoundtableStarted`

这些事件只是 V0.0 的设计草案，不代表当前已经实现。
