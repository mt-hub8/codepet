import { NavIcon } from "../shared/icons/NavIcons";
import { useApp } from "./AppProvider";
import { navItems, type AppRoute } from "./navigation";

export function Sidebar() {
  const { currentRoute, navigate } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden>
          CP
        </div>
        <div className="sidebar-brand-text">
          <strong>CodePet</strong>
          <span>本地桌面伙伴</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="主导航">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-item${currentRoute === item.id ? " active" : ""}`}
            onClick={() => navigate(item.id)}
          >
            <NavIcon route={item.id as AppRoute} />
            {item.label}
          </button>
        ))}
      </nav>

      <UserCard onOpenSettings={() => navigate("settings")} />
    </aside>
  );
}

type UserCardProps = {
  onOpenSettings: () => void;
};

function UserCard({ onOpenSettings }: UserCardProps) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-card-avatar" aria-hidden>
          北
        </div>
        <div className="user-card-info">
          <strong>张小北</strong>
          <span>本地模式</span>
        </div>
      </div>
      <span className="user-card-badge">Pro 会员占位</span>
      <button type="button" className="cp-btn cp-btn-sm" onClick={onOpenSettings}>
        打开设置
      </button>
    </div>
  );
}
