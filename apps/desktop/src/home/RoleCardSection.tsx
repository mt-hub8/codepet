import { defaultRolePresets } from "../characters/rolePresets";
import { roleAccentMap } from "../design/theme";
import { memoryScopeLabel } from "../shared/utils/memoryScopeLabel";
import { useApp } from "../app/AppProvider";
import { RoleCardIcon } from "./HomeIcons";

function formatTools(tools: string[]): { visible: string[]; extra: number } {
  const visible = tools.slice(0, 3);
  const extra = Math.max(0, tools.length - 3);
  return { visible, extra };
}

export function RoleCardSection() {
  const { navigate } = useApp();

  return (
    <section className="home-section" aria-label="自定义角色">
      <div className="home-section-header">
        <h2>自定义角色</h2>
        <button type="button" className="home-primary-chip" onClick={() => navigate("characters")}>
          + 快速新建角色
        </button>
      </div>

      <div className="home-role-grid">
        {defaultRolePresets.map((role) => {
          const accent = roleAccentMap[role.accent];
          const { visible, extra } = formatTools(role.tools);
          return (
            <article
              key={role.id}
              className="home-role-card"
              onClick={() => navigate("characters")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate("characters");
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div
                className="home-role-card-icon"
                style={{ background: accent.soft, color: accent.color }}
              >
                <RoleCardIcon accent={role.accent} />
              </div>
              <h3>{role.name}</h3>
              <p>{role.description}</p>
              <div className="home-role-card-scope">
                <span className="home-role-scope-label">记忆范围：</span>
                <span className="home-role-scope-pill" style={{ background: accent.soft, color: accent.color }}>
                  {memoryScopeLabel(role.memoryScope)}
                </span>
              </div>
              <div className="home-role-card-tools">
                <span className="home-role-tools-label">擅长工具：</span>
                <div className="home-role-tool-icons">
                  {visible.map((tool) => (
                    <span key={tool} className="home-role-tool-chip">
                      {tool}
                    </span>
                  ))}
                  {extra > 0 && <span className="home-role-tool-chip">+{extra}</span>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
