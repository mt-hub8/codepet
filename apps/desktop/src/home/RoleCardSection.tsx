import { defaultRolePresets } from "../characters/rolePresets";
import { roleAccentMap } from "../design/theme";
import { memoryScopeLabel } from "../shared/utils/memoryScopeLabel";
import { useApp } from "../app/AppProvider";

export function RoleCardSection() {
  const { navigate } = useApp();

  return (
    <section className="cp-section" aria-label="自定义角色">
      <div className="cp-section-header">
        <div>
          <h2>自定义角色</h2>
          <p>轻量角色预设，完整角色工作室将在后续版本开放</p>
        </div>
        <button type="button" className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate("characters")}>
          查看全部
        </button>
      </div>

      <div className="role-card-grid">
        {defaultRolePresets.map((role) => {
          const accent = roleAccentMap[role.accent];
          return (
            <article
              key={role.id}
              className="cp-card role-card"
              style={{ borderColor: accent.soft }}
              onClick={() => navigate("characters")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate("characters");
                }
              }}
              role="button"
              tabIndex={0}
            >
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
