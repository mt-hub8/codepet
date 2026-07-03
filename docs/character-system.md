# Character 与 Persona 系统

Character（角色外观）表示角色看起来是什么样子。Persona（人格设定）表示角色如何表达、如何说话、如何回应用户。

V0.0 和早期版本不实现复杂角色系统，只保留目录、示例配置和边界说明。

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

## 后续能力

- 支持用户导入角色卡。
- 支持角色和 Skill 绑定。
- 支持角色基础配置。
- 支持不同状态的外观资源。

