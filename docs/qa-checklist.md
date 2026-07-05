# QA 验收清单

CodePet v1.0 Public Beta 发布前人工验收清单。可在 Issue 或 PR 中引用本文件。

**环境建议**：Windows 10/11 干净虚拟机 + 安装包版本；开发者模式额外验证 `pnpm tauri dev`。

---

## 1. 基础启动

- [ ] 安装包能安装（MSI 或 NSIS）
- [ ] 应用能启动
- [ ] 系统托盘可用（显示 / 隐藏 / 退出）
- [ ] 桌宠窗口可显示
- [ ] 桌宠可拖动
- [ ] 关闭主窗口后按设计隐藏到托盘（不直接退出）
- [ ] 窗口置顶切换正常

## 2. 新手引导

- [ ] 首次启动出现 8 步引导
- [ ] 可以跳过（全程或单步）
- [ ] 设置页可重新打开引导
- [ ] `onboarding_completed` 等状态能保存

## 3. 提醒系统

- [ ] 默认提醒显示
- [ ] 可以创建提醒
- [ ] 可以编辑提醒
- [ ] 可以禁用 / 启用提醒
- [ ] 可以播放提示音
- [ ] 可以导入自定义提示音
- [ ] 提醒历史正常记录

## 4. 本地 AI

- [ ] Ollama 未安装时提示友好，应用不崩溃
- [ ] Ollama 未启动时提示友好
- [ ] Ollama 有模型时可以检测并选择
- [ ] 本地聊天可用（启用 AI 后）
- [ ] AI 提醒文案生成可用（可选验证）

## 5. 命令监控

- [ ] 可以创建命令任务
- [ ] 可以运行成功命令（如 `echo ok`）
- [ ] 可以运行失败命令（如 `exit 1`）
- [ ] 捕获 stdout
- [ ] 捕获 stderr
- [ ] 可以取消任务
- [ ] 可以重新运行任务
- [ ] 可以查看任务日志 / 事件

## 6. Agent 监控

- [ ] Codex CLI 未安装时不崩溃
- [ ] Cursor CLI 未安装时不崩溃
- [ ] Claude Code CLI 未安装时不崩溃
- [ ] 自定义 CLI 路径保存正常
- [ ] 等待确认检测可用（或已知限制可接受）
- [ ] 长时间无输出检测可用

## 7. 宠物系统

- [ ] 默认宠物可用
- [ ] 可导入 `pet.json` + `spritesheet.png`
- [ ] 可导入 `pet.json` + `spritesheet.webp`
- [ ] 动画预览可用
- [ ] 设置当前宠物可用
- [ ] 可删除用户导入宠物
- [ ] 删除当前宠物后回退默认宠物

## 8. 宠物孵化提示词

- [ ] 可填写表单
- [ ] 可切换模板
- [ ] 可生成提示词
- [ ] 可复制提示词
- [ ] 示例填充可用
- [ ] 可跳转导入宠物

## 9. 工作状态中心

- [ ] 首页今日概览显示
- [ ] 详情页最近事件显示
- [ ] 简单建议显示
- [ ] 不显示 API Key / 密码等敏感内容

## 10. 基础行为记忆

- [ ] 设置页能查看记忆列表
- [ ] 能删除单条记忆
- [ ] 不记录 API Key
- [ ] 不记录密码
- [ ] 不记录 Token

## 11. 依赖诊断

- [ ] Git 检测
- [ ] Node.js 检测
- [ ] pnpm 检测
- [ ] Ollama / API / 模型检测
- [ ] Codex / Cursor / Claude Code 检测
- [ ] 复制脱敏诊断信息
- [ ] 打开日志目录
- [ ] 打开数据目录
- [ ] 重新检测不导致应用崩溃

## 12. 隐私和数据

- [ ] 用户数据不进入安装包
- [ ] 日志目录可查看
- [ ] 数据目录可查看
- [ ] 诊断信息已脱敏
- [ ] `.gitignore` 覆盖 `*.sqlite`、`logs/`、`pets/` 等
- [ ] 仓库中无用户数据库 / 日志误提交

## 13. CI / Release

- [ ] `pnpm --filter @codepet/desktop build` 通过
- [ ] `cd apps/desktop && pnpm tauri build` 通过
- [ ] `.github/workflows/release.yml` 存在
- [ ] `.github/workflows/build.yml` 存在
- [ ] Release Notes 模板完整（见 [release.md](release.md)）
- [ ] CHANGELOG 含 v1.0 Public Beta 记录

---

## 验收签字（可选）

| 项目 | 验收人 | 日期 | 结果 |
|------|--------|------|------|
| Windows 安装包 | | | |
| 核心功能冒烟 | | | |
| 文档与模板 | | | |

---

## v1.0.0-beta.1 RC 验收记录（2026-07-05）

以下为 Release Candidate 自动化 / 静态检查结果。标有 **人工** 的项需在安装包环境中实测。

| # | 检查项 | 结果 | 说明 |
|---|--------|------|------|
| 1 | 应用能启动 | **人工** | 需 `pnpm tauri dev` 或安装包 |
| 2 | 首页能打开 | ✅ 静态 | 路由 `home` → `HomePage` |
| 3 | 桌宠能显示 | **人工** | `PetShell` 独立窗口 |
| 4 | 新手引导 | ✅ 静态 | `OnboardingLiteModal` + `memoryService` 状态键 |
| 5 | 提醒能创建 | ✅ 静态 | `RemindersPage` + `reminderService` |
| 6 | 提示音能播放 | **人工** | 需音频设备 |
| 7 | Ollama 未安装友好提示 | ✅ 静态 | `dependencyErrorMessages` + 引导第 5 步 |
| 8 | 命令监控创建任务 | ✅ 静态 | `CommandTaskPanel` + `commandService` |
| 9–10 | 成功/失败命令状态 | **人工** | 需本机执行命令 |
| 11 | 依赖诊断页 | ✅ 静态 | 路由 `dependency-doctor` |
| 12 | 宠物素材库 | ✅ 静态 | 路由 `characters` |
| 13 | 孵化提示词 | ✅ 静态 | 路由 `pet-hatch` |
| 14 | 工作状态中心 | ✅ 静态 | 路由 `work-status` |
| 15 | 基础记忆查看删除 | ✅ 静态 | `BasicMemoryPanel` |
| 16 | 诊断信息脱敏 | ✅ 静态 | `sanitizePath` + 不含聊天/提醒正文 |
| 17 | 设置页入口 | ✅ 静态 | 路由 `settings` |
| 18 | `release.yml` | ✅ | 已更新 beta.1 文案 |
| 19 | Issue 模板 | ✅ | 3× yml + config.yml |
| 20 | PR 模板 | ✅ | `.github/PULL_REQUEST_TEMPLATE.md` |
| — | `pnpm build` | ✅ | 本机通过 |
| — | `pnpm tauri build` | ⚠️ | 本机无 Rust/Cargo；非代码问题，CI 可构建 |
