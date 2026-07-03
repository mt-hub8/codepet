# 贡献指南

感谢你关注 CodePet。当前项目处于 V0.0 Open Source Product Skeleton（开源产品骨架）阶段，重点是保持结构清晰、边界明确、默认体验简单。

## 基本原则

- 文档和说明文字优先使用中文。
- 新功能应先确认版本阶段，避免过早实现复杂能力。
- UI 不直接写业务逻辑，业务能力应放在对应模块中。
- 外部工具接入应放在 `integrations` 下，并通过统一 Adapter（适配器）接口演进。
- 不提交本地数据库、日志、模型文件、密钥或 `.env` 文件。

## 本地开发

```bash
cd apps/desktop
pnpm install
pnpm tauri dev
```

## 提交建议

当前阶段建议使用：

```text
chore: initialize CodePet open source product skeleton
```

