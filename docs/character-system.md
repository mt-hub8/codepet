# Character 与 Persona 系统

Character（角色外观）表示角色看起来是什么样子。Persona（人格设定）表示角色如何表达、如何说话、如何回应用户。

V0.0 和早期版本不实现复杂角色系统，只保留目录、示例配置和边界说明。

## V0.3.5 轻量角色预设

V0.3.5 在首页和角色页展示 4 个默认角色预设：

- 严格工程师
- 产品经理
- 学习教练
- 陪伴模式

这些仅为 UI 入口与轻量展示，不包含：

- 系统规则编辑器
- Skill 绑定
- 角色私有记忆或共享记忆
- 角色融合或圆桌讨论

完整角色工作室将在后续版本实现。

## Character

Character 关注视觉资源和状态，可以包含：

- `idle`
- `thinking`
- `happy`
- `warning`
- `error`
- `sleeping`

这些状态后续可以对应不同图片、动画或 Live2D / 其他桌宠资源，但 V0.0 不接入任何运行逻辑。

## Persona

Persona 关注人格、语气、提醒风格和系统提示词。它不应该保存角色外观资源。

## 分离原则

角色外观和人格设定必须分离，避免后续代码混乱。一个 Character 可以搭配不同 Persona，一个 Persona 也可以换不同 Character。

## 宠物素材规划（后续）

V0.4.5 及之后计划支持：

- 导入 `pet.json` + `spritesheet.png` / `webp`
- 支持 Petdex / Codex-compatible 宠物包
- 支持用户上传 spritesheet 后通过表单补全 `pet.json`
- 支持后续 hatch-pet 风格提示词向导

**默认不内置第三方素材。** 用户需要自行确认素材版权和使用权限。

V0.3.5 不实现：

- zip 导入
- `pet.json` 解析
- spritesheet 切帧
- 动画播放器
- hatch-pet
- AI 生成宠物图像

## 后续能力

- 支持用户导入角色卡。
- 支持角色和 Skill 绑定。
- 支持角色基础配置。
- 支持不同状态的外观资源。
