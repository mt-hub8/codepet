# GitHub Desktop 工作流

本项目默认由用户通过 GitHub Desktop 手动提交，AI 助手不要自动执行 `git commit` 或 `git push`。

## 添加本地仓库

1. 打开 GitHub Desktop。
2. 选择 `File` -> `Add local repository`。
3. 选择本地 `codepet` 目录。
4. 如果 GitHub Desktop 提示尚未初始化仓库，可以按提示创建本地仓库。

## 查看 Changes

在左侧 `Changes` 面板查看所有变更文件。提交前请确认每个文件都是你想提交的内容。

## 写 Summary

`Summary` 用一句话说明本次提交。当前阶段建议填写：

```text
chore: initialize CodePet open source product skeleton
```

## 写 Description

`Description` 可以写本次初始化内容，例如：

```text
- 初始化 Tauri v2 + React + TypeScript 桌面应用骨架
- 添加中文 README、架构文档、路线图和隐私说明
- 预留角色、技能、记忆、工作流和外部 Agent 集成目录
- 添加 GitHub Actions 基础构建检查
```

## Commit to main

确认 Changes 没有问题后，点击 `Commit to main`。

## Publish repository

如果这是第一次发布到 GitHub，点击 `Publish repository`，选择仓库名称和可见性，然后发布。

## Push origin

如果远程仓库已经存在，提交后点击 `Push origin` 推送到 GitHub。

## 避免误提交

提交前确认不要包含：

- `node_modules`
- `target`
- `dist`
- `.env`
- 本地数据库文件
- 模型文件
- 日志文件

项目必须包含合理的 `.gitignore`，避免误提交大文件和隐私文件。

