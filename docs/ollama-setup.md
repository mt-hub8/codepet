# Ollama 设置

Ollama 是 CodePet 使用的**可选**本地模型运行方式。CodePet **不会**自动安装 Ollama，也不会自动下载模型。

**没有 Ollama 时**，提醒、桌宠、提示音与宠物导入仍可正常使用。

V0.7 起可在 **设置 → 依赖诊断** 或新手引导第 5 步检测 Ollama 状态。

## 安装 Ollama

请前往 Ollama 官方网站下载并安装适合你系统的版本：

```text
https://ollama.com
```

Windows 用户安装后，通常会自动启动本地服务。

## 检查 Ollama 是否可用

默认 API 地址：

```text
http://localhost:11434/api
```

可以在终端中运行：

```bash
ollama list
```

也可以访问：

```text
http://localhost:11434/api/tags
```

如果 CodePet 显示未检测到 Ollama，请确认 Ollama 已安装并正在运行。也可在 **依赖诊断** 页点击「重新检测」。

常见提示：

- **未检测到 Ollama**：不影响提醒与桌宠；安装后重新检测即可。
- **Ollama 已安装但未运行**：启动 Ollama 应用后重新检测。
- **没有本地模型**：在终端运行 `ollama pull qwen3:0.6b`。

## 拉取推荐模型

CodePet V0.3 只展示推荐命令，不会自动下载模型。

轻量优先：

```bash
ollama pull qwen3:0.6b
```

质量和性能平衡：

```bash
ollama pull qwen2.5:1.5b
```

轻量聊天备选：

```bash
ollama pull gemma3:1b
```

用户也可以选择自己已经安装的其他模型。

## 在 CodePet 中选择模型

1. 打开“本地 AI 设置”。
2. 点击“重新检测”。
3. 在模型列表中选择默认模型。
4. 勾选“启用本地 AI”。
5. 点击“保存本地 AI 配置”。

## 隐私提醒

默认情况下，CodePet 只连接本机 Ollama。若你把 API 地址改成远程地址，聊天内容和提醒文案生成输入可能会发送到远程服务，请自行确认隐私风险。

