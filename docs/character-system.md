# Character 与 Persona 系统

Character（角色外观）表示角色看起来是什么样子。Persona（人格设定）表示角色如何表达、如何说话、如何回应用户。

## V0.4.5 宠物素材导入

CodePet V0.4.5 支持用户自行导入本地宠物素材包，兼容 Petdex / Codex-compatible 基础格式。

### 支持格式

- 文件夹导入：包含 `pet.json` + `spritesheet.png` 或 `spritesheet.webp`
- 单独选择 `pet.json`（自动读取同目录 spritesheet）

zip 导入规划在后续版本，本阶段不实现。

### 最小 pet.json

```json
{
  "id": "my-pet",
  "displayName": "我的桌宠",
  "description": "可选描述",
  "spritesheetPath": "spritesheet.png"
}
```

若未提供 `grid` 字段，默认推断：

- columns = 8，rows = 9
- frameWidth = 192，frameHeight = 208
- 图片尺寸为 1536×1872 时直接采用默认网格

若未提供 `animations` 字段，按行号默认映射 idle / working / thinking / waiting / done / sleeping / warning / error。

### CodePet 增强格式

可在 `pet.json` 中显式指定 `grid` 与 `animations`，见项目文档与 `examples/characters/default-pet.json`。

### 桌宠状态映射

| CodePet PetState | 动画状态 |
|------------------|----------|
| idle | idle |
| focusing | working |
| thinking | thinking |
| reminding | waiting |
| success | done |
| warning | warning |

命令失败等场景仍可能显示 warning；sleeping / error 动画可在预览中查看，后续版本可扩展运行时映射。

### 宠物孵化提示词向导（V0.5）

V0.5 新增孵化向导，**只生成提示词，不生成图片**。用户需自行到外部工具生成素材，再使用下方 V0.4.5 导入功能。CodePet 不调用 hatch-pet 或图像生成 API。

### 如何导入

1. 打开左侧导航「角色」→ 宠物素材区。
2. 点击「选择文件夹」或「选择 pet.json」。
3. 预览动画状态后点击「确认导入」。
4. 在宠物库中点击「设为当前桌宠」。

### 存储位置

导入后文件保存在本机应用数据目录：

```text
{AppData}/codePet/pets/<pet-id>/
  ├── pet.json
  └── spritesheet.png（或 webp）
```

当前桌宠 ID 保存在 SQLite `app_meta.current_pet_id`。

### 版权与安全

- CodePet **默认不内置第三方社区素材**，仅内置原创占位桌宠。
- 用户需**自行确认**导入素材的来源、版权和使用权限。
- 导入素材**默认不上传**到任何服务。
- **不要**将用户导入的宠物素材提交到 GitHub。

## V0.3.5 轻量角色预设

V0.3.5 在角色页下方展示 4 个默认人格预设（严格工程师、产品经理、学习教练、陪伴模式）。这些仅为 UI 入口，不含 Skill 绑定或记忆系统。

## Persona

Persona 关注人格、语气、提醒风格和系统提示词，不保存角色外观资源。完整 Persona 系统在后续版本实现。

## 分离原则

角色外观和人格设定必须分离。一个 Character 可以搭配不同 Persona，一个 Persona 也可以换不同 Character。

## 后续规划

- **后续版本**：zip 导入、AI 生成宠物、在线素材库（需显示作者与授权信息）
- 角色卡导入、Skill 绑定、角色记忆（V1.5+）

本阶段不实现：AI 生成宠物、在线宠物市场、Petdex 网络 API。
