# 已知问题

CodePet v1.0 Public Beta 的已知限制与常见问题。反馈请使用 [GitHub Issues](https://github.com/mt-hub8/codepet/issues)。

---

## 安装与平台

1. **Windows 未代码签名** — 安装时可能提示「未知发布者」。请点击「更多信息」→「仍要运行」。本阶段不提供代码签名。
2. **macOS / Linux 暂未正式支持** — 无官方安装包，需从源码构建，兼容性自行验证。
3. **杀毒软件误报** — 未签名安装包可能被部分安全软件拦截，请从官方 GitHub Releases 下载。
4. **Public Beta** — 可能存在崩溃、兼容性或 UI 细节问题，欢迎提交 Bug 报告。

---

## 可选依赖

5. **Ollama 需用户自行安装和启动** — CodePet 不会自动安装 Ollama。未安装时不影响提醒与桌宠。
6. **本地模型需用户自行 pull** — 例如 `ollama pull qwen3:0.6b`。CodePet 不会自动下载模型。
7. **Codex / Cursor / Claude Code 需用户自行安装和配置** — 在设置或依赖诊断中填写 CLI 路径。未配置不影响基础功能。

---

## 功能限制

8. **等待确认检测可能不完全准确** — 不同 CLI 的 stdout/stderr 格式不同，关键词检测存在误判或漏判可能。CodePet 不会替用户确认权限。
9. **Windows 路径和权限** — 工作目录权限、路径含空格或特殊字符可能影响命令监控。
10. **宠物素材版权** — 用户导入的素材版权与授权由用户自行确认，CodePet 不对第三方素材负责。
11. **远程 Ollama** — 若将 API 地址改为非 localhost，聊天与 AI 生成内容可能发送到远程服务。

---

## 数据与卸载

12. **卸载后数据可能保留** — 卸载应用不会自动删除 `%APPDATA%\dev.codepet.app\codepet\` 下的本地数据，需手动删除以彻底清理。

---

## 截图与文档

13. **README 截图占位** — 部分截图需维护者按 [demo.md](demo.md) 清单人工补充。

---

## 不在本版本范围

- 自动更新
- 代码签名
- AI 语音 / TTS
- Skill 系统、角色工作室、多角色圆桌
- 在线素材市场
- 应用内遥测

详见 [roadmap.md](roadmap.md)。
