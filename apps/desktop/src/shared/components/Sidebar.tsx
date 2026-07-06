import { NavIcon } from "../icons/NavIcons";
import { useApp } from "../../app/AppProvider";
import { navItems, type NavItem } from "../../app/navigation";
import { IconChevronRight, IconPaw, IconStar } from "../../home/HomeIcons";

export function Sidebar() {
  const { currentRoute, navigate } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden>
          <IconPaw size={18} />
        </div>
        <strong className="sidebar-brand-title">CodePet</strong>
      </div>

      <nav className="sidebar-nav" aria-label="主导航">
        {navItems.map((item: NavItem) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-item${currentRoute === item.id ? " active" : ""}`}
            onClick={() => navigate(item.id)}
          >
            <NavIcon route={item.id} size={22} />
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
    <button type="button" className="user-card" onClick={onOpenSettings}>
      <div className="user-card-avatar" aria-hidden>
        北
      </div>
      <div className="user-card-info">
        <strong>张小北</strong>
        <span className="user-card-badge">
          <IconStar />
          Pro 会员
        </span>
      </div>
      <IconChevronRight className="user-card-chevron" />
    </button>
  );
}
