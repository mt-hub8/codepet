# 贡献指南

感谢你对 CodePet 的关注。本文说明如何参与开发与提交贡献。

## 项目定位

CodePet 是一个**本地优先**的 AI 桌面伙伴：桌宠、提醒、本地 AI（Ollama）、命令 / Agent 监控、宠物素材。默认不上传用户数据，不做遥测。

当前阶段为 **v1.0 Public Beta**，优先修 bug、文档与稳定性，而非堆新功能。

## 本地开发环境

- Node.js 20+
- pnpm 9+
- Rust stable（Tauri v2）
- Windows：WebView2（通常已预装）

```bash
git clone https://github.com/mt-hub8/codepet.git
cd codepet
pnpm install
cd apps/desktop
pnpm tauri dev
```

## 分支与提交规范

- 从 `main` 拉取最新代码后创建功能分支，例如 `fix/reminder-sound`、`docs/readme-beta`
- 提交信息建议：`feat:`、`fix:`、`docs:`、`chore:`、`refactor:`（小写前缀 + 简短说明）
- 一个 PR 聚焦一类改动，避免混合无关修改

## 如何运行

```bash
# 仅前端构建验证
pnpm --filter @codepet/desktop build

# 完整桌面应用
cd apps/desktop
pnpm tauri dev
```

## 如何构建安装包

```bash
cd apps/desktop
pnpm build
pnpm tauri build
```

产物：`apps/desktop/src-tauri/target/release/bundle/msi/` 与 `nsis/`。

## 如何提交 PR

1. Fork 本仓库并推送分支
2. 确保本地 `pnpm --filter @codepet/desktop build` 通过
3. 若改动涉及 Tauri / Rust，尽量验证 `pnpm tauri build`
4. 使用 PR 模板填写说明与 Checklist
5. 关联相关 Issue（如有）

## 文档语言

- **主体使用中文**
- 必要技术名词可保留英文（如 Ollama、CLI、MSI、Tauri）
- 用户面向文档保持简洁、可执行

## 禁止提交

以下内容**不得**进入仓库：

- `.env`、`.env.local`
- `*.sqlite`、`*.db`
- `logs/`、`*.log`
- `sounds/`、`user-sounds/`（用户导入音频）
- `pets/`、`user-pets/`（用户宠物素材）
- `chat-records/`、`local-chat/`
- 第三方无授权宠物素材或角色图片
- API Key、Token、密码

## 功能边界

- **新功能请先开 Issue 讨论**，避免大范围未经讨论的 PR
- 不要把首页做臃肿
- 不要默认上传用户数据
- 不要引入遥测 / 自动更新（除非路线图明确）
- 不要自动执行危险命令；命令监控需用户主动启动
- 不要保存用户 API Key
- Public Beta 阶段优先稳定性与文档，而非新业务能力

## 报告问题

- [Bug 报告](.github/ISSUE_TEMPLATE/bug_report.yml)
- [功能建议](.github/ISSUE_TEMPLATE/feature_request.yml)
- [安全问题](SECURITY.md)

## 相关文档

- [架构原则](docs/architecture.md)
- [QA 清单](docs/qa-checklist.md)
- [隐私说明](docs/privacy.md)
