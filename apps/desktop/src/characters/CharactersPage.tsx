import { defaultRolePresets } from "./rolePresets";
import { roleAccentMap } from "../design/theme";
import { memoryScopeLabel } from "../shared/utils/memoryScopeLabel";

export function CharactersPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>角色</h1>
        <p>当前为轻量角色预设展示。完整角色工作室、Skill 绑定和记忆系统将在后续版本开放。</p>
      </header>

      <div className="v04-banner">
        本阶段仅提供角色入口与轻量展示，不包含系统规则编辑器、Skill 绑定、共享记忆或角色融合。
      </div>

      <div className="role-card-grid">
        {defaultRolePresets.map((role) => {
          const accent = roleAccentMap[role.accent];
          return (
            <article key={role.id} className="cp-card role-card" style={{ borderColor: accent.soft }}>
              <h3>{role.name}</h3>
              <p>{role.description}</p>
              <div className="role-card-footer">
                <span className="cp-tag cp-tag-muted">{memoryScopeLabel(role.memoryScope)}</span>
                <div className="role-card-tools">
                  {role.tools.map((tool) => (
                    <span key={tool} className="cp-tag" style={{ background: accent.soft, color: accent.color }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" className="cp-btn cp-btn-sm" disabled>
                进入详情（即将开放）
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
